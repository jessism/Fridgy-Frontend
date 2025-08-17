import React from 'react';
import { 
  // Basic icons that exist in Lucide
  Apple, Banana, Fish, Coffee, Utensils, Package, Snowflake, Box,
  Carrot, Beef, Milk, Egg, Circle, Leaf, Cherry
} from 'lucide-react';

// Modern SVG Icon Mapping for Inventory Items
export const CATEGORY_ICONS_SVG = {
  // Meat & Poultry
  'Meat': Beef,
  'Poultry': Utensils,
  'Chicken': Utensils,
  'Beef': Beef,
  'Pork': Beef,
  'Lamb': Beef,
  'Turkey': Utensils,
  
  // Seafood
  'Seafood': Fish,
  'Fish': Fish,
  'Salmon': Fish,
  'Tuna': Fish,
  'Shrimp': Fish,
  'Crab': Fish,
  'Lobster': Fish,
  
  // Vegetables
  'Vegetables': Carrot,
  'Vegetable': Carrot,
  'Carrots': Carrot,
  'Broccoli': Leaf,
  'Lettuce': Leaf,
  'Spinach': Leaf,
  'Tomatoes': Cherry,
  'Tomato': Cherry,
  'Peppers': Circle,
  'Onions': Circle,
  'Onion': Circle,
  'Garlic': Circle,
  'Potatoes': Circle,
  'Potato': Circle,
  'Corn': Circle,
  'Mushrooms': Leaf,
  'Mushroom': Leaf,
  'Cucumber': Carrot,
  'Eggplant': Cherry,
  'Avocado': Leaf,
  'Asparagus': Carrot,
  
  // Fruits
  'Fruits': Apple,
  'Fruit': Apple,
  'Apple': Apple,
  'Apples': Apple,
  'Banana': Banana,
  'Bananas': Banana,
  'Orange': Circle,
  'Oranges': Circle,
  'Lemon': Circle,
  'Lemons': Circle,
  'Lime': Circle,
  'Limes': Circle,
  'Grapes': Cherry,
  'Strawberry': Cherry,
  'Strawberries': Cherry,
  'Blueberry': Cherry,
  'Blueberries': Cherry,
  'Peach': Cherry,
  'Peaches': Cherry,
  'Pineapple': Cherry,
  'Watermelon': Cherry,
  'Mango': Cherry,
  'Kiwi': Cherry,
  'Cherries': Cherry,
  'Cherry': Cherry,
  
  // Dairy
  'Dairy': Milk,
  'Milk': Milk,
  'Cheese': Circle,
  'Butter': Circle,
  'Yogurt': Milk,
  'Eggs': Egg,
  'Egg': Egg,
  'Cream': Milk,
  
  // Grains & Bread
  'Grains': Package,
  'Grain': Package,
  'Bread': Package,
  'Rice': Package,
  'Pasta': Package,
  'Cereal': Package,
  'Oats': Package,
  'Quinoa': Package,
  'Flour': Package,
  
  // Beverages
  'Beverages': Coffee,
  'Beverage': Coffee,
  'Water': Circle,
  'Juice': Coffee,
  'Soda': Coffee,
  'Coffee': Coffee,
  'Tea': Coffee,
  'Beer': Coffee,
  'Wine': Coffee,
  
  // Snacks & Sweets
  'Snacks': Package,
  'Snack': Package,
  'Chips': Package,
  'Cookies': Package,
  'Cookie': Package,
  'Chocolate': Package,
  'Candy': Package,
  'Ice Cream': Snowflake,
  'Nuts': Package,
  'Crackers': Package,
  
  // Condiments & Spices
  'Condiments': Package,
  'Condiment': Package,
  'Salt': Package,
  'Pepper': Package,
  'Spices': Package,
  'Spice': Package,
  'Sauce': Package,
  'Ketchup': Package,
  'Mustard': Package,
  'Mayo': Package,
  'Oil': Package,
  'Vinegar': Package,
  'Honey': Package,
  'Sugar': Package,
  
  // Canned & Packaged
  'Canned': Package,
  'Frozen': Snowflake,
  'Packaged': Box,
  
  // Default fallback
  'Default': Utensils,
  'Protein': Beef // For the "Protein" category we see in the screenshot
};

// Alternative names or common misspellings
export const CATEGORY_ALIASES_SVG = {
  'Veggies': 'Vegetables',
  'Veggie': 'Vegetables',
  'Meats': 'Meat',
  'Fruits & Vegetables': 'Fruits',
  'Protein': 'Protein',
  'Produce': 'Vegetables',
  'Fresh': 'Vegetables',
  'Leftovers': 'Default'
};

// Color mapping for different food categories
const getIconColor = (IconComponent) => {
  // Fruits - Red/Orange colors
  if (IconComponent === Apple) return '#e53e3e'; // Red apple
  if (IconComponent === Cherry) return '#d53f8c'; // Cherry red
  if (IconComponent === Banana) return '#f6e05e'; // Yellow banana
  
  // Vegetables - Green/Orange colors
  if (IconComponent === Carrot) return '#ed8936'; // Orange carrot
  if (IconComponent === Leaf) return '#38a169'; // Green leaf
  
  // Meat & Protein - Red/Brown colors
  if (IconComponent === Beef) return '#c53030'; // Dark red beef
  
  // Seafood - Blue colors
  if (IconComponent === Fish) return '#3182ce'; // Ocean blue
  
  // Dairy - White/Yellow colors
  if (IconComponent === Milk) return '#f7fafc'; // White milk (with border)
  if (IconComponent === Egg) return '#faf089'; // Light yellow egg
  
  // Beverages - Various colors
  if (IconComponent === Coffee) return '#8b4513'; // Coffee brown
  
  // Generic circle - context-based colors
  if (IconComponent === Circle) {
    return '#ff7f50'; // Coral orange for various fruits/vegetables
  }
  
  // Packaged items - neutral colors
  if (IconComponent === Package) return '#8b7355'; // Brown package
  if (IconComponent === Box) return '#708090'; // Gray box
  if (IconComponent === Snowflake) return '#63b3ed'; // Light blue frozen
  
  // Default utensils
  if (IconComponent === Utensils) return '#4a5568'; // Gray utensils
  
  // Default gray
  return '#64748b';
};

// Helper function to render SVG icon with vibrant colors
export const renderSVGIcon = (IconComponent, props = {}) => {
  if (!IconComponent) {
    return <Utensils size={24} strokeWidth={0} fill="#64748b" style={{ color: '#64748b' }} {...props} />;
  }
  
  const iconColor = getIconColor(IconComponent);
  const iconStyle = {
    color: iconColor,
    fill: iconColor, // Fill the icon with the color
    stroke: iconColor, // Also stroke with the same color
    strokeWidth: 0, // Remove outline for filled look
    // Add subtle shadow for depth
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
    ...props.style
  };
  
  return <IconComponent size={24} strokeWidth={0} fill={iconColor} style={iconStyle} {...props} />;
};