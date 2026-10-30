'use client';
import { useEffect, useState } from 'react';

export function useVisualTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const update = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export function readVisualTheme(element: HTMLElement) {
  const style = getComputedStyle(element);
  const value = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    ink: value('--theme-ink', '#242721'), muted: value('--theme-muted', '#777d6e'),
    line: value('--theme-line', '#d9ddcf'), panel: value('--theme-panel', '#eeeee6'),
    background: value('--theme-bg', '#f7f6f2'),
    font: style.fontFamily,
    palette: ['#d85a31', '#829176', '#c39c64', '#5b8b91', '#9d7890', '#9fa76e', '#b47959', '#657896'],
  };
}
