'use client';
import { Moon, Sun } from 'lucide-react';
export function ThemeToggle() {
  function toggle() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('iran-theme', theme); } catch { /* Keep the current session preference when storage is unavailable. */ }
  }
  return <button className="theme-toggle" onClick={toggle} aria-label="Switch color theme" title="Switch light / dark mode"><Moon className="theme-moon" size={18}/><Sun className="theme-sun" size={18}/></button>;
}
