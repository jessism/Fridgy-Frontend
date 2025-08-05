import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './features/auth/context/AuthContext';
import AuthGuard from './features/auth/components/AuthGuard';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import MealPlansPage from './pages/MealPlansPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ProfilesPage from './pages/ProfilesPage';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
                  <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/home" element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          } />
          <Route path="/inventory" element={
            <AuthGuard>
              <InventoryPage />
            </AuthGuard>
          } />
          <Route path="/meal-plans" element={
            <AuthGuard>
              <MealPlansPage />
            </AuthGuard>
          } />
          <Route path="/shopping-list" element={
            <AuthGuard>
              <ShoppingListPage />
            </AuthGuard>
          } />
          <Route path="/profiles" element={
            <AuthGuard>
              <ProfilesPage />
            </AuthGuard>
          } />
        </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
