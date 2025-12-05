import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './features/auth/context/AuthContext';
import { GuidedTourProvider } from './contexts/GuidedTourContext';
import AuthGuard from './features/auth/components/AuthGuard';
import NewLandingPage from './pages/NewLandingPage';
import NewLandingPage2 from './pages/NewLandingPage2';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import DemoInventoryPage from './pages/DemoInventoryPage';
import MealPlansPage from './pages/MealPlansPage';
import { AIRecipePage } from './features/ai-recipes';
import ShoppingListPage from './pages/ShoppingListPage';
import ProfilePageV2 from './pages/ProfilePageV2';
import SupportPage from './pages/SupportPage';
import WelcomeTourPage from './pages/WelcomeTourPage';
import InstallTrackabitePage from './pages/InstallTrackabitePage';
import AboutYouPage from './pages/AboutYouPage';
import DietaryPreferencesPage from './pages/DietaryPreferencesPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import CalendarSettingsPage from './pages/CalendarSettingsPage';
import MealHistoryPage from './pages/MealHistoryPage';
import MealPlanPage from './pages/MealPlanPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import PastAIRecipesPage from './pages/PastAIRecipesPage';
import UploadedRecipesPage from './pages/UploadedRecipesPage';
import RecipeImportPage from './pages/RecipeImportPage';
import MultiModalImportPage from './pages/MultiModalImportPage';
import ManualRecipeEntryPage from './pages/ManualRecipeEntryPage';
import RecipePhotoCamera from './components/RecipePhotoCamera';
import InventoryUsagePage from './pages/InventoryUsagePage';
import BatchCamera from './features/batchcamera/components/BatchCamera';
import RecipeScannerCamera from './features/recipe-scanner/components/RecipeScannerCamera';
import { MealCameraInterface, MealIngredientSelector } from './features/mealscanner';
import OnboardingFlow from './features/onboarding/components/OnboardingFlow';
import ShortcutSetupPage from './pages/ShortcutSetupPage';
import ShoppingListDetailPage from './pages/ShoppingListDetailPage';
import JoinShoppingList from './components/JoinShoppingList';
import PWATestPage from './pages/PWATestPage';
import ScrollToTop from './components/ScrollToTop';
import BillingPage from './pages/BillingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import CancelSubscriptionPage from './pages/CancelSubscriptionPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PublicSupportPage from './pages/PublicSupportPage';
import BlogPage from './pages/BlogPage';

// Navigation listener component to handle service worker messages
function NavigationListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for navigation messages from service worker
    const handleMessage = (event) => {
      console.log('[App] Received message from service worker:', event.data);

      if (event.data && event.data.type === 'NAVIGATE') {
        const url = event.data.url;
        console.log('[App] Navigating to:', url);
        navigate(url);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [navigate]);

  return null;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <GuidedTourProvider>
          <Router>
            <ScrollToTop />
            <NavigationListener />
            <Routes>
          <Route path="/" element={<NewLandingPage2 />} />
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
              <InventoryPage defaultTab="inventory" />
            </AuthGuard>
          } />
          <Route path="/demo-inventory" element={
            <AuthGuard>
              <DemoInventoryPage />
            </AuthGuard>
          } />
          <Route path="/inventory/shopping-list" element={
            <AuthGuard>
              <InventoryPage defaultTab="shopping-list" />
            </AuthGuard>
          } />
          <Route path="/shopping-list/:listId" element={
            <AuthGuard>
              <ShoppingListDetailPage />
            </AuthGuard>
          } />
          {/* Meals routes - /meals is the main route (renamed from /meal-plans) */}
          <Route path="/meals" element={
            <AuthGuard>
              <MealPlansPage />
            </AuthGuard>
          } />
          <Route path="/meals/recipes" element={
            <AuthGuard>
              <MealPlansPage defaultTab="recipes" />
            </AuthGuard>
          } />
          {/* Keep old routes for backwards compatibility */}
          <Route path="/meal-plans" element={
            <AuthGuard>
              <MealPlansPage />
            </AuthGuard>
          } />
          <Route path="/meal-plans/recipes" element={
            <AuthGuard>
              <MealPlansPage defaultTab="recipes" />
            </AuthGuard>
          } />
          {/* New meal planning page */}
          <Route path="/meal-plan" element={
            <AuthGuard>
              <MealPlanPage />
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
          <Route path="/support" element={
            <AuthGuard>
              <SupportPage />
            </AuthGuard>
          } />
          <Route path="/welcome-tour" element={
            <AuthGuard>
              <WelcomeTourPage />
            </AuthGuard>
          } />
          <Route path="/install-trackabite" element={
            <AuthGuard>
              <InstallTrackabitePage />
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
          <Route path="/notification-settings" element={
            <AuthGuard>
              <NotificationSettingsPage />
            </AuthGuard>
          } />
          <Route path="/calendar-settings" element={
            <AuthGuard>
              <CalendarSettingsPage />
            </AuthGuard>
          } />
          <Route path="/meal-history" element={
            <AuthGuard>
              <MealHistoryPage />
            </AuthGuard>
          } />
          <Route path="/saved-recipes" element={
            <AuthGuard>
              <SavedRecipesPage />
            </AuthGuard>
          } />
          <Route path="/past-ai-recipes" element={
            <AuthGuard>
              <PastAIRecipesPage />
            </AuthGuard>
          } />
          <Route path="/uploaded-recipes" element={
            <AuthGuard>
              <UploadedRecipesPage />
            </AuthGuard>
          } />
          <Route path="/import" element={
            <AuthGuard>
              <RecipeImportPage />
            </AuthGuard>
          } />
          <Route path="/import/multi-modal" element={
            <AuthGuard>
              <MultiModalImportPage />
            </AuthGuard>
          } />
          <Route path="/recipes/manual" element={
            <AuthGuard>
              <ManualRecipeEntryPage />
            </AuthGuard>
          } />
          <Route path="/recipes/camera" element={
            <AuthGuard>
              <RecipePhotoCamera />
            </AuthGuard>
          } />
          <Route path="/shortcuts/setup" element={
            <AuthGuard>
              <ShortcutSetupPage />
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
          <Route path="/recipe-scanner" element={
            <AuthGuard>
              <RecipeScannerCamera />
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
          <Route path="/join/:shareCode" element={
            <AuthGuard>
              <JoinShoppingList />
            </AuthGuard>
          } />
          <Route path="/pwa-test" element={
            <AuthGuard>
              <PWATestPage />
            </AuthGuard>
          } />

          {/* Billing & Subscription Routes */}
          <Route path="/billing" element={
            <AuthGuard>
              <BillingPage />
            </AuthGuard>
          } />
          <Route path="/subscription" element={
            <AuthGuard>
              <SubscriptionPage />
            </AuthGuard>
          } />
          <Route path="/subscription/cancel" element={
            <AuthGuard>
              <CancelSubscriptionPage />
            </AuthGuard>
          } />
          {/* Public success page - handles both PWA and Safari contexts */}
          <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />

          {/* Legal Pages (Public - No Auth Required) */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Public Footer Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/product/features" element={<FeaturesPage />} />
          <Route path="/product/support" element={<PublicSupportPage />} />
          <Route path="/resources/blog" element={<BlogPage />} />
        </Routes>
          </Router>
        </GuidedTourProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
