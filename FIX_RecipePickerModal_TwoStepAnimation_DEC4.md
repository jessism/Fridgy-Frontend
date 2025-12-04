# FIX: RecipePickerModal Two-Step Animation on Mobile

**Date:** December 4, 2025
**File:** `/Frontend/src/components/modals/RecipePickerModal.css`

## Problem

When clicking "Add" on the MealPlanPage, the RecipePickerModal appeared to slide up in two steps:
1. First slide up (partial)
2. Pause
3. Second slide up to final position

## Root Cause

**This was NOT an animation bug - it was a LAYOUT SHIFT.**

The animation used `translateY(100%)` which means "100% of the element's OWN height".

### What was happening:

1. Modal renders with `loading: true` → shows "Loading recipes..." → **small height (~200px)**
2. Animation starts: `translateY(100%)` = 200px down from final position
3. Animation runs, modal slides up over 0.3s
4. API fetch completes, `loading` → `false`, content becomes recipe grid
5. Modal height **increases** to ~500px+ (full content)
6. `align-items: flex-end` anchors modal to bottom of screen
7. When height increases, the modal **"grows upward"** → this LOOKS like a second slide!

The perceived "two-step" was actually:
- **Step 1:** Real CSS animation sliding up
- **Step 2:** Layout reflow when content height changed (modal growing upward from bottom anchor)

## Solution

### 1. Fixed modal height on mobile

```css
/* Before */
.recipe-picker-modal {
  max-height: 95vh;
}

/* After */
.recipe-picker-modal {
  height: 85vh;  /* Fixed height prevents layout shift */
}
```

### 2. Changed animation to use viewport units

```css
/* Before */
@keyframes slideUp {
  from {
    transform: translateY(100%);  /* Depends on element's own height */
  }
}

/* After */
@keyframes slideUp {
  from {
    transform: translateY(100vh);  /* Fixed viewport distance */
  }
}
```

### 3. Desktop override for flexible height

```css
@media (min-width: 768px) {
  .recipe-picker-modal {
    height: auto;      /* Allow flexible height on desktop */
    max-height: 85vh;
  }
}
```

## Why This Works

- Modal has **consistent height** from the moment it renders
- Loading state and loaded state occupy the **same space**
- No layout shift = no perceived "second step"
- `translateY(100vh)` ensures **consistent animation** regardless of content

## Key Learning

When debugging animation issues, consider whether the problem is actually a **layout shift** caused by content changes, not the animation itself. Elements anchored to edges (via flexbox `align-items: flex-end`) will visually "move" when their dimensions change.
