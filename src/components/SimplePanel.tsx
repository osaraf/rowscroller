import React, { useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from '../types';

type Props = PanelProps<SimpleOptions>;
const normalize = (s?: string | null) => (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

function getScrollContainer(el: HTMLElement | null): HTMLElement {
  let n: HTMLElement | null = el;
  while (n && n !== document.body) {
    const cs = getComputedStyle(n);
    if (n.scrollHeight > n.clientHeight + 5 && /(auto|scroll)/.test(cs.overflowY)) return n;
    n = n.parentElement;
  }
  return (document.scrollingElement as HTMLElement) || document.documentElement;
}
function parseBool(v: string | null | undefined): boolean | null {
  if (v == null) return null;
  if (/^(1|true|yes|on)$/i.test(v)) return true;
  if (/^(0|false|no|off)$/i.test(v)) return false;
  return null;
}
function alignToTop(scroller: HTMLElement, el: HTMLElement, extraOffset = 60) {
  const sRect = scroller.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const nextTop = scroller.scrollTop + (eRect.top - sRect.top) - extraOffset;
  scroller.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
}

export function SimplePanel(_: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rowName = params.get('row');
    if (!rowName) return;

    const scroller = getScrollContainer(rootRef.current);
    const target = normalize(rowName);
    const expandOverride = parseBool(params.get('expand'));
    const shouldExpand = expandOverride ?? true; // default: expand
    const offsetParam = Number(params.get('offset'));
    const topOffset = Number.isFinite(offsetParam) ? offsetParam : 60;

    const findRowButton = (): HTMLButtonElement | null => {
      const byId = Array.from(
        document.querySelectorAll<HTMLButtonElement>('button[data-testid^="dashboard-row-title-"]')
      ).find((btn) => normalize(btn.textContent) === target);
      if (byId) return byId;

      const heading = Array.from(
        document.querySelectorAll<HTMLElement>('button [role="heading"]')
      ).find((el) => normalize(el.textContent) === target);
      return heading ? (heading.closest('button') as HTMLButtonElement) : null;
    };

    const isCollapsed = (btn: HTMLElement) =>
      /expand row/i.test(btn.getAttribute('aria-label') || '');

    let tries = 0;
    const maxTries = 50;
    const step = Math.max(200, Math.floor((scroller.clientHeight || 600) * 0.6));

    const timer = setInterval(() => {
      const btn = findRowButton();
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          if (shouldExpand && isCollapsed(btn)) btn.click();
          setTimeout(() => alignToTop(scroller, btn, topOffset), 150);
        }, 120);
        clearInterval(timer);
        return;
      }
      scroller.scrollTop = Math.min(scroller.scrollTop + step, scroller.scrollHeight);
      if (++tries >= maxTries) clearInterval(timer);
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // invisible micro panel
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ width: 1, height: 1, opacity: 0, pointerEvents: 'none', overflow: 'hidden', position: 'relative' }}
    />
  );
}

