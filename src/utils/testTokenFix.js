/**
 * Test script to verify token fixes
 * Run this in browser console to test if the fix works
 */

const testTokenFix = () => {
  console.log('=== TESTING TOKEN FIX ===');

  // Check for old keys (should not exist in production)
  const oldToken = localStorage.getItem('token');
  const oldUser = localStorage.getItem('user');

  // Check for new keys (should exist when logged in)
  const fridgyToken = localStorage.getItem('fridgy_token');
  const fridgyUser = localStorage.getItem('fridgy_user');
  const fridgyRefreshToken = localStorage.getItem('fridgy_refresh_token');

  console.log('Old Keys (should be null):');
  console.log('  token:', oldToken ? 'EXISTS (PROBLEM!)' : 'null ✅');
  console.log('  user:', oldUser ? 'EXISTS (PROBLEM!)' : 'null ✅');

  console.log('\nCorrect Keys (should exist when logged in):');
  console.log('  fridgy_token:', fridgyToken ? `EXISTS ✅ (${fridgyToken.substring(0, 20)}...)` : 'MISSING ❌');
  console.log('  fridgy_user:', fridgyUser ? 'EXISTS ✅' : 'MISSING ❌');
  console.log('  fridgy_refresh_token:', fridgyRefreshToken ? 'EXISTS ✅' : 'MISSING ❌');

  if (fridgyToken) {
    // Try to decode the token
    try {
      const parts = fridgyToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const exp = new Date(payload.exp * 1000);
        const now = new Date();

        console.log('\nToken Details:');
        console.log('  User ID:', payload.userId || payload.id);
        console.log('  Email:', payload.email);
        console.log('  Expires:', exp.toLocaleString());
        console.log('  Status:', exp > now ? '✅ VALID' : '❌ EXPIRED');
      }
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }

  console.log('\n=== TEST COMPLETE ===');
  console.log('Push notifications should now work if fridgy_token exists and is valid.');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testTokenFix = testTokenFix;
}

export default testTokenFix;