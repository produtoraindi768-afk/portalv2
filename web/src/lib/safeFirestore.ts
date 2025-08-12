import { getFirebaseApp } from "@/lib/firebase"
import { getFirestore, Firestore } from "firebase/firestore"

function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

export function getClientFirestore(): Firestore | null {
  try {
    if (!isFirebaseConfigured()) return null
    const app = getFirebaseApp()
    return getFirestore(app)
  } catch (err) {
    console.warn("Firestore not available:", err)
    return null
  }
}


