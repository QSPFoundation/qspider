import { Editor } from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import { monaco } from './monaco-setup';

/**
 * A model's tokenization part: Monaco has it at runtime but leaves it out of its public typings, so it may be absent.
 */
type ModelWithTokenization = editor.ITextModel & { tokenization?: { forceTokenization?(lineNumber: number): void } };

interface BreakpointInfo {
  id: string;
  line?: number;
  location: string;
  actionIndex?: number;
  enabled: boolean;
}

interface MonacoCodeViewerProps {
  code: string;
  language?: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  height?: string | number;
  currentLine?: number;
  targetLine?: number;
  title?: string;
  locationName?: string;
  actionIndex?: number;
  breakpoints?: BreakpointInfo[];
  onBreakpointToggle?: (line: number, location: string, actionIndex?: number) => void;
  forceUpdate?: number;
}

export const MonacoCodeViewer: React.FC<MonacoCodeViewerProps> = ({
  code,
  language = 'qsp', // Use QSP syntax highlighting
  theme = 'vs',
  height = '300px',
  currentLine,
  targetLine,
  title,
  locationName,
  actionIndex,
  breakpoints = [],
  onBreakpointToggle,
  forceUpdate,
}) => {
  const { t } = useTranslation();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const breakpointDecorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const [editorMounted, setEditorMounted] = useState(false);
  const handleToggleBreakpointRef = useRef<(lineNumber: number) => void>(undefined);

  const handleToggleBreakpoint = React.useCallback(
    (line: number) => {
      if (onBreakpointToggle && locationName) {
        onBreakpointToggle(line, locationName, actionIndex);
      }
    },
    [onBreakpointToggle, locationName, actionIndex],
  );
  handleToggleBreakpointRef.current = handleToggleBreakpoint;

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor): void => {
    editorRef.current = editorInstance;

    // Configure editor for readonly code viewing
    editorInstance.updateOptions({
      readOnly: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      selectOnLineNumbers: true,
      automaticLayout: true,
      fontSize: 13,
      fontFamily: 'Consolas, "Courier New", monospace',
      glyphMargin: true, // Enable glyph margin for breakpoints
    });

    // Add click handler for breakpoint toggles. Registered whatever the first view: the editor stays mounted across
    // views, and a view without breakpoints (a current action) passes no onBreakpointToggle, so a click does nothing.
    editorInstance.onMouseDown((e) => {
      // Check if click was in the glyph margin (where breakpoints are shown)
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const lineNumber = e.target.position?.lineNumber;
        if (lineNumber) {
          handleToggleBreakpointRef.current?.(lineNumber);
        }
      }
    });

    setEditorMounted(true);
  };

  // On a new text or language, Monaco tokenizes the lines in view, except when they end at the first line it has not
  // tokenized yet: a one-line text (a description, mostly) is left to its idle-time background tokenizer. That runs
  // from requestIdleCallback, which Chromium calls only after a new frame, and nothing on screen changes: the text
  // stayed plain until a click. Tokenize the lines in view now. Runs after the editor's own effects (a child's
  // effects run before its parent's), so the model has the new text and language.
  useEffect(() => {
    const editor = editorRef.current;
    const model = editor?.getModel() as ModelWithTokenization | null | undefined;
    if (!editor || !model) return;
    const lastInView = Math.max(1, ...editor.getVisibleRanges().map((range) => range.endLineNumber));
    model.tokenization?.forceTokenization?.(Math.min(lastInView, model.getLineCount()));
  }, [editorMounted, language, code]);

  // Highlight current execution line
  useEffect(() => {
    if (editorRef.current && currentLine && currentLine > 0) {
      const editor = editorRef.current;

      // Add decoration to highlight current line
      const decorations = editor.createDecorationsCollection([
        {
          range: new monaco.Range(currentLine, 1, currentLine, 1),
          options: {
            isWholeLine: true,
            className: 'qsp-current-line-decoration',
            marginClassName: 'qsp-current-line-margin',
          },
        },
      ]);

      // Scroll to current line
      editor.revealLineInCenter(currentLine);

      // Cleanup decorations on unmount
      return () => {
        decorations.clear();
      };
    }
    return undefined;
  }, [editorMounted, currentLine]);

  // Scroll to target line (e.g., when clicking a breakpoint)
  useEffect(() => {
    if (editorRef.current && targetLine && targetLine > 0) {
      const editor = editorRef.current;
      // Scroll to target line
      editor.revealLineInCenter(targetLine);
    }
  }, [editorMounted, targetLine]);

  // Render breakpoints
  useEffect(() => {
    if (editorRef.current && locationName && editorMounted) {
      const editor = editorRef.current;

      // Filter breakpoints for current location and action, and ensure they have line numbers
      const relevantBreakpoints = breakpoints.filter(
        (bp) =>
          bp.location === locationName &&
          bp.line !== undefined &&
          (actionIndex !== undefined ? bp.actionIndex === actionIndex : bp.actionIndex === undefined),
      );

      // Create breakpoint decorations
      const decorations = relevantBreakpoints.map((bp) => ({
        range: new monaco.Range(bp.line!, 1, bp.line!, 1),
        options: {
          isWholeLine: false,
          // Different glyph styles for enabled vs disabled
          glyphMarginClassName: bp.enabled ? 'qsp-breakpoint-enabled' : 'qsp-breakpoint-disabled',
          glyphMarginHoverMessage: {
            value: bp.enabled
              ? t('Breakpoint (enabled) - Click to disable')
              : t('Breakpoint (disabled) - Click to enable'),
          },
          // Also add line decoration as backup that should definitely be visible
          className: bp.enabled ? 'qsp-breakpoint-line-enabled' : 'qsp-breakpoint-line-disabled',
          marginClassName: bp.enabled ? 'qsp-breakpoint-margin-enabled' : 'qsp-breakpoint-margin-disabled',
        },
      }));

      // Update breakpoint decorations
      if (breakpointDecorationsRef.current) {
        breakpointDecorationsRef.current.clear();
      }

      // Delay decoration application to ensure editor is fully rendered
      const timeoutId = setTimeout(() => {
        breakpointDecorationsRef.current = editor.createDecorationsCollection(decorations);
        editor.layout();
      }, 100);

      // Cleanup on unmount
      return () => {
        clearTimeout(timeoutId);
        if (breakpointDecorationsRef.current) {
          breakpointDecorationsRef.current.clear();
        }
      };
    }
    return undefined;
  }, [editorMounted, breakpoints, locationName, actionIndex]);

  const options: editor.IStandaloneEditorConstructionOptions = {
    readOnly: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    selectOnLineNumbers: true,
    automaticLayout: true,
    fontSize: 13,
    fontFamily: 'Consolas, "Courier New", monospace',
    padding: { top: 8, bottom: 8 },
    renderLineHighlight: 'line',
    cursorStyle: 'line',
    hideCursorInOverviewRuler: true,
    glyphMargin: true, // Enable glyph margin for breakpoints
  };

  return (
    <div className="qsp-monaco-code-viewer">
      {title && (
        <div className="qsp-monaco-code-title" data-qa="debug-editor-title">
          {title}
        </div>
      )}
      <div className="qsp-monaco-editor-container" data-qa="debug-editor">
        <Editor
          height={height}
          language={language}
          theme={theme}
          value={code}
          options={options}
          onMount={handleEditorDidMount}
          loading={<div className="qsp-monaco-loading">Loading editor...</div>}
        />
      </div>
    </div>
  );
};
