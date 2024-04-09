import { Button } from '@jod/design-system';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { increment, decrement, reset } from '@/features/counter/counterSlice';

export const Counter = () => {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center rounded-lg bg-[#ffffff] p-6 shadow">
      <span className="text-xl font-medium text-[#000000]">{count}</span>
      <div className="counter-controls">
        <Button onClick={() => dispatch(decrement())} label="Decrease" />
        <Button onClick={() => dispatch(reset())} label="Reset" variant="outlined" />
        <Button onClick={() => dispatch(increment())} label="Increase" />
      </div>
    </div>
  );
};
