import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

// jsdom does not implement Element#scrollTo; components that call it need a noop/stub.
if (typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = function (this: Element, optionsOrX?: ScrollToOptions | number, y?: number): void {
    const el = this as HTMLElement;
    if (typeof optionsOrX === 'number') {
      el.scrollLeft = optionsOrX;
      el.scrollTop = y ?? 0;
      return;
    }
    if (optionsOrX && typeof optionsOrX === 'object') {
      if (optionsOrX.left !== undefined) {
        el.scrollLeft = optionsOrX.left;
      }
      if (optionsOrX.top !== undefined) {
        el.scrollTop = optionsOrX.top;
      }
    }
  };
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
