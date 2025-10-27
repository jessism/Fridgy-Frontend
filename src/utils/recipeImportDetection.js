/**
 * Recipe Import Detection Utility
 * Polls backend to detect when a new recipe has been imported
 */

/**
 * Check if a new recipe has been imported since startTime
 * @param {number} startTime - Timestamp when import flow started
 * @returns {Promise<Object|null>} - Returns recipe object if found, null otherwise
 */
export const checkForNewRecipe = async (startTime) => {
  try {
    const authToken = localStorage.getItem('fridgy_token');
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${apiUrl}/saved-recipes?filter=imported&limit=1&sort=created_at`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      console.error('[ImportDetection] Failed to fetch recipes:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.recipes && data.recipes.length > 0) {
      const latestRecipe = data.recipes[0];
      const recipeTime = new Date(latestRecipe.created_at).getTime();

      // Check if recipe was created after import flow started
      if (recipeTime > startTime) {
        console.log('[ImportDetection] New recipe detected:', latestRecipe.title);
        return latestRecipe;
      }
    }

    return null;
  } catch (error) {
    console.error('[ImportDetection] Error checking for recipe:', error);
    return null;
  }
};

/**
 * Start polling for new recipe import
 * @param {Function} onSuccess - Callback when recipe is detected
 * @param {Function} onTimeout - Callback if no recipe found within timeout
 * @param {number} pollInterval - How often to check (milliseconds)
 * @param {number} timeout - When to give up (milliseconds)
 * @returns {Function} - Cleanup function to stop polling
 */
export const detectRecipeImport = ({
  onSuccess,
  onTimeout,
  pollInterval = 2000,
  timeout = 60000
}) => {
  const startTime = Date.now();
  let isActive = true;

  const poll = async () => {
    if (!isActive) return;

    const recipe = await checkForNewRecipe(startTime);

    if (recipe) {
      isActive = false;
      if (onSuccess) onSuccess(recipe);
      return;
    }

    // Check if timed out
    if (Date.now() - startTime > timeout) {
      isActive = false;
      console.log('[ImportDetection] Polling timed out after', timeout, 'ms');
      if (onTimeout) onTimeout();
      return;
    }

    // Schedule next poll
    if (isActive) {
      setTimeout(poll, pollInterval);
    }
  };

  // Start polling
  poll();

  // Return cleanup function
  return () => {
    isActive = false;
    console.log('[ImportDetection] Polling stopped');
  };
};

/**
 * Simple promise-based detection with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object>} - Resolves with recipe or rejects on timeout
 */
export const waitForRecipeImport = (timeoutMs = 60000) => {
  return new Promise((resolve, reject) => {
    const cleanup = detectRecipeImport({
      onSuccess: (recipe) => {
        resolve(recipe);
      },
      onTimeout: () => {
        reject(new Error('Recipe import detection timed out'));
      },
      timeout: timeoutMs
    });

    // Return cleanup in case caller wants to cancel
    return cleanup;
  });
};
