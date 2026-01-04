import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
import { useGuidedTourContext } from '../contexts/GuidedTourContext';
import WelcomePrompt from '../components/guided-tour/WelcomePrompt';
import IntroductionModal from '../components/guided-tour/IntroductionModal';
import GenerateRecipesIntroModal from '../components/guided-tour/GenerateRecipesIntroModal';
import GuidedTooltip from '../components/guided-tour/GuidedTooltip';
import ShortcutInstallModal from '../components/guided-tour/ShortcutInstallModal';
import ShortcutConfirmationModal from '../components/guided-tour/ShortcutConfirmationModal';
import ShortcutSuccessBridgeModal from '../components/guided-tour/ShortcutSuccessBridgeModal';
import PreFlightCheckModal from '../components/guided-tour/PreFlightCheckModal';
import RecipeImportIntroModal from '../components/guided-tour/RecipeImportIntroModal';
import RecipeImportStepModal from '../components/guided-tour/RecipeImportStepModal';
import RecipeImportSuccessModal from '../components/guided-tour/RecipeImportSuccessModal';
import { isIOS } from '../utils/welcomeFlowHelpers';
import { detectRecipeImport } from '../utils/recipeImportDetection';
import { checkNotificationPermission, requestNotificationPermission } from '../utils/shortcutDetection';
import useInventory from '../hooks/useInventory';
import { usePWADetection } from '../hooks/usePWADetection';
import PWANotificationPrompt from '../components/PWANotificationPrompt';
import { useSubscription } from '../hooks/useSubscription';
import { PremiumBadge } from '../components/common/PremiumBadge';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { CheckoutModal } from '../components/modals/CheckoutModal';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import ClockIcon from '../assets/icons/Clock.png';
import ServingIcon from '../assets/icons/Serving.png';
import { ReactComponent as AddToFridgeIcon } from '../assets/icons/quickaccess/add-to-fridge.svg';
import { ReactComponent as MyFridgeIcon } from '../assets/icons/quickaccess/my-fridge.svg';
import { ReactComponent as ShopListsIcon } from '../assets/icons/quickaccess/shop-lists.svg';
// Food group icons
import proteinIcon from '../assets/images/food-groups/foodgroup_protein.png';
import dairyIcon from '../assets/images/food-groups/foodgroup_dairy.png';
import veggiesIcon from '../assets/images/food-groups/foodgroup_veggies.png';
import fruitsIcon from '../assets/images/food-groups/foodgroup_fruits.png';
import grainsIcon from '../assets/images/food-groups/foodgroup_carb.png';
import fatsIcon from '../assets/images/food-groups/foodgroup_fats.png';
import beveragesIcon from '../assets/images/food-groups/foodgroup_beverages.png';
import herbsIcon from '../assets/images/food-groups/foodgroup_herbs.png';
import { ReactComponent as RecipesIcon } from '../assets/icons/quickaccess/recipes.svg';
import importRecipeStep1Image from '../assets/product mockup/Import Recipes/Import_recipe_open_instagram.jpeg';
import importRecipeStep4Image from '../assets/product mockup/Import Recipes/Import_recipe_allow_api.png';
import cookingIcon from '../assets/icons/Cooking.png';
import FridgyLogo from '../assets/images/Logo.png';
import './HomePage.css';

