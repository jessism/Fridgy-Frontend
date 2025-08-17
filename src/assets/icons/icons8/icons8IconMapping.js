import React from 'react';

// Import colorful Icons8 SVG files as React components
import { ReactComponent as AppleIcon } from './Apple.svg';
import { ReactComponent as BananaIcon } from './Banana.svg';
import { ReactComponent as CarrotIcon } from './Carrot.svg';
import { ReactComponent as TomatoIcon } from './Tomato.svg';
import { ReactComponent as LettuceIcon } from './Lettuce.svg';
import { ReactComponent as CornIcon } from './Corn.svg';
import { ReactComponent as OnionIcon } from './Onion.svg';
import { ReactComponent as GarlicIcon } from './Garlic.svg';
import { ReactComponent as PotatoIcon } from './Potato.svg';
import { ReactComponent as BroccoliIcon } from './Broccoli.svg';
import { ReactComponent as AsparagusIcon } from './Asparagus.svg';
import { ReactComponent as CucumberIcon } from './Cucumber.svg';
import { ReactComponent as EggplantIcon } from './Eggplant.svg';
import { ReactComponent as AvocadoIcon } from './Avocado.svg';
import { ReactComponent as CherryIcon } from './Cherry.svg';
import { ReactComponent as StrawberryIcon } from './Strawberry.svg';
import { ReactComponent as GrapesIcon } from './Grapes.svg';
import { ReactComponent as PeachIcon } from './Peach.svg';
import { ReactComponent as PearIcon } from './Pear.svg';
import { ReactComponent as PineappleIcon } from './Pineapple.svg';
import { ReactComponent as WatermelonIcon } from './Watermelon.svg';
import { ReactComponent as KiwiIcon } from './Kiwi.svg';
import { ReactComponent as CitrusIcon } from './Citrus.svg';
import { ReactComponent as MilkIcon } from './Milk.svg';
import { ReactComponent as CheeseIcon } from './Cheese.svg';
import { ReactComponent as EggsIcon } from './Eggs.svg';
import { ReactComponent as BreadIcon } from './Bread.svg';
import { ReactComponent as SteakIcon } from './Steak.svg';
import { ReactComponent as BaconIcon } from './Bacon.svg';
import { ReactComponent as SushiIcon } from './Sushi.svg';
import { ReactComponent as CrabIcon } from './Crab.svg';
import { ReactComponent as PrawnIcon } from './Prawn.svg';
import { ReactComponent as CoffeeToGoIcon } from './Coffee to Go.svg';
import { ReactComponent as TeaIcon } from './Tea.svg';
import { ReactComponent as CupIcon } from './Cup.svg';
import { ReactComponent as BeerIcon } from './Beer.svg';
import { ReactComponent as WineBottleIcon } from './Wine Bottle.svg';
import { ReactComponent as BottleOfWaterIcon } from './Bottle of Water.svg';
import { ReactComponent as CookiesIcon } from './Cookies.svg';
import { ReactComponent as CupcakeIcon } from './Cupcake.svg';
import { ReactComponent as IceCreamConeIcon } from './Ice Cream Cone.svg';
import { ReactComponent as NutIcon } from './Nut.svg';
import { ReactComponent as HoneyIcon } from './Honey.svg';
import { ReactComponent as SaltShakerIcon } from './Salt Shaker.svg';
import { ReactComponent as PepperShakerIcon } from './Pepper Shaker.svg';
import { ReactComponent as OliveOilIcon } from './Olive Oil.svg';
import { ReactComponent as SauceIcon } from './Sauce.svg';
import { ReactComponent as TinCanIcon } from './Tin Can.svg';
import { ReactComponent as SackOfFlourIcon } from './Sack of Flour.svg';
import { ReactComponent as RiceBowlIcon } from './Rice Bowl.svg';
import { ReactComponent as NoodlesIcon } from './Noodles.svg';
import { ReactComponent as SpaghettiIcon } from './Spaghetti.svg';

