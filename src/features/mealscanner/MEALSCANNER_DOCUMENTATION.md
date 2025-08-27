# 📸 Meal Scanner Feature Documentation

## Overview
The Meal Scanner feature allows users to photograph their meals, automatically detect ingredients using AI, and deduct those ingredients from their inventory. This creates a complete closed-loop inventory tracking system where groceries are added via "Scan Grocery" and consumed via "Scan Meal".

---

## 🏗️ Architecture

### User Flow
1. **Entry Point**: Tap plus (+) button on mobile nav → Select "Scan Meal"
2. **Camera Interface**: Take photo of meal
3. **AI Analysis**: Photo sent to backend for ingredient detection
4. **Ingredient Selection**: Review and select detected ingredients
5. **Meal Type Selection**: Choose meal type (breakfast, lunch, dinner, snack)
6. **Inventory Deduction**: Selected ingredients automatically deducted from inventory

### System Flow
```
Mobile Nav (+) → Modal → Scan Meal → Camera → AI Analysis → Ingredient Selection → Meal Type → Inventory Update
```

---

## 📁 File Structure

### Frontend Components

```
/Users/jessie/fridgy/Frontend/src/features/mealscanner/
├── components/
│   ├── MealCameraInterface.jsx      # Camera UI for capturing meal photos
│   ├── MealIngredientSelector.jsx   # Ingredient selection & confirmation UI
│   └── MealTypeSelector.jsx         # Bottom sheet modal for meal type selection
├── styles/
│   ├── MealScanner.css             # All styling for meal scanner components
│   └── MealTypeSelector.css        # Styling for meal type selector modal
└── index.js                         # Export barrel file
```

### Backend Services

```
/Users/jessie/fridgy/Backend/
├── controller/
│   └── mealController.js           # Request handlers for meal endpoints
├── services/
│   ├── mealAnalysisService.js      # AI meal image analysis
│   └── inventoryDeductionService.js # Smart inventory deduction logic
└── routes/
    └── meals.js                     # Express route definitions
```

---

## 🔄 API Endpoints

### `POST /api/meals/scan`
**Purpose**: Analyze a meal photo to detect ingredients  
**Input**: FormData with image file  
**Output**: Array of detected ingredients with quantities and image URL
```javascript
{
  success: true,
  ingredients: [
    {
      name: "chicken breast, grilled",
      quantity: 4,
      unit: "oz",
      category: "protein",
      calories: 180,
      confidence: 90
    }
  ],
  imageUrl: "https://storage.url/meal-photos/...", // Stored in Supabase Storage
  requestId: "abc123",
  timestamp: "2025-08-24T12:00:00.000Z"
}
```

### `POST /api/meals/log`
**Purpose**: Log meal and deduct ingredients from inventory  
**Input**: Selected ingredients array with meal type and image URL
```javascript
{
  ingredients: [...],
  imageUrl: "https://storage.url/meal-photos/...",
  mealType: "lunch" // breakfast, lunch, dinner, or snack
}
```
**Output**: Deduction results with success/error details
```javascript
{
  success: true,
  results: {
    deducted: [...],
    errors: [...],
    summary: {
      totalIngredients: 5,
      successfulDeductions: 4,
      failedDeductions: 1
    }
  }
}
```

### `GET /api/meals/history`
**Purpose**: Retrieve user's meal history  
**Output**: Array of logged meals with timestamps

---

## 🧠 AI Integration

### Model Configuration
- **Provider**: OpenRouter API
- **Model**: `google/gemini-2.0-flash-001`
- **Temperature**: 0.1 (for consistent results)
- **Max Tokens**: 1000

### Prompt Engineering
The AI is prompted to:
1. Identify all visible ingredients
2. Estimate quantities in standard units (cups, oz, pieces)
3. Categorize ingredients (protein, vegetable, grain, etc.)
4. Include preparation details (cooked, raw, grilled)
5. Provide confidence scores

### Response Format
```json
[
  {
    "name": "rice noodles, cooked",
    "quantity": 1,
    "unit": "cup",
    "category": "grain",
    "calories": 190,
    "confidence": 85
  }
]
```

---

## 🔧 Key Features

### Smart Inventory Matching
1. **Exact Match**: Direct name matching
2. **Partial Match**: Substring matching
3. **Category Match**: Match by food category
4. **Expiry Priority**: Use items expiring soon first

### Deduction Algorithm
```javascript
// Priority order for deduction:
1. Items expiring within 3 days
2. Items with exact name match
3. Items with partial name match
4. Items in same category
5. Proportional deduction if exact quantity unavailable
```

### Unit Conversion
Handles common conversions:
- cups ↔ oz (1 cup = 8 oz)
- tbsp ↔ tsp (1 tbsp = 3 tsp)
- lb ↔ oz (1 lb = 16 oz)
- kg ↔ g (1 kg = 1000 g)

