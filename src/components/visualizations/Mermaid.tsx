'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { MermaidConfig, Mermaid as MermaidAPI } from 'mermaid';
import { readVisualTheme, useVisualTheme } from './useVisualTheme';
import './visualizations.css';

export interface MermaidProps {
  /** Any diagram syntax supported by the installed Mermaid version. */
  source: string;
  title?: string;
  description?: string;
  className?: string;
  config?: MermaidConfig;
  /** Register icon packs, external diagrams or layout loaders before rendering. Keep stable. */
  setup?: (api: MermaidAPI) => void | Promise<void>;
  onError?: (error: Error) => void;
  loading?: ReactNode;
}

// Mermaid configuration is global: serialize initialization + rendering across instances.
let renderQueue: Promise<unknown> = Promise.resolve();
export function Mermaid({ source, title, description, className = '', config, setup, onError, loading = 'Loading diagram…' }: MermaidProps) {
  const host = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const theme = useVisualTheme();
  const [status, setStatus] = useState<{ error?: string; busy: boolean }>({ busy: true });
  useEffect(() => {
    let cancelled = false;
    const element = host.current;
    if (!element) return;
    element.replaceChildren();
    setStatus({ busy: true });
    const task = async () => {
      if (cancelled) return;
      const { default: mermaid } = await import('mermaid');
      if (cancelled) return;
      const colors = readVisualTheme(element);
      await setup?.(mermaid);
      mermaid.initialize({
        theme: 'base',
        ...config,
        startOnLoad: false,
        suppressErrorRendering: true,
        securityLevel: config?.securityLevel ?? 'strict',
        themeVariables: {
          darkMode: theme === 'dark', fontFamily: colors.font,
          background: colors.background, primaryColor: colors.panel,
          primaryTextColor: colors.ink, primaryBorderColor: colors.palette[1],
          secondaryColor: colors.background, tertiaryColor: colors.panel,
          lineColor: colors.muted, textColor: colors.ink,
          ...Object.fromEntries(colors.palette.map((color, index) => [`pie${index + 1}`, color])),
          ...config?.themeVariables,
        },
      });
      const result = await mermaid.render(`mermaid${id}`, source);
      if (cancelled) return;
      element.innerHTML = result.svg;
      result.bindFunctions?.(element);
      setStatus({ busy: false });
    };
    renderQueue = renderQueue.then(task, task).catch((reason: unknown) => {
      if (cancelled) return;
      const error = reason instanceof Error ? reason : new Error(String(reason));
      setStatus({ busy: false, error: error.message });
      onError?.(error);
    });
    return () => { cancelled = true; element.replaceChildren(); };
  }, [source, config, setup, theme, id, onError]);
  return <figure className={`ir-visual ${className}`} aria-label={title ?? 'Mermaid diagram'}>
    {(title || description) && <figcaption>{title}{description && <span className="ir-visual-description">{description}</span>}</figcaption>}
    {status.busy && <div className="ir-visual-status" role="status">{loading}</div>}
    {status.error && <div className="ir-visual-status ir-visual-error" role="alert">{status.error}</div>}
    <div ref={host} className="ir-visual-stage ir-mermaid-stage" aria-busy={status.busy} />
  </figure>;
}
