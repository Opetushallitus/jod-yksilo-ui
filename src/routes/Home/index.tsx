import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button/Button';
import { useAppSelector, useAppDispatch } from '../../state/hooks';
import { increment, decrement, reset } from './counterSlice';

const Home = () => {
  const { t } = useTranslation();
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <h1>{t('home')}</h1>
      <div className="mx-auto flex max-w-sm flex-col items-center rounded-lg bg-jod-white p-6 shadow">
        <span className="text-xl font-medium text-jod-black">{count}</span>
        <div className="counter-controls">
          <Button onClick={() => dispatch(decrement())} label="Decrease" />
          <Button onClick={() => dispatch(reset())} label="Reset" variant="outlined" />
          <Button onClick={() => dispatch(increment())} label="Increase" />
        </div>
      </div>
    </div>
  );
};

export default Home;
