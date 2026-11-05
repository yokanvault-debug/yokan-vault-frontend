import './Components/Utils/authInterceptor';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
import { AuthProvider } from './Components/Utils/AuthContext'

createRoot(document.getElementById('root')).render(

  <Provider store={store} >
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </Provider>




)


// any image that fails to load (missing file, dead Cloudinary link, empty src) gets a placeholder
document.addEventListener('error', (event) => {
  const img = event.target;
  if (!img || img.tagName !== 'IMG' || img.dataset.fallback) return;
  img.dataset.fallback = '1';
  const isAvatar = /avatar|profile|photo|user/i.test(`${img.className} ${img.alt} ${img.id}`);
  img.src = isAvatar ? '/images/default-avatar.png' : '/images/default-product.png';
}, true);
