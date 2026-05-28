import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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

// Compress + convert image to base64, store directly in Firestore (no Storage needed)
export async function uploadChildPhoto(_childId: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        // Resize to max 400x400
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        // JPEG quality 0.75 — biasanya <100KB
        const base64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
