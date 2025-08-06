// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GeneratorPage from './pages/GeneratorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<GeneratorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;