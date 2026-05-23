import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC5-49Rk0pM3gAHU9c4o2gNbRI2JP8dROk",
  authDomain: "x-51fa5.firebaseapp.com",
  projectId: "x-51fa5",
  storageBucket: "x-51fa5.firebasestorage.app",
  messagingSenderId: "795266434676",
  appId: "1:795266434676:web:a5d4d13860b9cc2dc3f321",
  measurementId: "G-ZWER946MWQ",
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
} catch (e) {
  console.error('Firebase init error:', e)
}

export { auth, db }
export default app
