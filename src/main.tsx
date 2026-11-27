import { createRoot } from 'react-dom/client'
// Fonts are served from this site instead of Google Fonts: no visitor IP goes to
// Google, and no render-blocking request to another domain.
import '@fontsource/syne/700.css'
import '@fontsource/syne/800.css'
import '@fontsource/barlow/300.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/400-italic.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
