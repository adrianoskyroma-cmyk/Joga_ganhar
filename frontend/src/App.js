import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import GamePlayPage from './pages/GamePlayPage';
import CoinsPage from './pages/CoinsPage';
import RankingPage from './pages/RankingPage';
import WithdrawPage from './pages/WithdrawPage';
import HelpPage from './pages/HelpPage';
import AdminPage from './pages/AdminPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/games" element={<PrivateRoute><GamesPage /></PrivateRoute>} />
          <Route path="/game/:gameId" element={<PrivateRoute><GamePlayPage /></PrivateRoute>} />
          <Route path="/coins" element={<PrivateRoute><CoinsPage /></PrivateRoute>} />
          <Route path="/ranking" element={<PrivateRoute><RankingPage /></PrivateRoute>} />
          <Route path="/withdraw" element={<PrivateRoute><WithdrawPage /></PrivateRoute>} />
          <Route path="/help" element={<PrivateRoute><HelpPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
