import { expect, it } from 'vitest';
import reducer, { increment, decrement, incrementByAmount, reset } from './counterSlice';

it('should return the initial state', () => {
  expect(reducer(undefined, { type: '' })).toEqual({ value: 0 });
});

it('should increment the value', () => {
  expect(reducer(undefined, increment())).toEqual({ value: 1 });
});

it('should decrement the value', () => {
  expect(reducer(undefined, decrement())).toEqual({ value: -1 });
});

it('should decrement by the given value', () => {
  expect(reducer(undefined, incrementByAmount(4))).toEqual({ value: 4 });
});

it('should reset back to initial state', () => {
  const previousState = { value: 8 };
  expect(reducer(previousState, reset())).toEqual({ value: 0 });
});