// Helper function to calculate days until expiry (reused from InventoryPage)
const getDaysUntilExpiry = (dateString) => {
  const expiryDate = new Date(dateString);
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const HomePage = () => {
  const { user } = useAuth();
  const { items, loading: inventoryLoading } = useInventory();
  const navigate = useNavigate();
  const { isPremium, startCheckout, checkoutSecret, closeCheckout, refresh } = useSubscription();
  const { shouldShowTooltip, nextStep, dismissTour, completeTour, goToStep, STEPS } = useGuidedTourContext();

  // PWA Detection for first-time notification prompt
  const {
    isPWA,
    isFirstPWALaunch,
    shouldShowNotificationPrompt,
    platform,
    markFirstLaunchComplete,
    markNotificationPromptShown,
    markNotificationPromptDismissed,
    getDebugInfo
  } = usePWADetection();

  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false });
  const [recipeImportStep, setRecipeImportStep] = useState(1);
  const [importedRecipe, setImportedRecipe] = useState(null);
  const [preFlightStatus, setPreFlightStatus] = useState({
    hasNotifications: false,
    hasShortcut: false
  });
  const [shortcutInstallTimer, setShortcutInstallTimer] = useState(null);
  const [userClickedInstall, setUserClickedInstall] = useState(false);

  // Recently added recipes state
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipeImageStates, setRecipeImageStates] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Color palette - Option 2 (Medium Green)
  const colors = {
    primary: '#81e053',
    primaryLight: 'rgba(129, 224, 83, 0.3)',
    primaryDark: '#6bc93f',
  };

  // Popular recipes for "Popular now" section (from testa@gmail.com's saved recipes)
  const POPULAR_RECIPES = [
    {
      id: '061944e9-8c71-4e94-b87c-b7f03f01f1a2',
      title: 'Cheesy Breakfast Egg Tacos',
      image: 'https://aimvjpndmipmtavpmjnn.supabase.co/storage/v1/object/public/recipe-images/6bea1ad3-6552-45b9-9d21-acec968d3655/temp-1760491267509-fi29k26qk-1760491268402.jpg',
      readyInMinutes: 15,
      servings: 2,
      source_type: 'popular',
      source_author: 'madeleinesmeals',
      summary: 'Cheesy breakfast egg tacos with melted cheese on warm tortillas, creamy smashed avocado, a crispy fried egg & all the zesty fresh toppings.',
      vegetarian: true,
      extendedIngredients: [
        { name: 'tortillas', unit: 'small', amount: 2, original: '2 small tortillas' },
        { name: 'grated cheese', unit: 'handful', amount: 1, original: 'A handful of grated cheese' },
        { name: 'avocado', unit: null, amount: 1, original: 'Avocado' },
        { name: 'diced cherry tomatoes', unit: 'handful', amount: 1, original: 'A large handful of diced cherry tomatoes' },
        { name: 'diced red onion', unit: null, amount: 0.5, original: '½ diced red onion' },
        { name: 'finely sliced green chilli', unit: 'small', amount: 1, original: '1 small finely sliced green chilli' },
        { name: 'eggs', unit: null, amount: 2, original: '2 eggs' },
        { name: 'fresh coriander', unit: null, amount: 1, original: 'Fresh coriander' },
        { name: 'lime', unit: null, amount: 1, original: 'Lime' },
        { name: 'chilli oil', unit: null, amount: 1, original: 'Chilli oil' },
      ],
      analyzedInstructions: [
        { name: '', steps: [
          { step: 'In a small bowl, mix diced tomatoes, red onion, chopped coriander and a squeeze of lime. Season with salt & set aside.', number: 1 },
          { step: 'Mash the avocado with a pinch of salt, pepper, a drizzle of olive oil and a little lime juice.', number: 2 },
          { step: 'Add tortillas to a pan & warm each side. Sprinkle over some grated cheese. Let them melt & bubble slightly.', number: 3 },
          { step: 'Fry your eggs to your liking - I like to get a crispy bottom! Season with salt, pepper & some optional chilli.', number: 4 },
          { step: 'Spread avocado over the cheesy tortilla, top with a fried egg, spoon over the tomato salsa. Finish with green chilli, coriander, sesame seeds & chilli oil.', number: 5 },
        ]}
      ],
    },
    {
      id: 'e1b510ab-7c08-47cb-b04f-4f902994f492',
      title: 'Nutella Stuffed Gingerbread Men',
      image: 'https://aimvjpndmipmtavpmjnn.supabase.co/storage/v1/object/public/recipe-images/6bea1ad3-6552-45b9-9d21-acec968d3655/temp-1765047051259-a5ad2d80y-1765047051339.jpg',
      readyInMinutes: 20,
      servings: 4,
      source_type: 'popular',
      source_author: 'fitwafflekitchen',
      summary: 'Quick and easy Christmas pastries filled with Nutella and dusted with icing sugar.',
      extendedIngredients: [
        { name: 'ready roll puff pastry', unit: 'sheet', amount: 1, original: '1 sheet ready roll puff pastry' },
        { name: 'Nutella', unit: 'serving', amount: 1, original: 'Nutella (or spread of your choice)' },
        { name: 'egg', unit: 'small', amount: 1, original: '1 small egg' },
        { name: 'milk or water', unit: 'tsp', amount: 1, original: '1 tsp milk or water' },
        { name: 'icing sugar', unit: 'serving', amount: 1, original: 'icing sugar' },
      ],
      analyzedInstructions: [
        { name: 'Instructions', steps: [
          { step: 'Use cookie cutters to cut shapes from puff pastry.', number: 1 },
          { step: 'Fill with Nutella.', number: 2 },
          { step: 'Make egg wash with egg and milk/water.', number: 3 },
          { step: 'Brush with egg wash.', number: 4 },
          { step: 'Bake.', number: 5 },
          { step: 'Dust with icing sugar.', number: 6 },
        ]}
      ],
    },
    {
      id: '23f34c08-19df-457e-b0e4-db3ca263e535',
      title: 'Sugar Cookie Rice Krispies',
      image: 'https://aimvjpndmipmtavpmjnn.supabase.co/storage/v1/object/public/recipe-images/6bea1ad3-6552-45b9-9d21-acec968d3655/temp-1765047401979-2g6lxbn4i-1765047402123.jpg',
      readyInMinutes: 20,
      servings: 4,
      source_type: 'popular',
      source_author: 'foodtherapywithmeg',
      summary: 'Festive Rice Krispies treats with a sugar cookie twist, perfect for Christmas.',
      extendedIngredients: [
        { name: 'rice krispies', unit: 'cup', amount: 4, original: '4 cups rice krispies' },
        { name: 'big marshmallows', unit: 'bag', amount: 1, original: '1 bag big marshmallows' },
        { name: 'mini marshmallows', unit: 'cup', amount: 1, original: '1 cup mini marshmallows' },
        { name: 'sugar cookie mix', unit: 'cup', amount: 0.33, original: '1/3 cup sugar cookie mix' },
        { name: 'butter', unit: 'cup', amount: 0.5, original: '1 stick butter' },
        { name: 'christmas sprinkles', unit: 'serving', amount: 1, original: 'christmas sprinkles' },
      ],
      analyzedInstructions: [
        { name: '', steps: [
          { step: 'Over medium high heat melt the butter and than add the big marshmallows and mix until combined.', number: 1 },
          { step: 'Mix in the sugar cookie mix and mix until combined.', number: 2 },
          { step: 'Turn the heat off and mix in the Rice Krispies, mini marshmallows, and sprinkles.', number: 3 },
          { step: 'Top with more sprinkles. enjoy!!', number: 4 },
        ]}
      ],
    },
    {
      id: 'b1bf8e97-d5f4-4544-87ea-3b64203247da',
      title: 'Garlic Mozzarella Puffs',
      image: 'https://aimvjpndmipmtavpmjnn.supabase.co/storage/v1/object/public/recipe-images/6bea1ad3-6552-45b9-9d21-acec968d3655/temp-1765046911643-m8lp738ew-1765046912037.jpg',
      readyInMinutes: 20,
      servings: 36,
      source_type: 'popular',
      source_author: 'mumsfoodies',
      summary: 'Delicious and easy garlic mozzarella puffs, perfect for appetizers.',
      extendedIngredients: [
        { name: 'puff pastry', unit: 'sheet', amount: 1, original: '1 sheet puff pastry' },
        { name: 'grated mozzarella', unit: 'g', amount: 200, original: '200g grated mozzarella' },
        { name: 'garlic cloves', unit: '', amount: 3, original: '3 garlic cloves crushed' },
        { name: 'oregano', unit: 'tsp', amount: 0.5, original: '1/2 tsp oregano' },
        { name: 'pancetta or bacon', unit: 'g', amount: 100, original: '100g pancetta or bacon crispy' },
        { name: 'egg', unit: '', amount: 1, original: '1 egg for brushing' },
        { name: 'chopped parsley', unit: '', amount: 1, original: 'Chopped parsley' },
        { name: 'olive oil', unit: 'ml', amount: 20, original: '20-30ml olive oil' },
      ],
      analyzedInstructions: [
        { name: '', steps: [
          { step: 'Preheat oven to 180C.', number: 1 },
          { step: 'Mix mozzarella, garlic, oregano salt and pepper and sprinkle it on your pastry.', number: 2 },
          { step: "Break up pancetta if you're using it and sprinkle over.", number: 3 },
          { step: 'Slice down the middle lengthways and then widthways about 1-1.5cm wide to create 2 strips per row.', number: 4 },
          { step: "Press down the edges and roll them up, once they're rolled press them down well to flatten them.", number: 5 },
          { step: 'Brush with egg wash and bake for 14-20 min depending on your oven.', number: 6 },
          { step: 'Brush with the garlic oil as soon as they come out.', number: 7 },
        ]}
      ],
    },
    {
      id: 'e022283b-07af-4657-bf00-726a18ea26f6',
      title: 'Roast Potatoes',
      image: 'https://aimvjpndmipmtavpmjnn.supabase.co/storage/v1/object/public/recipe-images/6bea1ad3-6552-45b9-9d21-acec968d3655/temp-1765045709517-34ziswaz7-1765045710042.jpg',
      readyInMinutes: 90,
      servings: 6,
      source_type: 'popular',
      source_author: 'easyfoodrecipesgram',
      summary: 'Classic roast potatoes, perfect for Christmas dinner or any roast.',
      extendedIngredients: [
        { name: 'king edward potatoes', unit: 'kg', amount: 2, original: '2kg king Edward potatoes, peeled and cut into chunks' },
        { name: 'garlic cloves', unit: 'cloves', amount: 4, original: 'A few garlic cloves, peeled and crushed' },
        { name: 'goose / duck / beef fat', unit: 'g', amount: 500, original: '500g goose / duck / beef fat' },
        { name: 'rosemary sprigs', unit: 'sprigs', amount: 3, original: 'Few sprigs of rosemary' },
        { name: 'lemon zest', unit: 'zest', amount: 1, original: 'Zest of 1 lemon' },
        { name: 'sea salt', unit: 'sprinkling', amount: 1, original: 'Generous sprinkling of sea salt' },
      ],
      analyzedInstructions: [
        { name: '', steps: [
          { step: 'Add the potatoes into a pot with a pinch of salt and the garlic cloves, cover with cold water and bring to a boil. Cook for roughly 10 minutes until fork tender.', number: 1 },
          { step: 'Preheat an oven to 200 C / 390 F fan.', number: 2 },
          { step: "Strain the boiled potatoes then leave to steam dry in the colander for a few minutes. Add back into the dry pot, cover with a lid and shake to lightly fluff them up.", number: 3 },
          { step: 'Add the goose fat into two baking trays, place into the oven and preheat the oil for 15 minutes.', number: 4 },
          { step: 'Remove the tray from the oven and carefully add in the potatoes. Coat each potato in the goose fat.', number: 5 },
          { step: 'Cook the potatoes for 60-75 minutes, turning every 20 minutes or so.', number: 6 },
          { step: 'Blend together the rosemary, lemon zest and salt for the rosemary salt.', number: 7 },
          { step: 'Once golden brown, remove and toss with rosemary salt.', number: 8 },
        ]}
      ],
    },
  ];

  // Default recommended recipes for new users with no saved recipes
  const DEFAULT_RECOMMENDED_RECIPES = [
    {
      id: 'recommended-1',
      title: "Mama's Minestrone Soup",
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
      readyInMinutes: 45,
      servings: 6,
      source_type: 'recommended',
      cuisines: ['Italian'],
      dishTypes: ['soup', 'main course'],
      extendedIngredients: [
        { original: '2 tablespoons olive oil' },
        { original: '1 large onion, diced' },
        { original: '3 carrots, sliced' },
        { original: '3 celery stalks, sliced' },
        { original: '4 cloves garlic, minced' },
        { original: '1 medium zucchini, diced' },
        { original: '1 cup green beans, trimmed and cut' },
        { original: '1 can (14 oz) diced tomatoes' },
        { original: '1 can (15 oz) cannellini beans, drained' },
        { original: '6 cups vegetable broth' },
        { original: '1 cup small pasta (ditalini or elbow)' },
        { original: '2 cups fresh spinach' },
        { original: '1 teaspoon Italian herbs' },
        { original: 'Salt and pepper to taste' },
        { original: 'Parmesan cheese for serving' }
      ],
      instructions: '1. Heat olive oil in a large pot over medium heat. Add onion, carrots, and celery. Cook for 5 minutes until softened.\n\n2. Add garlic and cook for 1 minute until fragrant. Add zucchini and green beans, cook for 3 minutes.\n\n3. Pour in diced tomatoes and vegetable broth. Add Italian herbs, salt, and pepper. Bring to a boil.\n\n4. Reduce heat and simmer for 15 minutes. Add pasta and cannellini beans. Cook for 10 more minutes until pasta is tender.\n\n5. Stir in fresh spinach until wilted. Serve hot with freshly grated Parmesan cheese.'
    },
    {
      id: 'recommended-2',
      title: 'Healthy One Pot Pasta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
      readyInMinutes: 25,
      servings: 4,
      source_type: 'recommended',
      cuisines: ['Italian'],
      dishTypes: ['main course', 'pasta'],
      extendedIngredients: [
        { original: '12 oz spaghetti or linguine' },
        { original: '2 cups cherry tomatoes, halved' },
        { original: '3 cups fresh spinach' },
        { original: '4 cloves garlic, thinly sliced' },
        { original: '3 tablespoons olive oil' },
        { original: '1/2 cup fresh basil leaves' },
        { original: '4 cups vegetable broth' },
        { original: '1/2 cup Parmesan cheese, grated' },
        { original: '1/4 teaspoon red pepper flakes' },
        { original: 'Salt and pepper to taste' }
      ],
      instructions: '1. Add pasta, cherry tomatoes, spinach, garlic, olive oil, basil, and vegetable broth to a large pot.\n\n2. Bring to a boil over high heat, stirring frequently to prevent pasta from sticking.\n\n3. Reduce heat to medium and cook for 10-12 minutes, stirring often, until pasta is al dente and liquid has reduced to a sauce.\n\n4. Remove from heat. Stir in Parmesan cheese and red pepper flakes. Season with salt and pepper.\n\n5. Serve immediately, garnished with extra basil and Parmesan.'
    },
    {
      id: 'recommended-3',
      title: 'Garlic Noodles',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
      readyInMinutes: 20,
      servings: 4,
      source_type: 'recommended',
      cuisines: ['Asian', 'Fusion'],
      dishTypes: ['main course', 'side dish'],
      extendedIngredients: [
        { original: '12 oz egg noodles or spaghetti' },
        { original: '4 tablespoons butter' },
        { original: '8 cloves garlic, minced' },
        { original: '2 tablespoons soy sauce' },
        { original: '1 tablespoon oyster sauce' },
        { original: '1/2 cup Parmesan cheese, grated' },
        { original: '4 green onions, sliced' },
        { original: '1/4 teaspoon black pepper' }
      ],
      instructions: '1. Cook noodles according to package directions. Reserve 1/2 cup pasta water, then drain.\n\n2. In the same pot, melt butter over medium heat. Add minced garlic and cook for 1-2 minutes until golden and fragrant (be careful not to burn).\n\n3. Add soy sauce and oyster sauce to the garlic butter. Stir to combine.\n\n4. Return noodles to the pot. Toss to coat evenly with the garlic butter sauce. Add pasta water if needed.\n\n5. Remove from heat. Add Parmesan cheese and toss. Serve topped with green onions and black pepper.'
    },
    {
      id: 'recommended-4',
      title: 'One Pan Mediterranean Chicken',
      image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80',
      readyInMinutes: 35,
      servings: 4,
      source_type: 'recommended',
      cuisines: ['Mediterranean', 'Greek'],
      dishTypes: ['main course', 'dinner'],
      extendedIngredients: [
        { original: '4 bone-in chicken thighs' },
        { original: '3 tablespoons olive oil' },
        { original: '1 lemon, juiced and zested' },
        { original: '4 cloves garlic, minced' },
        { original: '1 cup cherry tomatoes' },
        { original: '1/2 cup Kalamata olives' },
        { original: '1 can (14 oz) artichoke hearts, drained' },
        { original: '1/2 cup feta cheese, crumbled' },
        { original: '1 tablespoon dried oregano' },
        { original: 'Salt and pepper to taste' },
        { original: 'Fresh parsley for garnish' }
      ],
      instructions: '1. Preheat oven to 425°F (220°C). Season chicken thighs with salt, pepper, and oregano.\n\n2. Heat olive oil in a large oven-safe skillet over medium-high heat. Sear chicken skin-side down for 5 minutes until golden. Flip and cook 2 more minutes.\n\n3. Add garlic, cherry tomatoes, olives, and artichoke hearts around the chicken. Drizzle with lemon juice.\n\n4. Transfer skillet to oven. Roast for 20-25 minutes until chicken reaches 165°F internal temperature.\n\n5. Remove from oven. Top with crumbled feta, lemon zest, and fresh parsley. Serve immediately.'
    }
  ];

  // Clean up shortcut install timer on unmount or when tour step changes
  useEffect(() => {
    return () => {
      if (shortcutInstallTimer) {
        console.log('[HomePage] Cleaning up shortcut install timer');
        clearTimeout(shortcutInstallTimer);
      }
    };
  }, [shortcutInstallTimer]);

  // Debug: Log checkoutSecret changes
  useEffect(() => {
    console.log('[HomePage] checkoutSecret changed:', checkoutSecret ? 'Present ✅' : 'Null');
  }, [checkoutSecret]);

  // Check for first PWA launch and show notification prompt
  useEffect(() => {
    // Only check if user is logged in
    if (!user) return;

    // Log debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[HomePage] PWA Debug Info:', getDebugInfo());
    }

    // Check if we should show the notification prompt
    if (isPWA && shouldShowNotificationPrompt) {
      // Delay showing the prompt slightly to let the page load
      const timer = setTimeout(() => {
        setShowPWAPrompt(true);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }

    // Mark first launch complete if it's the first PWA launch
    if (isFirstPWALaunch) {
      markFirstLaunchComplete();
    }
  }, [isPWA, isFirstPWALaunch, shouldShowNotificationPrompt, user, markFirstLaunchComplete, getDebugInfo]);

  // Fetch recently added recipes (from both saved_recipes and ai_generated_recipes)
  useEffect(() => {
    const fetchRecentRecipes = async () => {
      if (!user) {
        setRecipesLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('fridgy_token');
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

        // Fetch from both sources in parallel
        const [savedResponse, aiResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/saved-recipes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/ai-recipes/cached`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        let allRecipes = [];

        // Process saved recipes (imported/uploaded)
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const savedRecipes = (savedData.recipes || []).map(recipe => ({
            ...recipe,
            _source: 'saved',
            _sortDate: new Date(recipe.created_at || recipe.updated_at)
          }));
          allRecipes = [...allRecipes, ...savedRecipes];
          console.log('[HomePage] Fetched saved recipes:', savedRecipes.length);
        } else {
          console.error('[HomePage] Failed to fetch saved recipes:', savedResponse.status);
        }

        // Process AI-generated recipes
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          if (aiData.success && aiData.data?.recipes) {
            const aiRecipes = aiData.data.recipes.map((recipe, index) => ({
              id: recipe.id || `ai-${index}`,
              title: recipe.title,
              image: recipe.imageUrl,
              readyInMinutes: recipe.readyInMinutes,
              servings: recipe.servings,
              source_type: 'ai_generated',
              _source: 'ai',
              _sortDate: new Date(aiData.data.metadata?.generatedAt || Date.now())
            }));
            allRecipes = [...allRecipes, ...aiRecipes];
            console.log('[HomePage] Fetched AI recipes:', aiRecipes.length);
          }
        }

        // Sort by date (newest first)
        allRecipes.sort((a, b) => b._sortDate - a._sortDate);

        console.log('[HomePage] Total recent recipes to show:', allRecipes.length);
        setRecentRecipes(allRecipes);
      } catch (error) {
        console.error('[HomePage] Error fetching recent recipes:', error);
      } finally {
        setRecipesLoading(false);
      }
    };

    fetchRecentRecipes();
  }, [user]);

  // Handle PWA notification prompt close
  const handlePWAPromptClose = (notificationsEnabled) => {
    setShowPWAPrompt(false);

    if (notificationsEnabled) {
      // Notifications were successfully enabled
      markNotificationPromptShown();
      console.log('PWA notifications enabled successfully');
    } else {
      // User chose "Maybe Later"
      markNotificationPromptDismissed();
      console.log('PWA notification prompt dismissed');
    }
  };

  // Function to navigate to a page
  const navigateToPage = (path) => {
    navigate(path);
    // ScrollToTop component will handle scrolling
  };

  // Function to navigate to inventory with category filter
  const navigateToCategory = (category) => {
    navigate(`/inventory?category=${encodeURIComponent(category)}`);
    // ScrollToTop component will handle scrolling
  };

  // Calculate category counts from real inventory data
  const getCategoryCounts = () => {
    const counts = {
      'Protein': 0,
      'Dairy': 0,
      'Vegetables': 0,
      'Fruits': 0,
      'Grains': 0,
      'Fats and Oils': 0,
      'Beverages': 0,
      'Seasonings': 0
    };

    items.forEach(item => {
      if (counts.hasOwnProperty(item.category)) {
        counts[item.category]++;
      }
    });

    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Get top 2 expiring items
  const getExpiringItems = () => {
    if (!items || items.length === 0) return [];
    
    return items
      .filter(item => {
        const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 3; // Expiring within 3 days
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)) // Sort by expiry date (earliest first)
      .slice(0, 2); // Take only top 2
  };

  // Get expired items (for fallback display)
  const getExpiredItems = () => {
    if (!items || items.length === 0) return [];

    return items
      .filter(item => {
        const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
        return daysUntilExpiry < 0; // Already expired
      })
      .sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate)) // Sort by expiry date (most recently expired first)
      .slice(0, 2); // Take only top 2
  };

  // Get items with earliest expiry (for "all fresh" state - nothing expiring soon)
  const getEarliestExpiringItems = () => {
    if (!items || items.length === 0) return [];

    return items
      .filter(item => getDaysUntilExpiry(item.expiryDate) > 3) // Only fresh items (more than 3 days out)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)) // Earliest first
      .slice(0, 2); // Take only top 2
  };

  const expiringItems = getExpiringItems();
  const expiredItems = getExpiredItems();
  const earliestItems = getEarliestExpiringItems();

  // Render a recent recipe card
  const renderRecentRecipeCard = (recipe) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    // Get image URL with fallback
    let imageUrl = recipe.image || (recipe.image_urls && recipe.image_urls[0]);

    // Proxy Instagram CDN images
    if (imageUrl && imageUrl.includes('cdninstagram.com')) {
      imageUrl = `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }

    const imageState = recipeImageStates[recipe.id] || 'loading';
    const isAiRecipe = recipe._source === 'ai' || recipe.source_type === 'ai_generated';

    // Open recipe detail modal
    const handleClick = () => {
      setSelectedRecipe(recipe);
      setIsRecipeModalOpen(true);
    };

    // Determine badge text
    let badgeText = null;
    if (recipe.source_type === 'instagram') {
      badgeText = 'Instagram';
    } else if (recipe.source_type === 'facebook') {
      badgeText = 'Facebook';
    } else if (recipe.source_type === 'url' ||
               recipe.source_type === 'website' ||
               (recipe.source_url && !recipe.source_url.includes('instagram') && !recipe.source_url.includes('facebook'))) {
      badgeText = 'Web Blog';
    } else if (isAiRecipe) {
      badgeText = 'AI';
    } else if (recipe.source_type === 'recommended') {
      badgeText = "Chef's Pick";
    } else if (recipe.source_type === 'popular') {
      badgeText = 'Popular';
    }

    return (
      <div
        key={recipe.id}
        className="home-page__recent-recipe-card"
        onClick={handleClick}
      >
        <div className="home-page__recent-recipe-image">
          {imageState === 'loading' && (
            <div className="home-page__image-placeholder" />
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={recipe.title}
              className={`home-page__recipe-img ${imageState === 'loaded' ? 'home-page__recipe-img--loaded' : ''}`}
              onLoad={() => setRecipeImageStates(prev => ({ ...prev, [recipe.id]: 'loaded' }))}
              onError={() => setRecipeImageStates(prev => ({ ...prev, [recipe.id]: 'error' }))}
            />
          )}
          {badgeText && (
            <div className="home-page__recent-recipe-badge">
              <span>{badgeText}</span>
            </div>
          )}
        </div>
        <div className="home-page__recent-recipe-content">
          <h3 className="home-page__recent-recipe-title">{recipe.title}</h3>
          {recipe.source_author && (
            <p className="home-page__recent-recipe-author">@{recipe.source_author}</p>
          )}
          <div className="home-page__recent-recipe-meta">
            {recipe.readyInMinutes && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={ClockIcon} alt="Time" width="14" height="14" style={{ opacity: 0.6 }} />
                {recipe.readyInMinutes} min
              </span>
            )}
            {recipe.servings && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={ServingIcon} alt="Servings" width="14" height="14" style={{ opacity: 0.6 }} />
                {recipe.servings} servings
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="homepage" style={{
      '--primary-green': colors.primary,
      '--primary-green-light': colors.primaryLight,
      '--primary-green-dark': colors.primaryDark,
    }}>
      <AppNavBar />

      {/* Mobile Header - Only visible on mobile - COMMENTED OUT FOR NOW
      <div className="mobile-header">
        <div className="mobile-header-content">
          <img src={appLogo} alt="App logo" className="mobile-logo"/>
          <h2 className="mobile-brand-name">Trackabite</h2>
        </div>
      </div>
      */}

      {/* Hero Section - COMMENTED OUT - greeting moved to navigation
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
                              <h1 className="hero-title">
                  Hello {user?.firstName || 'User'}!
                </h1>
                <p className="hero-subtitle">
                  What are you cooking today?
                </p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Mobile Page Greeting - Without logo */}
      <section className="page-greeting mobile-only">
        <div className="container">
          <div className="greeting-content left-aligned">
            <div className="greeting-text">
              <h1 className="greeting-hello">
                Hello {user?.firstName || 'User'}
              </h1>
              <p className="greeting-subtitle">What are you cooking today?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular now Section */}
      <section className="home-page__popular-now">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Now</h2>
            <p className="section-description">Impress your loved ones this Christmas.</p>
          </div>
          <div className="home-page__recently-added-slider">
            {POPULAR_RECIPES.map(recipe => renderRecentRecipeCard(recipe))}
          </div>
        </div>
      </section>

      {/* Recently Added / Recommended Recipes Section */}
      {(!recipesLoading || recentRecipes.length > 0) && (
        <section className="home-page__recently-added">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                {recentRecipes.length > 0 ? 'You Recently Added' : 'Recommended Recipes'}
              </h2>
              <Link to="/meal-plans/recipes" className="home-page__view-all-link" title="View all recipes">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className="home-page__recently-added-slider">
              {recipesLoading ? (
                <>
                  <div className="home-page__recent-recipe-card home-page__recent-recipe-card--loading">
                    <div className="home-page__recent-recipe-image">
                      <div className="home-page__image-placeholder" />
                    </div>
                    <div className="home-page__recent-recipe-content">
                      <div className="home-page__loading-text" style={{ width: '80%', height: '16px' }} />
                      <div className="home-page__loading-text" style={{ width: '50%', height: '12px', marginTop: '8px' }} />
                    </div>
                  </div>
                  <div className="home-page__recent-recipe-card home-page__recent-recipe-card--loading">
                    <div className="home-page__recent-recipe-image">
                      <div className="home-page__image-placeholder" />
                    </div>
                    <div className="home-page__recent-recipe-content">
                      <div className="home-page__loading-text" style={{ width: '70%', height: '16px' }} />
                      <div className="home-page__loading-text" style={{ width: '40%', height: '12px', marginTop: '8px' }} />
                    </div>
                  </div>
                </>
              ) : recentRecipes.length > 0 ? (
                recentRecipes.map(recipe => renderRecentRecipeCard(recipe))
              ) : (
                DEFAULT_RECOMMENDED_RECIPES.map(recipe => renderRecentRecipeCard(recipe))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-header-with-arrow">
            <h2 className="section-title">In Your Fridge</h2>
          </div>
          <div className="categories-grid">
            <div className="category-card" onClick={() => navigateToCategory('Protein')}>
              <div className="category-count">{categoryCounts['Protein']}</div>
              <div className="category-image">
                <img src={proteinIcon} alt="Protein" className="food-group-icon" />
              </div>
              <h3>Protein</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Dairy')}>
              <div className="category-count">{categoryCounts['Dairy']}</div>
              <div className="category-image">
                <img src={dairyIcon} alt="Dairy" className="food-group-icon" />
              </div>
              <h3>Dairy</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Vegetables')}>
              <div className="category-count">{categoryCounts['Vegetables']}</div>
              <div className="category-image">
                <img src={veggiesIcon} alt="Vegetables" className="food-group-icon" />
              </div>
              <h3>Vegetables</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Fruits')}>
              <div className="category-count">{categoryCounts['Fruits']}</div>
              <div className="category-image">
                <img src={fruitsIcon} alt="Fruits" className="food-group-icon" />
              </div>
              <h3>Fruits</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Grains')}>
              <div className="category-count">{categoryCounts['Grains']}</div>
              <div className="category-image">
                <img src={grainsIcon} alt="Grains" className="food-group-icon" />
              </div>
              <h3>Grains</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Fats and Oils')}>
              <div className="category-count">{categoryCounts['Fats and Oils']}</div>
              <div className="category-image">
                <img src={fatsIcon} alt="Fats and Oils" className="food-group-icon" />
              </div>
              <h3>Fats</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Beverages')}>
              <div className="category-count">{categoryCounts['Beverages']}</div>
              <div className="category-image">
                <img src={beveragesIcon} alt="Beverages" className="food-group-icon" />
              </div>
              <h3>Beverages</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Seasonings')}>
              <div className="category-count">{categoryCounts['Seasonings']}</div>
              <div className="category-image">
                <img src={herbsIcon} alt="Seasonings" className="food-group-icon" />
              </div>
              <h3>Seasonings</h3>
            </div>
          </div>
         </div>
       </section>

      {/* Need Attention Section */}
      <section className="expiring-soon">
        <div className="container">
          {/* Show section headline based on state */}
          {!inventoryLoading && items.length > 0 && (
            <div className="section-header">
              <h2 className="section-title">
                {expiringItems.length > 0 || expiredItems.length > 0 ? 'Need Attention' : 'Use Next'}
              </h2>
            </div>
          )}
          <div className="expiring-content" onClick={() => navigateToPage(items.length === 0 ? '/batchcamera' : '/inventory')}>
            <div className="expiring-items">
              {inventoryLoading ? (
                // Show loading placeholder while inventory is loading
                <>
                  <div className="expiring-item">
                    <div className="loading-placeholder" style={{ width: '150px', height: '20px', marginBottom: '8px' }}></div>
                    <div className="loading-placeholder" style={{ width: '80px', height: '16px' }}></div>
                  </div>
                  <div className="expiring-item">
                    <div className="loading-placeholder" style={{ width: '120px', height: '20px', marginBottom: '8px' }}></div>
                    <div className="loading-placeholder" style={{ width: '60px', height: '16px' }}></div>
                  </div>
                </>
              ) : expiringItems.length > 0 ? (
                // Show expiring items (priority 1)
                expiringItems.map((item) => {
                  const daysLeft = getDaysUntilExpiry(item.expiryDate);
                  const isUrgent = daysLeft <= 1;
                  const daysText = daysLeft === 0 ? 'Today' :
                                  daysLeft === 1 ? '1 day' :
                                  `${daysLeft} days`;

                  return (
                    <div key={item.id} className="expiring-item">
                      <div className="item-info">
                        <h4 className="item-name">{item.itemName}</h4>
                      </div>
                      <div className="expiry-countdown">
                        <span className={`days-left${isUrgent ? ' urgent' : ''}`}>
                          {daysText}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : expiredItems.length > 0 ? (
                // Show expired items (priority 2)
                expiredItems.map((item) => {
                  const daysExpired = Math.abs(getDaysUntilExpiry(item.expiryDate));
                  const daysText = daysExpired === 0 ? 'Expired today' :
                                  daysExpired === 1 ? '1 day ago' :
                                  `${daysExpired} days ago`;

                  return (
                    <div key={item.id} className="expiring-item">
                      <div className="item-info">
                        <h4 className="item-name">{item.itemName}</h4>
                      </div>
                      <div className="expiry-countdown">
                        <span className="days-left expired">
                          {daysText}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : items.length === 0 ? (
                // Show empty state for brand new users (priority 3)
                <div className="empty-fridge-state">
                  <div className="empty-state-icon">
                    <img src={FridgyLogo} alt="Fridgy" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                  </div>
                  <h4 className="empty-state-title">Let's get your fridge started!</h4>
                  <p className="empty-state-subtitle">Add your groceries to begin tracking freshness and reducing waste</p>
                  <button
                    className="empty-state-cta"
                    onClick={(e) => { e.stopPropagation(); navigateToPage('/batchcamera'); }}
                  >
                    + Add Your First Items
                  </button>
                </div>
              ) : earliestItems.length > 0 ? (
                // Show earliest expiring items (priority 4 - has items but none expiring soon)
                earliestItems.map((item) => {
                  const daysLeft = getDaysUntilExpiry(item.expiryDate);

                  return (
                    <div key={item.id} className="expiring-item">
                      <div className="item-info">
                        <h4 className="item-name">{item.itemName}</h4>
                      </div>
                      <div className="expiry-countdown">
                        <span className="days-left fresh">
                          {daysLeft} days
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback - no items with valid expiry dates
                <div className="expiring-item">
                  <div className="item-info">
                    <h4 className="item-name">No items to display</h4>
                    <p className="item-category">Add items with expiry dates to track freshness</p>
                  </div>
                </div>
              )}
            </div>
            {!inventoryLoading && expiringItems.length > 0 && (
              <>
                <div className="expiring-subtitle">
                  <p>
                    {expiringItems.every(item => item.category === 'Beverages')
                      ? 'Enjoy them before they expire!'
                      : 'They are still good. See how to use them in Meals.'}
                  </p>
                </div>
                <div className="expiring-reminders">
                  <span className="reminder-text">+{expiringItems.length} reminders</span>
                  <div className="reminder-arrow">→</div>
                </div>
              </>
            )}
            {!inventoryLoading && expiredItems.length > 0 && expiringItems.length === 0 && (
              <>
                <div className="expiring-subtitle expired-subtitle">
                  <p>Check if these items are still good or dispose of them.</p>
                </div>
                <div className="expiring-reminders">
                  <span className="reminder-text">+{expiredItems.length} expired</span>
                  <div className="reminder-arrow">→</div>
                </div>
              </>
            )}
            {!inventoryLoading && earliestItems.length > 0 && expiringItems.length === 0 && expiredItems.length === 0 && (
              <>
                <div className="expiring-subtitle fresh-subtitle">
                  <p>Start with these to keep your fridge fresh</p>
                </div>
                <div className="expiring-reminders">
                  <span className="reminder-text">View all →</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cook What You Have Section - COMMENTED OUT
      <section className="cook-what-you-have">
        <div className="container">
          <div className="section-header-with-arrow">
            <h2 className="section-title">Cook What You Already Have</h2>
            <button className="slider-arrow">
              <span className="arrow-text">More recipes</span>
              <span className="arrow-icon">→</span>
            </button>
          </div>
          <div className="meals-slider">
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center" alt="Vegetable Stir Fry" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Fresh Vegetable Stir Fry</h3>
                <button className="cook-btn">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 85%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 35 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&crop=center" alt="Garden Salad Bowl" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Garden Salad Bowl</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 92%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 32 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center" alt="Protein Power Bowl" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Protein Power Bowl</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 78%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 40 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop&crop=center" alt="Quick Pasta Dish" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Quick Pasta Dish</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 88%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 30 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}


      {/* Inspired by Your Preference Section - COMMENTED OUT
      <section className="cook-what-you-have">
        <div className="container">
          <div className="section-header-with-arrow">
            <h2 className="section-title">Inspired by your preference</h2>
            <button className="slider-arrow">
              <span className="arrow-text">More recipes</span>
              <span className="arrow-icon">→</span>
            </button>
          </div>
          <div className="meals-slider">
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• Trending</span>
                <img src="https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop&crop=center" alt="Spicy Thai Curry" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Spicy Thai Curry</h3>
                <button className="cook-btn">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 76%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 42 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• Popular</span>
                <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center" alt="Mediterranean Chicken" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Mediterranean Chicken</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 89%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 38 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• New</span>
                <img src="https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop&crop=center" alt="Korean Bibimbap Bowl" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Korean Bibimbap Bowl</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 82%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 45 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• Chef's Pick</span>
                <img src="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&crop=center" alt="Italian Risotto" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Italian Risotto</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 91%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 35 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Additional Hello Section - COMMENTED OUT
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Hello {user?.firstName || 'User'}!
              </h1>
              <p className="hero-subtitle">
                What are you cooking today?
              </p>
            </div>
            <div className="hero-image">
              <div className="food-bowl">
                <img src="/hero-bowl.jpg" alt="Fresh healthy bowl" className="bowl-image" />
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Your Shopping List Section - COMMENTED OUT
      <section className="expiring-soon">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Your shopping list
            </h2>
          </div>
          <div className="expiring-items shopping-items">
            <div className="expiring-item shopping-item">
              <div className="item-checkbox">
                <input type="checkbox" id="milk" />
                <label htmlFor="milk"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Milk</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 gal</span>
              </div>
            </div>
            <div className="expiring-item shopping-item">
              <div className="item-checkbox">
                <input type="checkbox" id="butter" />
                <label htmlFor="butter"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Butter</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="parmesan" defaultChecked readOnly />
                <label htmlFor="parmesan"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Parmesan cheese</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="eggs" defaultChecked readOnly />
                <label htmlFor="eggs"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Eggs</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">4 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="bread" />
                <label htmlFor="bread"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Bread</h4>
                <p className="item-category">Bakery</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="muffins" defaultChecked readOnly />
                <label htmlFor="muffins"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Blueberry muffins</h4>
                <p className="item-category">Bakery</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">2 ct</span>
              </div>
            </div>
          </div>
          <div className="shopping-list-footer">
            <button className="add-items-btn">
              <span className="add-icon">+</span>
              Add more items
            </button>
          </div>
        </div>
      </section>
      */}

      {/* Quick Access & Analytics Section */}
      <section className="quick-access">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Quick Access</h2>
          </div>
          <div className="quick-access-grid">
            <div 
              className="quick-access-item primary"
              onClick={() => navigateToPage('/batchcamera')}
            >
              <div className="quick-access-icon">
                <AddToFridgeIcon />
              </div>
              <span className="quick-access-label">Add to fridge</span>
            </div>
            <div 
              className="quick-access-item"
              onClick={() => navigateToPage('/inventory')}
            >
              <div className="quick-access-icon">
                <MyFridgeIcon />
              </div>
              <span className="quick-access-label">My fridge</span>
            </div>
            <div
              className="quick-access-item"
              onClick={() => navigateToPage('/inventory/shopping-list')}
            >
              <div className="quick-access-icon">
                <ShopListsIcon />
              </div>
              <span className="quick-access-label">Shop lists</span>
            </div>
            <div 
              className="quick-access-item"
              onClick={() => navigateToPage('/meal-plans')}
            >
              <div className="quick-access-icon">
                <RecipesIcon />
              </div>
              <span className="quick-access-label">Meals</span>
            </div>
          </div>

          {/* Your Analytics - within same container */}
          <div className="section-header" style={{marginTop: '2.5rem'}}>
            <h2 className="section-title">Your Analytics</h2>
          </div>
          <div className="analytics-grid">
            {/* Inventory Usage - Premium Only */}
            <div
              className="analytics-item"
              onClick={() => {
                if (isPremium) {
                  navigateToPage('/analytics/inventory');
                } else {
                  setUpgradeModal({
                    isOpen: true,
                    feature: 'inventory analytics',
                    current: null,
                    limit: null
                  });
                }
              }}
              style={{
                position: 'relative',
                opacity: isPremium ? 1 : 0.7,
                cursor: 'pointer'
              }}
            >
              <div className="analytics-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Modern bar chart icon for inventory usage */}
                  <rect x="5" y="12" width="3" height="7" rx="0.5"/>
                  <rect x="10.5" y="8" width="3" height="11" rx="0.5"/>
                  <rect x="16" y="5" width="3" height="14" rx="0.5"/>
                </svg>
              </div>
              <span className="analytics-label">Inventory Usage</span>
              {!isPremium && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#ffd700',
                  color: '#000',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Pro</span>
                </div>
              )}
            </div>

            {/* Meals Analytics - Free for all */}
            <div
              className="analytics-item"
              onClick={() => navigateToPage('/meal-history')}
            >
              <div className="analytics-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Modern pie chart icon for meals analytics */}
                  <circle cx="12" cy="12" r="8" strokeWidth="2.5"/>
                  <path d="M12 4 L12 12 L18.5 8" strokeWidth="2.5"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <span className="analytics-label">Meals Analytics</span>
            </div>
          </div>
        </div>
      </section>

      <MobileBottomNav />

      {/* PWA First Launch Notification Prompt */}
      {showPWAPrompt && (
        <PWANotificationPrompt
          onClose={handlePWAPromptClose}
          onSuccess={() => console.log('Notifications setup successful')}
          platform={platform}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false })}
        feature={upgradeModal.feature}
        current={upgradeModal.current}
        limit={upgradeModal.limit}
        startCheckout={startCheckout}
        previewContent={upgradeModal.feature === 'inventory analytics' ? (
          <img
            src="/images/inventory-analytics-preview.png"
            alt="Analytics Dashboard Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      />

      {/* Checkout Modal with Payment Element */}
      {checkoutSecret && (
        <CheckoutModal
          onClose={closeCheckout}
          onSuccess={refresh}
        />
      )}

      {/* Welcome Prompt for Guided Tour */}
      {shouldShowTooltip(STEPS.WELCOME_SCREEN) && (
        <WelcomePrompt
          onStart={() => {
            console.log('[HomePage] User clicked Start Tour - advancing to groceries intro');
            nextStep(); // Advances to GROCERIES_INTRO
          }}
          onSkip={() => {
            console.log('[HomePage] User clicked Skip Tour');
            dismissTour(); // Dismiss the tour completely
          }}
        />
      )}

      {/* Groceries Introduction Modal - "Let's start by logging your first item" */}
      {shouldShowTooltip(STEPS.GROCERIES_INTRO) && (
        <IntroductionModal
          title="Let's start by logging your first item"
          message="We'll guide you through adding items to your fridge inventory using the camera."
          onContinue={() => {
            console.log('[HomePage] Groceries intro - advancing to ADD_GROCERIES');
            nextStep(); // Advances to ADD_GROCERIES
          }}
          onClose={() => {
            console.log('[HomePage] User skipped logging first item');
            dismissTour();
          }}
          continueLabel="Continue"
          skipLabel="Skip logging first item"
        />
      )}

      {/* Generate Recipes Introduction Modal */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_INTRO) && (
        <GenerateRecipesIntroModal
          onContinue={() => {
            console.log('[HomePage] Generate recipes intro - advancing to NAV_TO_MEALS');
            nextStep(); // Advances to GENERATE_RECIPES_NAV_TO_MEALS
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped generate recipes tour');
            dismissTour();
          }}
        />
      )}

      {/* Generate Recipes - Tooltip to Navigate to Meals */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_NAV_TO_MEALS) && (
        <GuidedTooltip
          targetSelector=".mobile-bottom-nav .nav-tab:nth-child(4)"
          message="Start by heading to Meals page"
          position="top"
          showAction={false}
          highlight={true}
          offset={20}
        />
      )}

      {/* Shortcut Introduction Modal - "Let's install your shortcut" */}
      {shouldShowTooltip(STEPS.SHORTCUT_INTRO) && (
        <IntroductionModal
          title="Let's install your shortcut"
          message="We'll help you set up a quick way to import recipes from Instagram."
          onContinue={() => {
            console.log('[HomePage] Shortcut intro - advancing to INSTALL_SHORTCUT');
            nextStep(); // Advances to INSTALL_SHORTCUT
          }}
          onClose={() => {
            console.log('[HomePage] User skipped installing shortcut');
            dismissTour();
          }}
          continueLabel="Continue"
          skipLabel="Skip installing shortcut"
        />
      )}

      {/* Shortcut Install Modal - iOS Only */}
      {shouldShowTooltip(STEPS.INSTALL_SHORTCUT) && isIOS() && (
        <ShortcutInstallModal
          onInstall={() => {
            console.log('[HomePage] User clicked Install Shortcut, starting 10-second timer');

            // Mark that user clicked install
            setUserClickedInstall(true);

            // Clear any existing timer
            if (shortcutInstallTimer) {
              clearTimeout(shortcutInstallTimer);
            }

            // Start 10-second timer
            const timer = setTimeout(() => {
              // Only show confirmation if user still intended to install
              if (userClickedInstall) {
                console.log('[HomePage] Timer fired, showing confirmation');
                nextStep(); // Show SHORTCUT_CONFIRMATION
              } else {
                console.log('[HomePage] Timer fired but user cancelled intent, not showing confirmation');
              }
            }, 10000);

            setShortcutInstallTimer(timer);
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped shortcut installation - jumping to recipe import');

            // Clear timer and intent flag
            if (shortcutInstallTimer) {
              clearTimeout(shortcutInstallTimer);
              setShortcutInstallTimer(null);
            }
            setUserClickedInstall(false);

            goToStep(STEPS.RECIPE_INTRO); // Skip entire shortcut flow, go to recipe import
          }}
          onCancelTimer={() => {
            console.log('[HomePage] Cancelling install timer - user clicked skip');

            // Clear timer and intent flag
            if (shortcutInstallTimer) {
              clearTimeout(shortcutInstallTimer);
              setShortcutInstallTimer(null);
            }
            setUserClickedInstall(false);
          }}
        />
      )}

      {/* Shortcut Confirmation Modal */}
      {shouldShowTooltip(STEPS.SHORTCUT_CONFIRMATION) && (
        <ShortcutConfirmationModal
          onYes={() => {
            console.log('[HomePage] User confirmed shortcut installed');
            nextStep(); // Move to SHORTCUT_SUCCESS_BRIDGE
          }}
          onNo={() => {
            console.log('[HomePage] User needs to install shortcut');
            goToStep(STEPS.INSTALL_SHORTCUT); // Back to shortcut install flow
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped confirmation');
            dismissTour();
          }}
        />
      )}

      {/* Shortcut Success Bridge Modal */}
      {shouldShowTooltip(STEPS.SHORTCUT_SUCCESS_BRIDGE) && (
        <ShortcutSuccessBridgeModal
          onLetsGo={() => {
            console.log('[HomePage] Starting recipe import flow');
            nextStep(); // Move to IMPORT_RECIPE_INTRO
          }}
        />
      )}

      {/* Recipe Import Intro Modal */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_INTRO) && (
        <RecipeImportIntroModal
          onShowMeHow={() => {
            console.log('[HomePage] Checking notification status');
            // Check notification permission
            const notificationStatus = checkNotificationPermission();
            setPreFlightStatus({
              hasNotifications: notificationStatus === 'granted',
              hasShortcut: false // Will ask user manually
            });
            nextStep(); // Move to IMPORT_RECIPE_PREFLIGHT
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped recipe import');
            dismissTour();
          }}
        />
      )}

      {/* Pre-Flight Check Modal - Two-step check */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_PREFLIGHT) && (
        <PreFlightCheckModal
          hasNotifications={preFlightStatus.hasNotifications}
          onContinue={() => {
            console.log('[HomePage] Continuing to recipe import steps');
            nextStep(); // Move to IMPORT_RECIPE_STEP_1
          }}
          onEnableNotifications={async () => {
            console.log('[HomePage] Requesting notification permission');
            const permission = await requestNotificationPermission();
            if (permission === 'granted') {
              setPreFlightStatus(prev => ({ ...prev, hasNotifications: true }));
            }
          }}
          onInstallShortcut={() => {
            console.log('[HomePage] User needs shortcut, redirecting to install flow');
            goToStep(STEPS.INSTALL_SHORTCUT);
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped preflight check');
            dismissTour();
          }}
        />
      )}

      {/* Step 1: Open an Instagram Post (Tutorial) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_1) && (
        <RecipeImportStepModal
          stepNumber={1}
          title="Open an Instagram Post"
          description="First, you'll need to find a recipe on Instagram that you want to save."
          showPhoneFrame={true}
          frameImage={importRecipeStep1Image}
          buttonText="Next"
          showBackButton={false}
          onNext={() => {
            console.log('[HomePage] Step 1 complete, moving to Step 2');
            nextStep();
          }}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 2: Tap the Share Icon (Tutorial) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_2) && (
        <RecipeImportStepModal
          stepNumber={2}
          title={
            <>
              Tap <span style={{color: 'var(--primary-green, #4fcf61)'}}>Share</span> Icon and Click{' '}
              <span style={{color: 'var(--primary-green, #4fcf61)'}}>Share to</span>
            </>
          }
          description="Find the paper airplane icon at the bottom of the Instagram post and tap it."
          videoSrc="/videos/import-tutorial/step2-tap-share.mp4"
          buttonText="Next"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_1)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 3: Scroll Down and Select (Tutorial - Combined) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_3) && (
        <RecipeImportStepModal
          stepNumber={3}
          title={
            <>
              Scroll Down and Select{' '}
              <span style={{color: 'var(--primary-green, #4fcf61)'}}>Save to Trackabite</span>
            </>
          }
          description="Scroll through the share menu and tap the 'Save to Trackabite' shortcut."
          videoSrc="/videos/import-tutorial/step3-save-to-trackabite.mp4"
          buttonText="Next"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_2)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 4: Allow Instagram to Send Items (NEW) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_4) && (
        <RecipeImportStepModal
          stepNumber={4}
          title={
            <>
              <span style={{color: 'var(--primary-green, #4fcf61)'}}>Always Allow</span>
              {' '}Instagram to Send Items to Trackabite
            </>
          }
          description="Tap 'Always Allow' to allow Instagram to send items to Trackabite."
          icon={{ type: 'img', src: importRecipeStep4Image }}
          buttonText="Next"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_3)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 5: View Your Recipe (Tutorial) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_5) && (
        <RecipeImportStepModal
          stepNumber={5}
          title="View Your Recipe"
          description="Wait for our Fridgy to analyze your recipe and view it when it's ready."
          icon="checkmark"
          buttonText="Ok, Got It"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_4)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 6: Let's Start Importing (Action!) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_6) && (
        <RecipeImportStepModal
          stepNumber={6}
          title={<><div style={{fontSize: '0.9rem', fontWeight: '400', color: '#666', marginBottom: '0.5rem'}}>Perfecto!</div>Now Let's Start Importing Your First Recipe!</>}
          description=""
          icon={cookingIcon}
          buttonText="Open an Instagram Post"
          onNext={() => {
            console.log('[HomePage] Opening Instagram and starting detection');
            window.open('https://www.instagram.com/p/DGioQ5qOWij/', '_blank');

            // Start detection immediately
            detectRecipeImport({
              onSuccess: (recipe) => {
                console.log('[HomePage] Recipe detected!', recipe);
                setImportedRecipe(recipe);
                goToStep(STEPS.IMPORT_RECIPE_SUCCESS);
              },
              onTimeout: () => {
                console.log('[HomePage] Detection timed out');
                alert('We couldn\'t find your imported recipe. Please try again or check your saved recipes.');
                dismissTour();
              }
            });
          }}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_5)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Recipe Import Success Modal */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_SUCCESS) && (
        <RecipeImportSuccessModal
          recipe={importedRecipe}
          onViewRecipes={() => {
            console.log('[HomePage] Viewing recipes');
            completeTour();
            navigate('/saved-recipes');
          }}
          onContinue={() => {
            console.log('[HomePage] Continuing tour');
            completeTour();
          }}
        />
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setSelectedRecipe(null);
        }}
        recipe={selectedRecipe}
      />
    </div>
  );
};

export default HomePage; 