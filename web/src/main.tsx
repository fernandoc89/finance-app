import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const THEME_KEY = '@FinanceApp:theme'
const storedTheme = localStorage.getItem(THEME_KEY)
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
  document.documentElement.classList.add('dark')
}

// Importar fontes (se instalou via npm)
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
