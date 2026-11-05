import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { auth, firebaseConfigured, requireFirebaseAuth } from './firebase';
import { LOGIN_SUCCESS } from '../../constants/userConstants';
import { logout as logoutAction } from '../../actions/userActions';

const AuthContext = createContext();

// backend address without /api/v1  (VITE_API=http://localhost:5000/api/v1)
export const API_ORIGIN = (import.meta.env.VITE_API || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

export const isUserVerified = (user) => {
  if (!user) return false;
  const isSocial = user.providerData?.some(
    (p) => p.providerId === 'google.com'
  );
  return Boolean(user.emailVerified || isSocial);
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  // Loads the profile of the signed-in Firebase user and, when the email is verified and the
  // profile is complete, opens the cookie session the rest of the shop (cart, orders, admin) uses.
  const syncSession = async (firebaseUser) => {
    const fbUser = firebaseUser || (auth && auth.currentUser);
    if (!fbUser) return null;

    const headers = { Authorization: `Bearer ${await fbUser.getIdToken()}` };
    let profile = null;
    try {
      const res = await axios.get(`${API_ORIGIN}/api/users/profile`, { headers });
      profile = res.data;
      setMongoUser(profile);
    } catch (error) {
      console.error('Error fetching MongoDB profile:', error.code || error.response?.status || 'unknown error');
      return null;
    }

    if (isUserVerified(fbUser) && profile && profile.username) {
      try {
        const { data } = await axios.post(`${API_ORIGIN}/api/users/session`, {}, { headers, withCredentials: true });
        dispatch({ type: LOGIN_SUCCESS, payload: data.user });
      } catch (error) {
        console.error('Could not open the shop session:', error.code || error.response?.status || 'unknown error');
      }
    }
    return profile;
  };

  // the session must be ready before the page navigates, so it is opened inside these
  const login = async (identifier, password) => {
    let cred;
    if (identifier.includes('@')) {
      cred = await signInWithEmailAndPassword(requireFirebaseAuth(), identifier, password);
    } else {
      const { data } = await axios.post(`${API_ORIGIN}/api/users/login-username`, {
        username: identifier,
        password,
        firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY
      }, { withCredentials: true });
      cred = await signInWithCustomToken(requireFirebaseAuth(), data.customToken);
    }
    if (isUserVerified(cred.user)) await syncSession(cred.user);
    return cred;
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(requireFirebaseAuth(), email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(requireFirebaseAuth(), provider);
    const profile = await syncSession(cred.user);
    // a brand new Google account still has to pick a username
    return { cred, profile, needsProfile: !(profile && profile.username) };
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    const user = requireFirebaseAuth().currentUser;
    if (!user?.email || !user.providerData.some((provider) => provider.providerId === 'password')) {
      throw new Error('This account does not use email and password sign-in.');
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  const logout = async () => {
    setMongoUser(null);
    await dispatch(logoutAction());   // clears the shop cookie session
    if (auth) await signOut(auth);
  };

  useEffect(() => {
    if (!auth) return undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncSession(user);
      } else {
        setMongoUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    currentUser,
    authLoading: loading,
    mongoUser,
    setMongoUser,
    syncSession,
    isUserVerified: () => isUserVerified(currentUser),
    login,
    signup,
    loginWithGoogle,
    updateUserPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
