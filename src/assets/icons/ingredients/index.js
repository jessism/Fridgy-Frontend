// Ingredient icon imports and mapping
// These PNG icons are bundled at build time for instant loading

// Import all ingredient icons
import apple from './apple.png';
import Asparagus from './Asparagus.png';
import avocado from './avocado.png';
import Avocado_Oil from './Avocado oil.png';
import Bacon from './Bacon.png';
import Banana from './Banana.png';
import Basil from './Basil.png';
import Beef from './Beef.png';
import Bell_Pepper from './Bell_Pepper.png';
import Black_Beans from './Black_Beans.png';
import Blueberry from './Blueberry.png';
import Bread from './Bread.png';
import Brocolli from './Brocolli.png';
import Butter from './Butter.png';
import Carrot from './Carrot.png';
import Cauliflower from './Cauliflower.png';
import Celery from './Celery.png';
import Cheese from './Cheese.png';
import Cheese_Cheddar from './Cheese_Cheddar.png';
import Cheese_Mozzarella from './Cheese_Mozzarella.png';
import Cheese_Parmesan from './Cheese_Parmesan.png';
import chicken from './chicken.png';
import chicken_breast from './chicken_breast.png';
import Chicken_Broth from './Chicken_Broth.png';
import Chicken_thigh from './Chicken_thigh.png';
import Chili_Oil from './Chili oil.png';
import Cilantro from './Cilantro.png';
import Corn from './Corn.png';
import Crab from './Crab.png';
import Cream from './Cream.png';
import Cucumber from './Cucumber.png';
import Curry_Powder from './Curry powder.png';
import Dill from './Dill.png';
import Dry_Seaweed from './Dry Seaweed.png';
import Eggplant from './Eggplant.png';
import Eggs from './Eggs.png';
import Flour from './Flour.png';
import Garlic from './Garlic.png';
import Ginger from './Ginger.png';
import grapes from './grapes.png';
import Ground_Beef from './Ground_Beef.png';
import Ground_Pepper from './Ground_Pepper.png';
import Honey from './Honey.png';
import Icecream from './Icecream.png';
import Imitation_Crab from './Imitation Crab.png';
import Italian_Seasoning from './Italian Seasoning.png';
import Juice_orange from './Juice_orange.png';
import Ketchup from './Ketchup.png';
import Lemon from './Lemon.png';
import Lentils from './Lentils.png';
import Lettuce from './Lettuce.png';
import Lime from './Lime.png';
import matcha_latte from './matcha_latte.png';
import Mayo from './Mayo.png';
import milk from './milk.png';
import mushroom_enoki from './mushroom_enoki.png';
import mushroom_king_oyster from './mushroom_king_oyster.png';
import Mustard from './Mustard.png';
import Oats from './Oats.png';
import Oil from './Oil.png';
import Olive_Oil from './Olive Oil.png';
import onion_green from './onion_green.png';
import onion_red from './onion_red.png';
import onion_yellow from './onion_yellow.png';
import Orange from './Orange.png';
import Oregano from './Oregano.png';
import Orzo from './Orzo.png';
import Paprika from './Paprika.png';
import Parsley from './Parsley.png';
import Peach from './Peach.png';
import Pinapple from './Pinapple.png';
import Pork from './Pork.png';
import Pork_Chops from './Pork_Chops.png';
import potatoes from './potatoes.png';
import Quinoa from './Quinoa.png';
import Rice from './Rice.png';
import salmon from './salmon.png';
import Salt from './Salt.png';
import Shallots from './Shallots.png';
import Shrimp from './Shrimp.png';
import Sriracha from './Siracha.png';
import Soy_Sauce from './Soy_Sauce.png';
import Spaghetti from './Spaghetti.png';
import Spinach from './Spinach.png';
import Strawberry from './Strawberry.png';
import Sugar from './Sugar.png';
import Thyme from './Thyme.png';
import Tofu from './Tofu.png';
import tomato from './tomato.png';
import Tomato_Paste from './Tomato Paste.png';
import Tuna from './Tuna.png';
import Watermelon from './Watermelon.png';
import Yogurt from './Yogurt.png';
import zuchini from './zuchini.png';

