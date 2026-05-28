import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole } from "@/types";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = "parent"
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });

  const user: User = {
    id: credential.user.uid,
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", credential.user.uid), user);
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", credential.user.uid));
  if (!snap.exists()) throw new Error("User data not found");
  return snap.data() as User;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserData(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}
