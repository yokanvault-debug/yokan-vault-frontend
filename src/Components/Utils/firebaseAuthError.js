const getFirebaseAuthErrorMessage = (error, method = 'selected sign-in method') => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || error || '');
  const normalizedMessage = message.toLowerCase();

  if (code === 'auth/user-disabled' || normalizedMessage.includes('auth/user-disabled')) {
    return 'This account has been removed or disabled. Please contact the store admin.';
  }
  if (code === 'auth/operation-not-allowed' || normalizedMessage.includes('auth/operation-not-allowed')) {
    return `${method} is disabled in Firebase Authentication. Enable it in Firebase Console under Authentication > Sign-in method.`;
  }
  if (code === 'auth/email-already-in-use' || normalizedMessage.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (code === 'auth/weak-password' || normalizedMessage.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/requires-recent-login' || normalizedMessage.includes('auth/requires-recent-login')) {
    return 'For security, sign out and sign in again before changing your password.';
  }
  if (
    code === 'auth/account-exists-with-different-credential' ||
    normalizedMessage.includes('auth/account-exists-with-different-credential')
  ) {
    return 'An account already exists with this email address using another sign-in method. Please sign in with that method instead.';
  }
  if (code === 'auth/popup-closed-by-user' || normalizedMessage.includes('auth/popup-closed-by-user')) {
    return 'The sign-in popup was closed before completion.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    normalizedMessage.includes('auth/invalid-credential') ||
    normalizedMessage.includes('auth/wrong-password') ||
    normalizedMessage.includes('auth/user-not-found')
  ) {
    return 'Invalid email or password. Please try again.';
  }
  if (
    code === 'auth/network-request-failed' ||
    normalizedMessage.includes('network error') ||
    normalizedMessage.includes('failed to fetch')
  ) {
    return 'Could not connect to the authentication service. Check your internet connection and try again.';
  }

  return message.replace(/^Firebase:\s*/i, '') || 'An unexpected error occurred. Please try again.';
};

export default getFirebaseAuthErrorMessage;