// Icon mapping for food categories using colorful Icons8 SVGs
export const ICONS8_CATEGORY_MAPPING = {
  // Meat & Poultry
  'Meat': SteakIcon,
  'Poultry': SteakIcon,
  'Chicken': SteakIcon,
  'Beef': SteakIcon,
  'Pork': BaconIcon,
  'Lamb': SteakIcon,
  'Turkey': SteakIcon,
  'Protein': SteakIcon,
  
  // Seafood
  'Seafood': SushiIcon,
  'Fish': SushiIcon,
  'Salmon': SushiIcon,
  'Tuna': SushiIcon,
  'Shrimp': PrawnIcon,
  'Crab': CrabIcon,
  'Lobster': CrabIcon,
  
  // Vegetables
  'Vegetables': CarrotIcon,
  'Vegetable': CarrotIcon,
  'Carrots': CarrotIcon,
  'Broccoli': BroccoliIcon,
  'Lettuce': LettuceIcon,
  'Spinach': LettuceIcon,
  'Tomatoes': TomatoIcon,
  'Tomato': TomatoIcon,
  'Peppers': TomatoIcon,
  'Onions': OnionIcon,
  'Onion': OnionIcon,
  'Garlic': GarlicIcon,
  'Potatoes': PotatoIcon,
  'Potato': PotatoIcon,
  'Corn': CornIcon,
  'Mushrooms': LettuceIcon,
  'Mushroom': LettuceIcon,
  'Cucumber': CucumberIcon,
  'Eggplant': EggplantIcon,
  'Avocado': AvocadoIcon,
  'Asparagus': AsparagusIcon,
  
  // Fruits
  'Fruits': AppleIcon,
  'Fruit': AppleIcon,
  'Apple': AppleIcon,
  'Apples': AppleIcon,
  'Banana': BananaIcon,
  'Bananas': BananaIcon,
  'Orange': CitrusIcon,
  'Oranges': CitrusIcon,
  'Lemon': CitrusIcon,
  'Lemons': CitrusIcon,
  'Lime': CitrusIcon,
  'Limes': CitrusIcon,
  'Grapes': GrapesIcon,
  'Strawberry': StrawberryIcon,
  'Strawberries': StrawberryIcon,
  'Blueberry': CherryIcon,
  'Blueberries': CherryIcon,
  'Peach': PeachIcon,
  'Peaches': PeachIcon,
  'Pineapple': PineappleIcon,
  'Watermelon': WatermelonIcon,
  'Mango': PeachIcon,
  'Kiwi': KiwiIcon,
  'Cherries': CherryIcon,
  'Cherry': CherryIcon,
  'Pear': PearIcon,
  
  // Dairy
  'Dairy': MilkIcon,
  'Milk': MilkIcon,
  'Cheese': CheeseIcon,
  'Butter': CheeseIcon,
  'Yogurt': MilkIcon,
  'Eggs': EggsIcon,
  'Egg': EggsIcon,
  'Cream': MilkIcon,
  
  // Grains & Bread
  'Grains': SackOfFlourIcon,
  'Grain': SackOfFlourIcon,
  'Bread': BreadIcon,
  'Rice': RiceBowlIcon,
  'Pasta': SpaghettiIcon,
  'Cereal': RiceBowlIcon,
  'Oats': SackOfFlourIcon,
  'Quinoa': RiceBowlIcon,
  'Flour': SackOfFlourIcon,
  'Noodles': NoodlesIcon,
  'Spaghetti': SpaghettiIcon,
  
  // Beverages
  'Beverages': CoffeeToGoIcon,
  'Beverage': CoffeeToGoIcon,
  'Water': BottleOfWaterIcon,
  'Juice': CupIcon,
  'Soda': CupIcon,
  'Coffee': CoffeeToGoIcon,
  'Tea': TeaIcon,
  'Beer': BeerIcon,
  'Wine': WineBottleIcon,
  
  // Snacks & Sweets
  'Snacks': CookiesIcon,
  'Snack': CookiesIcon,
  'Chips': CookiesIcon,
  'Cookies': CookiesIcon,
  'Cookie': CookiesIcon,
  'Chocolate': CupcakeIcon,
  'Candy': CupcakeIcon,
  'Ice Cream': IceCreamConeIcon,
  'Nuts': NutIcon,
  'Crackers': CookiesIcon,
  
  // Condiments & Spices
  'Condiments': SauceIcon,
  'Condiment': SauceIcon,
  'Salt': SaltShakerIcon,
  'Pepper': PepperShakerIcon,
  'Spices': PepperShakerIcon,
  'Spice': PepperShakerIcon,
  'Sauce': SauceIcon,
  'Ketchup': SauceIcon,
  'Mustard': SauceIcon,
  'Mayo': SauceIcon,
  'Oil': OliveOilIcon,
  'Vinegar': SauceIcon,
  'Honey': HoneyIcon,
  'Sugar': SackOfFlourIcon,
  
  // Canned & Packaged
  'Canned': TinCanIcon,
  'Frozen': IceCreamConeIcon,
  'Packaged': TinCanIcon,
  
  // Default fallback
  'Default': AppleIcon
};

// Alternative names or common misspellings
export const ICONS8_CATEGORY_ALIASES = {
  'Veggies': 'Vegetables',
  'Veggie': 'Vegetables',
  'Meats': 'Meat',
  'Fruits & Vegetables': 'Fruits',
  'Protein': 'Protein',
  'Produce': 'Vegetables',
  'Fresh': 'Vegetables',
  'Leftovers': 'Default'
};

// Helper function to render Icons8 colorful SVG
export const renderIcons8Icon = (IconComponent, props = {}) => {
  if (!IconComponent) {
    return <AppleIcon width={24} height={24} {...props} />;
  }
  
  const iconStyle = {
    width: props.size || 24,
    height: props.size || 24,
    ...props.style
  };
  
  return <IconComponent width={iconStyle.width} height={iconStyle.height} style={iconStyle} {...props} />;
};