import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from './stores/store';
import Home from './pages/Home';
import Birthdays from './pages/Birthdays';
import Jiya from './pages/Jiya';
import Pree from './pages/Pree';
import Events from './pages/Events';
import AIChatBubble from './components/AIChatBubble';
import './index.css';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/birthdays" element={<Birthdays />} />
          <Route path="/jiya" element={<Jiya />} />
          <Route path="/pree" element={<Pree />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <AIChatBubble />
    </BrowserRouter>
  );
}
