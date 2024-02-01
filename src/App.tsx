import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Button } from './components/Button/Button';

function App() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  return (
    <main>
      <div className="flex items-center justify-evenly py-10">
        <div>
          <div className="rounded bg-white px-8">
            <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
          </div>
          <span className="text-4xl">Vite</span>
        </div>
        <span className="px-4 text-4xl">+</span>
        <div>
          <div className="rounded bg-white px-8">
            <a href="https://react.dev" target="_blank" rel="noreferrer">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <span className="text-4xl">React</span>
        </div>
      </div>
      <h1>Counter</h1>
      <div className="card">
        <div className="flex flex-col">
          <span>count is {count}</span>
          <Button onClick={() => setCount((count) => count + 1)} label="Click me" />
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      <p>{t('Welcome to React')}</p>
    </main>
  );
}

export default App;
