import { createRoot } from 'react-dom/client';

import { App } from './App';
import './index.css';
import { instalarRecargaPorDeploy } from './lib/recarga-por-deploy';

instalarRecargaPorDeploy();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootElement).render(<App />);
