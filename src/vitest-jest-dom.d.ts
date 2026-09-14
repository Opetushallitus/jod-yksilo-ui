import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// @testing-library/jest-dom 7.0.1 augments vitest's `Assertion<T>`, but vitest 5
// changed the interface to `Assertion<R, T>`, so its matchers are not merged in.
// Remove once jest-dom ships vitest 5 compatible types.
declare module 'vitest' {
  interface Assertion<R, T> extends TestingLibraryMatchers<R, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
