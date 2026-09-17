/*
 * Onboarding step map + copy, ported from the iOS app.
 * Source of truth: /Users/jessie/trackabite-mobile/features/onboarding/constants/index.ts
 * Copy is verbatim, including the \n line breaks (screens render them via
 * `white-space: pre-line`, see onboarding-primitives.css).
 *
 * Step numbers live here and nowhere else — OnboardingFlow, useOnboarding,
 * PaymentScreen and onboardingTracking all import from this file so the
 * numbering cannot drift apart again.
 */

import {
  LayoutGrid,
  Wallet,
  Leaf,
  Heart,
  Clock,
  UtensilsCrossed,
  Zap,
  Hourglass,
  Coffee,
} from 'lucide-react';

/* ---- Step map ------------------------------------------------------- */

export const STEPS = {
  WELCOME: 1,
  GOAL: 2,
  GOAL_CONFIRM: 3,
  HOUSEHOLD: 4,
  BUDGET: 5,
  DIETARY: 6,
  ALLERGIES: 7,
  COOKING_TIME: 8,
  REASSURANCE: 9,
  HOW_IT_HELPS: 10,
  FEATURE_INVENTORY: 11,
  FEATURE_RECIPES: 12,
  FEATURE_MEAL_PLANNING: 13,
  FEATURE_SHOPPING: 14,
  PUSH_NOTIFICATIONS: 15,
  READY_ROUTINE: 16,
  PAYWALL: 17,
  PAYMENT: 18,
  CREATE_ACCOUNT: 19,
};

/* Index = step number - 1. Used for analytics step names. */
export const STEP_ORDER = [
  'welcome',
  'goal',
  'goal_confirmation',
  'household_size',
  'weekly_budget',
  'dietary_restrictions',
  'allergies',
  'cooking_time',
  'reassurance',
  'how_it_helps',
  'feature_inventory',
  'feature_recipes',
  'feature_meal_planning',
  'feature_shopping',
  'push_notifications',
  'ready_routine',
  'paywall',
  'payment',
  'account_creation',
];

export const TOTAL_STEPS = STEP_ORDER.length;

/*
 * The progress bar shows on steps 2-16 only, reading 1/15 .. 15/15 —
 * matching PROGRESS_VISIBLE_STEPS on the app. Welcome, the paywall,
 * Stripe and account creation show no bar.
 */
export const PROGRESS_STEPS = [
  STEPS.GOAL,
  STEPS.GOAL_CONFIRM,
  STEPS.HOUSEHOLD,
  STEPS.BUDGET,
  STEPS.DIETARY,
  STEPS.ALLERGIES,
  STEPS.COOKING_TIME,
  STEPS.REASSURANCE,
  STEPS.HOW_IT_HELPS,
  STEPS.FEATURE_INVENTORY,
  STEPS.FEATURE_RECIPES,
  STEPS.FEATURE_MEAL_PLANNING,
  STEPS.FEATURE_SHOPPING,
  STEPS.PUSH_NOTIFICATIONS,
  STEPS.READY_ROUTINE,
];

export const TOTAL_PROGRESS = PROGRESS_STEPS.length; // 15

/** Returns { index, total } for the progress bar, or null if the step has none. */
export const getProgress = (step) => {
  const index = PROGRESS_STEPS.indexOf(step);
  return index === -1 ? null : { index, total: TOTAL_PROGRESS };
};

/* ---- Goals ---------------------------------------------------------- */

export const GOAL_OPTIONS = [
  { id: 'organize', label: 'Get organized', Icon: LayoutGrid },
  { id: 'save_money', label: 'Save money', Icon: Wallet },
  { id: 'reduce_waste', label: 'Reduce waste', Icon: Leaf },
  { id: 'eat_healthy', label: 'Eat healthier', Icon: Heart },
  { id: 'save_time', label: 'Save time', Icon: Clock },
  { id: 'try_recipes', label: 'Try new recipes', Icon: UtensilsCrossed },
];

export const GOAL_CONFIRMATION_MESSAGES = {
  save_money: {
    title: "Let's save you money!",
    message:
      'Trackabite helps you reduce food waste and plan smarter meals, so you spend less on groceries.',
  },
  reduce_waste: {
    title: 'Less waste, more taste!',
    message:
      "With expiration tracking and smart meal planning, you'll use what you have before it goes bad.",
  },
  eat_healthy: {
    title: 'Healthy eating made easy!',
    message:
      'Plan balanced meals and track your ingredients to build better eating habits.',
  },
  save_time: {
    title: 'More time for what matters!',
    message:
      'Quick meal planning, auto-generated shopping lists, and recipe suggestions save you hours each week.',
  },
  try_recipes: {
    title: 'Adventure awaits in your kitchen!',
    message:
      "Import recipes from anywhere and get suggestions based on what's in your pantry.",
  },
  organize: {
    title: "Let's get things\nunder control.",
    message:
      'Trackabite helps you track inventory, plan meals, and make it easy to stay on top of things.',
  },
};

/* ---- Dietary + allergies -------------------------------------------- */

/*
 * The app stores display labels ('Tree nuts'); the web stores slugs and
 * src/pages/DietaryPreferencesPage.js matches on those. Copying the app's
 * labels verbatim would make a user's own onboarding answers render as
 * unselected in their web profile — so we show the app's label and store
 * the web's slug.
 */