---

## 🎨 UI Components

### MealCameraInterface
- **Purpose**: Camera interface for meal photo capture
- **Features**:
  - Environment camera preferred
  - Green guide corners for framing
  - Retake option
  - Loading state during analysis
  - Error handling with retry

### MealIngredientSelector
- **Purpose**: Review and select detected ingredients
- **Features**:
  - Toggle switches for each ingredient
  - Quantity and calorie display
  - "Select all" by default
  - Item counter
  - Meal image preview
  - Triggers meal type selector modal

### MealTypeSelector
- **Purpose**: Bottom sheet modal for meal type selection
- **Features**:
  - Four meal type options: Breakfast, Lunch, Dinner, Snack
  - Bottom sheet animation (slides up from bottom)
  - Visual icons for each meal type
  - Color-coded options for easy identification
  - Closes automatically after selection

---

## 🔐 Authentication
- Uses JWT tokens from localStorage (`fridgy_token`)
- Token required for all meal endpoints
- User ID extracted from token for inventory operations

---

## 📊 Database Schema

### meal_logs table
```sql
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  meal_photo_url TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', NULL)),
  ingredients_detected JSONB,
  ingredients_logged JSONB,
  logged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meal_logs_meal_type ON meal_logs(meal_type);
CREATE INDEX idx_meal_logs_user_meal_type ON meal_logs(user_id, meal_type);
```

### Supabase Storage Bucket
```sql
-- Create bucket for meal photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', true);

-- Add RLS policy for authenticated users
CREATE POLICY "Users can upload meal photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🐛 Error Handling

### Common Issues & Solutions

1. **"Failed to analyze meal"**
   - Check OpenRouter API key
   - Verify image size < 10MB
   - Check network connectivity

2. **"Unexpected token '<'"**
   - Backend route not found
   - Check server is running on port 5000

3. **"Authentication required"**
   - User not logged in
   - Token expired

4. **"No ingredients detected"**
   - Poor image quality
   - Non-food items in photo
   - AI confidence too low

5. **"413 Payload Too Large"**
   - Image size exceeds limit
   - Solution: Images now uploaded to Supabase Storage

6. **"Row-level security policy violation"**
   - Missing RLS policies in Supabase
   - Run SQL scripts in Database Schema section

---

## 🚀 Dependencies

### Frontend
- React Router (navigation)
- No additional packages needed

### Backend
- `node-fetch@2` - HTTP requests to AI API
- `multer` - Image upload handling
- `@supabase/supabase-js` - Database operations
- `jsonwebtoken` - Authentication

---

## ✅ Recent Updates (August 2025)

1. **Cloud Storage Integration**
   - Meal photos now stored in Supabase Storage
   - Reduced API payload from ~220KB to ~2KB
   - Photos available for future dashboard features

2. **Meal Type Categorization**
   - Added bottom sheet modal for meal type selection
   - Four categories: Breakfast, Lunch, Dinner, Snack
   - Data stored for future meal analytics

3. **Performance Optimizations**
   - Increased server body parser limit to 10MB
   - Implemented image URL passing instead of base64
   - Improved error handling and user feedback

## 📈 Future Enhancements

1. **Nutrition Tracking**
   - Calculate total calories consumed
   - Track macronutrients by meal type
   - Daily/weekly summaries per meal category

2. **Recipe Learning**
   - Save frequent meals as recipes
   - Quick-log saved meals
   - Share recipes with community

3. **Smart Suggestions**
   - Suggest portions based on history
   - Warn about allergens
   - Recommend healthier alternatives

4. **Analytics Dashboard**
   - Consumption patterns by meal type
   - Meal photo gallery view
   - Waste reduction metrics
   - Cost per meal tracking

---

## 🔗 Related Features

- **Scan Grocery**: Add items to inventory (opposite of meal scanning)
- **Inventory Page**: View current stock levels
- **Recipe Suggestions**: Get recipes based on available ingredients

---

## 📝 Testing Checklist

- [ ] Camera permissions granted
- [ ] Photo captures successfully
- [ ] AI detects ingredients accurately
- [ ] Ingredient toggles work
- [ ] Quantities display correctly
- [ ] Meal type selector appears
- [ ] All four meal types selectable
- [ ] Log meal button enabled/disabled appropriately
- [ ] Image uploads to Supabase Storage
- [ ] Meal type saves to database
- [ ] Inventory updates after logging
- [ ] Error messages display clearly
- [ ] Navigation flow works smoothly
- [ ] Works on different screen sizes

---

## 👥 Credits

**Created**: August 23, 2025  
**Last Updated**: August 24, 2025  
**Feature Type**: Full-stack with AI integration  
**Complexity**: High  
**Impact**: Completes inventory lifecycle tracking with meal categorization