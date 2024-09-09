import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from './AuthProvider';

describe('EventEmitter', () => {
  it('should add a listener with on()', () => {
    const eventEmitter = new EventEmitter();
    const listener = vi.fn();

    eventEmitter.on(listener);
    eventEmitter.sessionExpired();

    expect(listener).toHaveBeenCalled();
  });

  it('should remove a listener with off()', () => {
    const eventEmitter = new EventEmitter();
    const listener = vi.fn();

    eventEmitter.on(listener);
    eventEmitter.off(listener);
    eventEmitter.sessionExpired();

    expect(listener).not.toHaveBeenCalled();
  });

  it('should call all listeners when sessionExpired() is called', () => {
    const eventEmitter = new EventEmitter();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventEmitter.on(listener1);
    eventEmitter.on(listener2);
    eventEmitter.sessionExpired();

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should not call listeners after they have been removed', () => {
    const eventEmitter = new EventEmitter();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventEmitter.on(listener1);
    eventEmitter.on(listener2);
    eventEmitter.off(listener1);
    eventEmitter.sessionExpired();

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should handle removing a listener that was never added', () => {
    const eventEmitter = new EventEmitter();
    const listener = vi.fn();

    eventEmitter.off(listener);
    eventEmitter.sessionExpired();

    expect(listener).not.toHaveBeenCalled();
  });
});