// Mapping object: lowercase ingredient name -> icon URL
const INGREDIENT_ICONS = {
  // Fruits
  'apple': apple,
  'avocado': avocado,
  'banana': Banana,
  'blueberry': Blueberry,
  'blueberries': Blueberry,
  'grapes': grapes,
  'grape': grapes,
  'lemon': Lemon,
  'lime': Lime,
  'orange': Orange,
  'peach': Peach,
  'pineapple': Pinapple,
  'strawberry': Strawberry,
  'strawberries': Strawberry,
  'watermelon': Watermelon,

  // Vegetables
  'asparagus': Asparagus,
  'bell pepper': Bell_Pepper,
  'bell_pepper': Bell_Pepper,
  'red pepper': Bell_Pepper,
  'green pepper': Bell_Pepper,
  'broccoli': Brocolli,
  'carrot': Carrot,
  'carrots': Carrot,
  'cauliflower': Cauliflower,
  'celery': Celery,
  'corn': Corn,
  'cucumber': Cucumber,
  'eggplant': Eggplant,
  'garlic': Garlic,
  'ginger': Ginger,
  'lettuce': Lettuce,
  'mushroom': mushroom_enoki,
  'mushrooms': mushroom_enoki,
  'enoki mushroom': mushroom_enoki,
  'king oyster mushroom': mushroom_king_oyster,
  'onion': onion_yellow,
  'yellow onion': onion_yellow,
  'red onion': onion_red,
  'green onion': onion_green,
  'scallion': onion_green,
  'scallions': onion_green,
  'potato': potatoes,
  'potatoes': potatoes,
  'shallot': Shallots,
  'shallots': Shallots,
  'spinach': Spinach,
  'tomato': tomato,
  'tomatoes': tomato,
  'tomato paste': Tomato_Paste,
  'zucchini': zuchini,
  'zuchini': zuchini,

  // Proteins
  'bacon': Bacon,
  'beef': Beef,
  'ground beef': Ground_Beef,
  'chicken': chicken,
  'chicken breast': chicken_breast,
  'chicken thigh': Chicken_thigh,
  'chicken thighs': Chicken_thigh,
  'crab': Crab,
  'crab meat': Crab,
  'imitation crab': Imitation_Crab,
  'crab sticks': Imitation_Crab,
  'pork': Pork,
  'pork chop': Pork_Chops,
  'pork chops': Pork_Chops,
  'salmon': salmon,
  'shrimp': Shrimp,
  'tofu': Tofu,
  'tuna': Tuna,
  'eggs': Eggs,
  'egg': Eggs,

  // Dairy
  'butter': Butter,
  'cheese': Cheese,
  'cheddar': Cheese_Cheddar,
  'cheddar cheese': Cheese_Cheddar,
  'mozzarella': Cheese_Mozzarella,
  'mozzarella cheese': Cheese_Mozzarella,
  'parmesan': Cheese_Parmesan,
  'parmesan cheese': Cheese_Parmesan,
  'cream': Cream,
  'heavy cream': Cream,
  'milk': milk,
  'yogurt': Yogurt,

  // Grains & Legumes
  'bread': Bread,
  'flour': Flour,
  'lentils': Lentils,
  'lentil': Lentils,
  'oats': Oats,
  'oatmeal': Oats,
  'orzo': Orzo,
  'quinoa': Quinoa,
  'rice': Rice,
  'spaghetti': Spaghetti,
  'pasta': Spaghetti,
  'black beans': Black_Beans,
  'beans': Black_Beans,
  'seaweed': Dry_Seaweed,
  'nori': Dry_Seaweed,
  'dry seaweed': Dry_Seaweed,

  // Condiments & Seasonings
  'basil': Basil,
  'cilantro': Cilantro,
  'coriander': Cilantro,
  'curry powder': Curry_Powder,
  'curry': Curry_Powder,
  'dill': Dill,
  'honey': Honey,
  'italian seasoning': Italian_Seasoning,
  'ketchup': Ketchup,
  'mayo': Mayo,
  'mayonnaise': Mayo,
  'kewpie mayo': Mayo,
  'mustard': Mustard,
  'oregano': Oregano,
  'paprika': Paprika,
  'parsley': Parsley,
  'pepper': Ground_Pepper,
  'black pepper': Ground_Pepper,
  'ground pepper': Ground_Pepper,
  'salt': Salt,
  'soy sauce': Soy_Sauce,
  'sriracha': Sriracha,
  'sugar': Sugar,
  'thyme': Thyme,

  // Oils & Fats
  'oil': Oil,
  'cooking oil': Oil,
  'vegetable oil': Oil,
  'canola oil': Oil,
  'olive oil': Olive_Oil,
  'extra virgin olive oil': Olive_Oil,
  'avocado oil': Avocado_Oil,
  'sesame oil': Oil,
  'chili oil': Chili_Oil,

  // Broths & Liquids
  'chicken broth': Chicken_Broth,
  'broth': Chicken_Broth,
  'stock': Chicken_Broth,
  'orange juice': Juice_orange,
  'matcha': matcha_latte,
  'matcha latte': matcha_latte,

  // Desserts
  'ice cream': Icecream,
  'icecream': Icecream,
};

// Cache for fuzzy match results
const matchCache = new Map();

/**
 * Get the icon URL for an ingredient name
 * Uses exact match first, then fuzzy matching
 * @param {string} ingredientName - The ingredient name to find an icon for
 * @returns {string|null} - The icon URL or null if not found
 */
export const getIngredientIconUrl = (ingredientName) => {
  if (!ingredientName) return null;

  const normalized = ingredientName.toLowerCase().trim();

  // Check cache first
  if (matchCache.has(normalized)) {
    return matchCache.get(normalized);
  }

  // Direct exact match
  if (INGREDIENT_ICONS[normalized]) {
    matchCache.set(normalized, INGREDIENT_ICONS[normalized]);
    return INGREDIENT_ICONS[normalized];
  }

  // Try partial matching - find all keys contained in the ingredient name
  // Sort by key length (longest first) to prefer specific matches over generic ones
  // e.g., "green onion" should match before "onion" for "Sliced Green Onions"
  const matches = Object.entries(INGREDIENT_ICONS)
    .filter(([key]) => key.length >= 4 && normalized.includes(key))
    .sort((a, b) => b[0].length - a[0].length);

  if (matches.length > 0) {
    const bestMatch = matches[0][1];
    matchCache.set(normalized, bestMatch);
    return bestMatch;
  }

  // Try matching if ingredient name is contained in any key
  // Also sort by key length for consistency
  const reverseMatches = Object.entries(INGREDIENT_ICONS)
    .filter(([key]) => key.includes(normalized) && normalized.length >= 3)
    .sort((a, b) => b[0].length - a[0].length);

  if (reverseMatches.length > 0) {
    const bestMatch = reverseMatches[0][1];
    matchCache.set(normalized, bestMatch);
    return bestMatch;
  }

  // No match found
  matchCache.set(normalized, null);
  return null;
};

// Export the mapping for direct access if needed
export { INGREDIENT_ICONS };
