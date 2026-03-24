import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: appletConfig.projectId,
  appId: appletConfig.appId,
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  storageBucket: appletConfig.storageBucket,
  messagingSenderId: appletConfig.messagingSenderId,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}
