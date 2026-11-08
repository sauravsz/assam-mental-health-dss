import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ScenarioProvider } from './engine/scenarioDataContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScenarioProvider>
      <App />
    </ScenarioProvider>
  </StrictMode>,
)
