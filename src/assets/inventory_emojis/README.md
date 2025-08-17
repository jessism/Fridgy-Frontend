# Inventory Emojis

This folder contains the emoji icon system for the Fridgy inventory management app.

## Files

- **`categoryIcons.js`** - Main emoji mappings for food categories and items
- **`iconHelpers.js`** - Helper functions for getting icons and formatting
- **`README.md`** - This documentation file

## Usage

```javascript
import { getItemIcon, getExpiryStatus, formatQuantity } from '../assets/inventory_emojis/iconHelpers.js';

// Get an icon for a food item
const icon = getItemIcon('Fruits', 'Apple'); // Returns 🍎

// Get expiry status with urgency level
const { status, urgency } = getExpiryStatus(2); // Returns { status: 'Expiring Soon', urgency: 'expiring' }

// Format quantity for display
const qty = formatQuantity('250g'); // Returns '250g'
```

## Adding New Icons

To add new food categories or items:

1. Open `categoryIcons.js`
2. Add the new category/item to the `CATEGORY_ICONS` object
3. If it's an alternative name, add it to `CATEGORY_ALIASES`

Example:
```javascript
export const CATEGORY_ICONS = {
  // ... existing icons
  'Herbs': '🌿',
  'Basil': '🌿',
  'Parsley': '🌿'
};
```

## Icon Categories

- **Meat & Poultry**: 🥩 🍗 🥓 🦃
- **Seafood**: 🐟 🦐 🦀 🦞  
- **Vegetables**: 🥕 🥦 🥬 🍅 🌶️ 🧅 🧄 🥔 🌽 🍄
- **Fruits**: 🍎 🍌 🍊 🍋 🍇 🍓 🫐 🍑 🍍 🍉 🥭
- **Dairy**: 🥛 🧀 🧈 🥚
- **Grains**: 🌾 🍞 🍚 🍝 🥣
- **Beverages**: 🥤 💧 🧃 ☕ 🍵 🍺 🍷
- **Snacks**: 🍿 🍟 🍪 🍫 🍬 🍦 🥜
- **Condiments**: 🧂 🥫 🍯 🫒
- **Default**: 🍽️

## Matching Logic

The `getItemIcon()` function tries to match icons in this order:

1. Exact category name match
2. Category alias match  
3. Exact item name match
4. Partial item name match
5. Partial category match
6. Default fallback (🍽️)

This ensures that even if categories aren't perfectly standardized, users will still get relevant icons for their food items.