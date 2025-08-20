import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './features/auth/context/AuthContext';
import AuthGuard from './features/auth/components/AuthGuard';
import NewLandingPage from './pages/NewLandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import MealPlansPage from './pages/MealPlansPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ProfilePage from './pages/ProfilePage';
import BatchCamera from './features/batchcamera/components/BatchCamera';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
                  <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
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
          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />
          <Route path="/batchcamera" element={
            <AuthGuard>
              <BatchCamera />
            </AuthGuard>
          } />
        </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
