# Recipe Organization Restructuring Plan

## Overview
Create a clear separation between **Imported Recipes** (Instagram, web) and **Uploaded Recipes** (manual, scanned) with dedicated pages for each type.

## Architecture Changes

### 1. SavedRecipesPage → "All Imported Recipes"
**Current**: Shows all recipes mixed together
**New Purpose**: Show ONLY imported recipes (Instagram, web sources)

#### Changes Needed:
- Update title from dynamic to fixed: "All imported recipes"
- Filter to show only imported recipes:
  ```javascript
  recipes.filter(r =>
    r.source_type !== 'manual' &&
    r.import_method !== 'manual' &&
    r.source_author !== 'Me'
  )
  ```
- Update navigation links that point here
- Keep the "Setup Shortcut" button (for Instagram imports)

### 2. Create New Page: "All Uploaded Recipes"
**Purpose**: Show ONLY uploaded/manual recipes

#### New File: `AllUploadedRecipesPage.js`
- Copy structure from SavedRecipesPage
- Title: "All uploaded recipes"
- Filter to show only uploaded recipes:
  ```javascript
  recipes.filter(r =>
    r.source_type === 'manual' ||
    r.import_method === 'manual' ||
    r.source_author === 'Me'
  )
  ```
- Change "Import Recipe" button to "Create Recipe" button
- Remove "Setup Shortcut" button

#### Routing:
- Add route: `/all-uploaded-recipes`
- Update navigation in MealPlansPage

### 3. Update MealPlansPage Sections

#### "Imported recipes" Section:
- Keep limit: 2 (but fetch more initially)
- Filter for imported only
- "View all" arrow → navigate to `/saved-recipes`
- Show most recent 2 imported recipes

#### "Uploaded recipes" Section:
- Keep limit: 2 (but fetch more initially)
- Filter for uploaded only
- "View all" arrow → navigate to `/all-uploaded-recipes`
- Show most recent 2 uploaded recipes

### 4. Fix Fetching Logic in MealPlansPage

```javascript
// Fetch enough recipes to ensure we get both types
const params = new URLSearchParams({
  limit: 50  // Fetch all recent recipes
});

// Then filter and limit display
const importedRecipes = data.recipes
  .filter(r => /* imported filter */)
  .slice(0, 2);  // Show only 2

const uploadedRecipes = data.recipes
  .filter(r => /* uploaded filter */)
  .slice(0, 2);  // Show only 2
```

## File Changes Summary

### Modified Files:
1. **SavedRecipesPage.js**
   - Fixed title: "All imported recipes"
   - Add filtering for imported only
   - Update empty state messaging

2. **MealPlansPage.js**
   - Fix fetchSavedRecipes to fetch 50, display 2
   - Fix fetchUserUploadedRecipes to fetch 50, display 2
   - Update navigation arrows
   - Fix "View all" navigation links

3. **App.js**
   - Add route for `/all-uploaded-recipes`

### New Files:
1. **AllUploadedRecipesPage.js**
   - New page for uploaded recipes
   - Based on SavedRecipesPage structure
   - Different filtering and UI elements

2. **AllUploadedRecipesPage.css**
   - Styling for the new page
   - Can reuse most of SavedRecipesPage styles

## User Flow

### From MealPlansPage (`/meal-plans/recipes`):
- **Imported recipes section**:
  - Shows 2 most recent imported
  - (+) button → `/import`
  - Arrow → `/saved-recipes` (all imported)

- **Uploaded recipes section**:
  - Shows 2 most recent uploaded
  - (+) button → Create recipe modal
  - Arrow → `/all-uploaded-recipes` (all uploaded)

### Navigation Structure:
```
/meal-plans/recipes
  ├── Imported recipes (2 items)
  │   └── View all → /saved-recipes
  └── Uploaded recipes (2 items)
      └── View all → /all-uploaded-recipes
```

## Benefits
1. **Clear separation** between content types
2. **Consistent navigation** - users know where to find their recipes
3. **Scalable** - each page handles one type well
4. **Better UX** - no confusion about where recipes are stored
5. **Maintains existing flows** - Instagram imports still work the same

## Implementation Order
1. Create AllUploadedRecipesPage (new file)
2. Update SavedRecipesPage (filter for imported only)
3. Fix MealPlansPage fetching logic
4. Add routing for new page
5. Test both flows thoroughly

## Success Criteria
- ✅ Instagram recipes appear in "Imported recipes" section and page
- ✅ Manual recipes appear in "Uploaded recipes" section and page
- ✅ Both sections show 2 most recent on MealPlansPage
- ✅ "View all" navigates to correct full page
- ✅ No recipes appear in wrong category

## Technical Implementation Details

### Recipe Detection Logic

#### Imported Recipe Detection:
```javascript
const isImportedRecipe = (recipe) => {
  return recipe.source_type === 'instagram' ||
         recipe.source_type === 'web' ||
         recipe.source_type === 'blog' ||
         (recipe.source_type !== 'manual' &&
          recipe.import_method !== 'manual' &&
          recipe.source_author !== 'Me');
};
```

#### Uploaded Recipe Detection:
```javascript
const isUploadedRecipe = (recipe) => {
  return recipe.source_type === 'manual' ||
         recipe.import_method === 'manual' ||
         recipe.source_author === 'Me' ||
         recipe.source_type === 'scanned' ||
         recipe.source_type === 'voice';
};
```

### API Considerations
- Both pages will use the same `/saved-recipes` endpoint
- Filtering happens on frontend to avoid backend changes
- Consider adding query parameters in future for server-side filtering

### State Management
- Each page manages its own recipe list
- MealPlansPage fetches once and filters twice
- Consider using React Context or Redux if state sharing becomes complex

## Future Enhancements
1. Add search/filter within each page
2. Add sorting options (newest, alphabetical, most used)
3. Backend API endpoints for filtered fetching
4. Batch operations (delete multiple, export, etc.)
5. Recipe collections/folders within each type