export const DIETARY_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
];

export const ALLERGY_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree-nuts', label: 'Tree nuts' },
  { id: 'milk', label: 'Milk' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'wheat', label: 'Wheat' },
  { id: 'soy', label: 'Soy' },
  { id: 'sesame', label: 'Sesame' },
];

export const NONE_ID = 'none';

/* ---- Cooking time ---------------------------------------------------- */

export const COOKING_TIME_OPTIONS = [
  { id: 'under_15', label: 'Under 15 min', Icon: Zap },
  { id: '15_30', label: '15-30 min', Icon: Clock },
  { id: '30_60', label: '30-60 min', Icon: Hourglass },
  { id: 'over_60', label: '60+ min', Icon: Coffee },
];

/* ---- Household + budget ---------------------------------------------- */

export const HOUSEHOLD_MIN = 1;
export const HOUSEHOLD_MAX = 10;

export const CURRENCY_OPTIONS = [
  { id: 'USD', symbol: '$', label: 'USD $' },
  { id: 'EUR', symbol: '€', label: 'EUR €' },
  { id: 'GBP', symbol: '£', label: 'GBP £' },
  { id: 'CAD', symbol: 'C$', label: 'CAD C$' },
];

export const CURRENCY_SYMBOLS = CURRENCY_OPTIONS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.symbol }),
  {}
);

/* [25, 50, 100, 150, ... 1000] — matches BUDGET_VALUES on the app. */
export const BUDGET_VALUES = [
  25,
  ...Array.from({ length: 20 }, (_, i) => (i + 1) * 50),
];

export const BUDGET_DEFAULT = 100;
export const BUDGET_ITEM_HEIGHT = 50;
export const BUDGET_VISIBLE_ITEMS = 5;

/* ---- Feature screens (steps 11-14) ------------------------------------ */

const VIDEO_BASE = '/videos/onboarding';

export const FEATURE_SLIDES = [
  {
    id: 'inventory',
    title: "Always know\nwhat's in your fridge",
    description:
      'No more digging, guessing, or buying things you already have with ',
    highlightText: 'inventory tracking',
    descriptionAfter: '.',
    video: `${VIDEO_BASE}/track-inventory.mp4`,
  },
  {
    id: 'recipes',
    title: 'Keep all your recipes\nin one place',
    description: 'Save them from ',
    highlightText: 'anywhere',
    descriptionAfter: " and keep them ready when it's time to cook.",
    video: `${VIDEO_BASE}/save-recipes.mp4`,
  },
  {
    id: 'meal-planning',
    title: 'No more\n"what\'s for dinner?"',
    description:
      "Know what you're cooking before you're hungry — and stay on track all week with ",
    highlightText: 'smart meal planning.',
    descriptionAfter: '',
    video: `${VIDEO_BASE}/meal-planning.mp4`,
  },
  {
    id: 'shopping',
    title: 'Shop exactly\nwhat you need.',
    description:
      'Combine all shared ingredients into one clear shopping list for the week.',
    highlightText: '',
    descriptionAfter: '',
    video: `${VIDEO_BASE}/shopping-list.mp4`,
  },
];

export const getFeatureSlide = (id) =>
  FEATURE_SLIDES.find((slide) => slide.id === id);

/* Mascot clips, shared by several screens. */
export const VIDEOS = {
  wave: `${VIDEO_BASE}/trackie-wave.mp4`,
  reaffirm: `${VIDEO_BASE}/trackie-reaffirm.mp4`,
  sorting: `${VIDEO_BASE}/trackie-sorting.mp4`,
  notify: `${VIDEO_BASE}/trackie-notify.mp4`,
  bigWin: `${VIDEO_BASE}/trackie-big-win.mp4`,
};

/* The four feature clips are 1-3.4MB each and load mid-funnel; the
   preloader warms them once the user reaches the reassurance step. */
export const PRELOAD_VIDEOS = FEATURE_SLIDES.map((s) => s.video);

/* ---- Paywall (step 17) ------------------------------------------------ */

export const PREMIUM_FEATURES = [
  {
    title: 'Unlimited recipes saved & inventory tracked',
    description: 'Track every ingredient without limits.',
  },
  {
    title: 'Expiration Alerts',
    description: 'Never waste food with smart notifications.',
  },
  {
    title: 'AI Meal Ideas',
    description: 'Instant recipes based on your fridge.',
  },
  {
    title: 'Smart Lists',
    description: 'One-tap saving and auto-sorted lists.',
  },
];

/* ---- Storage keys ----------------------------------------------------- */

/*
 * These names are a contract with PaymentScreen: it writes the session /
 * payment / subscription keys before the account exists, and
 * completeOnboarding reads them back to link the Stripe subscription to
 * the new user. Do not rename without changing both sides.
 */
export const STORAGE_KEYS = {
  DATA: 'fridgy_onboarding_data',
  STEP: 'fridgy_onboarding_step',
  SESSION_ID: 'fridgy_onboarding_session_id',
  PAYMENT_COMPLETED: 'fridgy_payment_completed',
  SUBSCRIPTION_ID: 'fridgy_subscription_id',
  WANTS_TRIAL: 'fridgy_wants_trial',
  PUSH_OPTIN_PENDING: 'fridgy_push_optin_pending',
};
