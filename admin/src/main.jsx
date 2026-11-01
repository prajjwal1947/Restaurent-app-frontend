import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RequestLoader from './components/RequestLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RequestLoader />
    <App />
  </StrictMode>,
)
