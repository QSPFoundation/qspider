<#
Drives the qSpider desktop app's native Windows open dialog (IFileOpenDialog, opened by Tauri's
dialog plugin through rfd) with UI Automation.

No keystrokes: SendKeys and synthetic input land wherever focus is and depend on the keyboard
layout. The file name is set through the field's ValuePattern, read back, and the Open button is
pressed through its InvokePattern. No UI text: the dialog, the field and the button are found by
window class (#32770), AutomationId (1148: file name combo box, 1: Open) and owning process only,
never by names or labels, so the UI language does not matter. Only a dialog owned by one of
-AppPids (the app under test, from native-dialog.ts) is touched, never another window on the host.

Usage: dialog.ps1 -Path <file> -WaitSeconds <s> -AppPids <pid,pid,...>
Exit 0 once the dialog has closed after Open; exit 1 otherwise, with one message line on stderr,
then (when the dialog or its field was not found) the UIA tree of the app's #32770 windows as lines
starting with '|'. On failure every #32770 of the app is closed, so an open dialog does not keep
the app alive after the session and poison the next scenario.
#>
param(
  [Parameter(Mandatory = $true)][string]$Path,
  [double]$WaitSeconds = 10,
  # A comma list in one argument: -File passes it as a string, which [int[]] would not split.
  [Parameter(Mandatory = $true)][string]$AppPids
)

$ErrorActionPreference = 'Stop'
# UTF-8 on the console streams, so a message with a non-ASCII path (the Cyrillic fixture) reaches Node intact.
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$PollMs = 100
$script:uiaReady = $false

function Fail([string]$Message, [switch]$Dump) {
  [Console]::Error.WriteLine($Message)
  if ($script:uiaReady) {
    if ($Dump) { try { Write-Tree } catch { [Console]::Error.WriteLine("| (dump failed: $($_.Exception.Message))") } }
    try { Close-Dialogs } catch { [Console]::Error.WriteLine("| (close failed: $($_.Exception.Message))") }
  }
  exit 1
}

try {
  Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes

  $A = [System.Windows.Automation.AutomationElement]
  $Scope = [System.Windows.Automation.TreeScope]
  $pids = @($AppPids -split ',' | Where-Object { $_.Trim() -ne '' } | ForEach-Object { [int]$_.Trim() })
  if ($pids.Count -eq 0) { Fail 'no app PIDs given' }

  $pidConditions = @($pids | ForEach-Object { New-Object System.Windows.Automation.PropertyCondition($A::ProcessIdProperty, $_) })
  $ofApp = if ($pidConditions.Count -eq 1) { $pidConditions[0] } else {
    New-Object System.Windows.Automation.OrCondition(, [System.Windows.Automation.Condition[]]$pidConditions)
  }
  $isDialog = New-Object System.Windows.Automation.PropertyCondition($A::ClassNameProperty, '#32770')
  $fileNameField = New-Object System.Windows.Automation.PropertyCondition($A::AutomationIdProperty, '1148')
  $openButton = New-Object System.Windows.Automation.AndCondition(
    (New-Object System.Windows.Automation.PropertyCondition($A::AutomationIdProperty, '1')),
    (New-Object System.Windows.Automation.PropertyCondition($A::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button))
  )

  # PowerShell wraps an exception thrown by a .NET method in MethodInvocationException; look inside.
  # (A typed catch would name a UIA type before Add-Type has loaded it.)
  function Test-Gone($record) {
    for ($e = $record.Exception; $null -ne $e; $e = $e.InnerException) {
      if ($e.GetType().FullName -eq 'System.Windows.Automation.ElementNotAvailableException') { return $true }
    }
    return $false
  }

  # The app's #32770 windows: top-level ones of an app process, and ones UIA shows under the app's
  # main window (the dialog is owned by it). Children only: a full-tree search of the desktop is slow.
  function Get-Candidates {
    $candidates = @()
    foreach ($window in $A::RootElement.FindAll($Scope::Children, $ofApp)) {
      try {
        if ($window.Current.ClassName -eq '#32770') { $candidates += $window }
        foreach ($owned in $window.FindAll($Scope::Children, $isDialog)) {
          if ($pids -contains $owned.Current.ProcessId) { $candidates += $owned }
        }
      } catch {
        if (-not (Test-Gone $_)) { throw } # else the window closed while it was being read
      }
    }
    return $candidates
  }

  # The app's file dialog: a candidate that holds the file name field (AutomationId 1148), so a
  # message box or another #32770 of the app never counts. $script:sawDialog records a #32770 without it.
  $script:sawDialog = $false
  function Find-Dialog {
    foreach ($candidate in (Get-Candidates)) {
      $script:sawDialog = $true
      try {
        if ($null -ne $candidate.FindFirst($Scope::Descendants, $fileNameField)) { return $candidate }
      } catch {
        if (-not (Test-Gone $_)) { throw }
      }
    }
    return $null
  }

  # On failure: close every #32770 of the app (WindowPattern.Close, else its Cancel button, id 2).
  function Close-Dialogs {
    foreach ($candidate in (Get-Candidates)) {
      try {
        $pattern = $null
        if ($candidate.TryGetCurrentPattern([System.Windows.Automation.WindowPattern]::Pattern, [ref]$pattern)) {
          ([System.Windows.Automation.WindowPattern]$pattern).Close()
          continue
        }
        $cancel = $candidate.FindFirst($Scope::Descendants, (New-Object System.Windows.Automation.PropertyCondition($A::AutomationIdProperty, '2')))
        if ($null -ne $cancel -and $cancel.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pattern)) {
          ([System.Windows.Automation.InvokePattern]$pattern).Invoke()
        }
      } catch {
        if (-not (Test-Gone $_)) { throw }
      }
    }
  }

  # On failure: the raw UIA tree of the app's top-level windows and #32770 windows, one '|' line per element.
  function Write-Tree {
    $walker = [System.Windows.Automation.TreeWalker]::RawViewWalker
    $script:dumped = 0
    function Write-Node($element, [int]$depth) {
      if ($script:dumped -ge 400) { return }
      $script:dumped++
      $c = $element.Current
      $name = [string]$c.Name
      if ($name.Length -gt 60) { $name = $name.Substring(0, 60) + '...' }
      [Console]::Error.WriteLine(('| ' + ('  ' * $depth) + "$($c.ControlType.ProgrammaticName) class='$($c.ClassName)' id='$($c.AutomationId)' name='$name' pid=$($c.ProcessId) control=$($c.IsControlElement) hwnd=$($c.NativeWindowHandle)"))
      if ($depth -ge 8) { return }
      for ($child = $walker.GetFirstChild($element); $null -ne $child; $child = $walker.GetNextSibling($child)) {
        Write-Node $child ($depth + 1)
      }
    }
    foreach ($window in $A::RootElement.FindAll($Scope::Children, $ofApp)) {
      [Console]::Error.WriteLine("| app window class='$($window.Current.ClassName)' pid=$($window.Current.ProcessId)")
    }
    $candidates = @(Get-Candidates)
    [Console]::Error.WriteLine("| #32770 candidates: $($candidates.Count)")
    foreach ($candidate in $candidates) { Write-Node $candidate 0 }
  }

  # The file name combo box's Edit takes the value; a combo box that exposes ValuePattern itself also works.
  function Get-FileNameValue($dialog) {
    $field = $dialog.FindFirst($Scope::Descendants, $fileNameField)
    if ($null -eq $field) { return $null }
    $candidates = @()
    $edit = $field.FindFirst($Scope::Descendants, (New-Object System.Windows.Automation.PropertyCondition(
          $A::ControlTypeProperty, [System.Windows.Automation.ControlType]::Edit)))
    if ($null -ne $edit) { $candidates += $edit }
    $candidates += $field
    foreach ($element in $candidates) {
      $pattern = $null
      if ($element.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern, [ref]$pattern)) {
        return [System.Windows.Automation.ValuePattern]$pattern
      }
    }
    return $null
  }

  $script:uiaReady = $true

  # The dialog and its file name field, polled within one deadline (no fixed sleeps beyond the poll interval).
  $deadline = [DateTime]::UtcNow.AddSeconds($WaitSeconds)
  $dialog = $null
  $value = $null
  while ($true) {
    if ($null -eq $dialog) { $dialog = Find-Dialog }
    if ($null -ne $dialog) {
      try { $value = Get-FileNameValue $dialog } catch { if (Test-Gone $_) { $dialog = $null } else { throw } }
      if ($null -ne $value) { break }
    }
    if ([DateTime]::UtcNow -gt $deadline) {
      if ($null -eq $dialog -and -not $script:sawDialog) { Fail 'dialog not found' -Dump }
      Fail 'file name field not found' -Dump
    }
    Start-Sleep -Milliseconds $PollMs # poll interval
  }

  $value.SetValue($Path)
  $readBack = $value.Current.Value
  if ($readBack -ne $Path) { Fail "value not set (read back `"$readBack`")" }

  $open = $dialog.FindFirst($Scope::Descendants, $openButton)
  if ($null -eq $open) { Fail 'Open button not found' }
  $invoke = $null
  if (-not $open.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$invoke)) {
    Fail 'Open button has no InvokePattern'
  }
  ([System.Windows.Automation.InvokePattern]$invoke).Invoke()

  # The dialog must close: one still open did not accept the path. Half the wait, so the whole run
  # stays inside native-dialog.ts's kill timeout even with PowerShell's start-up.
  $closeDeadline = [DateTime]::UtcNow.AddSeconds($WaitSeconds / 2)
  while ($null -ne (Find-Dialog)) {
    if ([DateTime]::UtcNow -gt $closeDeadline) { Fail 'dialog still open after Open' }
    Start-Sleep -Milliseconds $PollMs # poll interval
  }
  exit 0
} catch {
  # One line, whatever failed (an assembly that did not load, a UIA call that threw).
  Fail (($_.Exception.Message -split "`r?`n")[0])
}
