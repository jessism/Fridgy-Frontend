/**
 * Test Utility for Guided Tour
 * Run in browser console: window.testGuidedTour()
 */

export const triggerGuidedTour = () => {
  console.log('🧪 [Test] Triggering guided tour...');

  // Reset the guided tour state
  localStorage.removeItem('trackabite_guided_tour');

  // Clear the imported recipe flag
  localStorage.removeItem('has_imported_recipe');

  console.log('✅ [Test] Guided tour will trigger on next page load');
  console.log('🔄 [Test] Refreshing page...');

  // Reload the page to trigger the tour
  window.location.reload();
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  window.testGuidedTour = triggerGuidedTour;
  console.log('🧪 Test utility loaded: Use window.testGuidedTour() to trigger the guided tour');
}

export default {
  triggerGuidedTour
};
