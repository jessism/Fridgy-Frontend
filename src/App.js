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
import { AIRecipePage } from './features/ai-recipes';
import ShoppingListPage from './pages/ShoppingListPage';
import ProfilePageV2 from './pages/ProfilePageV2';
import AboutYouPage from './pages/AboutYouPage';
import DietaryPreferencesPage from './pages/DietaryPreferencesPage';
import MealHistoryPage from './pages/MealHistoryPage';
import InventoryUsagePage from './pages/InventoryUsagePage';
import BatchCamera from './features/batchcamera/components/BatchCamera';
import { MealCameraInterface, MealIngredientSelector } from './features/mealscanner';
import OnboardingFlow from './features/onboarding/components/OnboardingFlow';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
                  <Routes>
          <Route path="/" element={<NewLandingPage />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
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
          <Route path="/ai-recipes" element={
            <AuthGuard>
              <AIRecipePage />
            </AuthGuard>
          } />
          <Route path="/shopping-list" element={
            <AuthGuard>
              <ShoppingListPage />
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePageV2 />
            </AuthGuard>
          } />
          <Route path="/about-you" element={
            <AuthGuard>
              <AboutYouPage />
            </AuthGuard>
          } />
          <Route path="/dietary-preferences" element={
            <AuthGuard>
              <DietaryPreferencesPage />
            </AuthGuard>
          } />
          <Route path="/meal-history" element={
            <AuthGuard>
              <MealHistoryPage />
            </AuthGuard>
          } />
          <Route path="/analytics/inventory" element={
            <AuthGuard>
              <InventoryUsagePage />
            </AuthGuard>
          } />
          <Route path="/batchcamera" element={
            <AuthGuard>
              <BatchCamera />
            </AuthGuard>
          } />
          <Route path="/mealscanner" element={
            <AuthGuard>
              <MealCameraInterface />
            </AuthGuard>
          } />
          <Route path="/mealscanner/ingredients" element={
            <AuthGuard>
              <MealIngredientSelector />
            </AuthGuard>
          } />
        </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
