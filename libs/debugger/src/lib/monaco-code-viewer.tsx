import { Editor } from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import { registerQspLanguage } from './qsp-language';

declare global {
  interface Window {
    monaco: typeof import('monaco-editor');
  }
}

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
  const handleToggleBreakpointRef = useRef<(lineNumber: number) => void>();

  const handleToggleBreakpoint = React.useCallback(
    (line: number) => {
      if (onBreakpointToggle) {
        onBreakpointToggle(line, locationName || '', actionIndex);
      }
    },
    [onBreakpointToggle, locationName, actionIndex],
  );
  handleToggleBreakpointRef.current = handleToggleBreakpoint;

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor): void => {
    editorRef.current = editorInstance;

    // Register QSP language if not already registered
    if (window.monaco) {
      registerQspLanguage(window.monaco);
    }

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

    // Add click handler for breakpoint toggles
    if (onBreakpointToggle && locationName) {
      editorInstance.onMouseDown((e) => {
        // Check if click was in the glyph margin (where breakpoints are shown)
        if (e.target.type === window.monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
          const lineNumber = e.target.position?.lineNumber;
          if (lineNumber) {
            handleToggleBreakpointRef.current?.(lineNumber);
          }
        }
      });
    }

    setEditorMounted(true);
  };

  // Highlight current execution line
  useEffect(() => {
    if (editorRef.current && currentLine && currentLine > 0 && window.monaco) {
      const editor = editorRef.current;

      // Add decoration to highlight current line
      const decorations = editor.createDecorationsCollection([
        {
          range: new window.monaco.Range(currentLine, 1, currentLine, 1),
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
    if (editorRef.current && targetLine && targetLine > 0 && window.monaco) {
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
        range: new window.monaco.Range(bp.line!, 1, bp.line!, 1),
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
      {title && <div className="qsp-monaco-code-title">{title}</div>}
      <div className="qsp-monaco-editor-container">
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
