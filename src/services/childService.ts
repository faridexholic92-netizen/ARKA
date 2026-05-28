import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Child } from "@/types";

export async function addChild(parentId: string, data: Omit<Child, "id" | "parentId" | "createdAt">): Promise<Child> {
  const child: Omit<Child, "id"> = { ...data, parentId, createdAt: new Date().toISOString() };
  const docRef = await addDoc(collection(db, "children"), child);
  return { id: docRef.id, ...child };
}

export async function getChildren(parentId: string): Promise<Child[]> {
  const q = query(collection(db, "children"), where("parentId", "==", parentId));
  const snap = await getDocs(q);
  const children = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Child));
  return children.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getChild(childId: string): Promise<Child | null> {
  const snap = await getDoc(doc(db, "children", childId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Child;
}

export async function updateChild(childId: string, data: Partial<Child>): Promise<void> {
  await updateDoc(doc(db, "children", childId), data);
}

export async function deleteChild(childId: string): Promise<void> {
  await deleteDoc(doc(db, "children", childId));
}

export async function uploadChildPhoto(childId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `children/${childId}/photo`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
