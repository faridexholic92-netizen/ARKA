import {
  collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Achievement } from "@/types";

export async function addAchievement(
  childId: string,
  data: Omit<Achievement, "id" | "childId" | "createdAt">
): Promise<Achievement> {
  const record: Omit<Achievement, "id"> = { ...data, childId, createdAt: new Date().toISOString() };
  const docRef = await addDoc(collection(db, "achievements"), record);
  return { id: docRef.id, ...record };
}

export async function updateAchievement(
  recordId: string,
  data: Omit<Achievement, "id" | "childId" | "createdAt">
): Promise<void> {
  await updateDoc(doc(db, "achievements", recordId), data);
}

export async function getAchievements(childId: string): Promise<Achievement[]> {
  const q = query(collection(db, "achievements"), where("childId", "==", childId));
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Achievement));
  return records.sort((a, b) => b.recordDate.localeCompare(a.recordDate));
}

export async function deleteAchievement(recordId: string): Promise<void> {
  await deleteDoc(doc(db, "achievements", recordId));
}

export const categoryLabels: Record<Achievement["category"], string> = {
  academic: "Akademik",
  sports: "Sukan",
  arts: "Seni",
  religion: "Agama",
  competition: "Pertandingan",
  award: "Anugerah",
};

export const categoryColors: Record<Achievement["category"], string> = {
  academic: "bg-blue-100 text-blue-700",
  sports: "bg-green-100 text-green-700",
  arts: "bg-purple-100 text-purple-700",
  religion: "bg-yellow-100 text-yellow-700",
  competition: "bg-orange-100 text-orange-700",
  award: "bg-red-100 text-red-700",
};
