import {
  collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HealthRecord, HealthCategory } from "@/types";

export async function addHealthRecord(
  childId: string,
  data: Omit<HealthRecord, "id" | "childId" | "createdAt">
): Promise<HealthRecord> {
  const record: Omit<HealthRecord, "id"> = { ...data, childId, createdAt: new Date().toISOString() };
  const docRef = await addDoc(collection(db, "healthRecords"), record);
  return { id: docRef.id, ...record };
}

export async function getHealthRecords(childId: string): Promise<HealthRecord[]> {
  const q = query(collection(db, "healthRecords"), where("childId", "==", childId));
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() } as HealthRecord));
  return records.sort((a, b) => b.recordDate.localeCompare(a.recordDate));
}

export async function deleteHealthRecord(recordId: string): Promise<void> {
  await deleteDoc(doc(db, "healthRecords", recordId));
}

export const categoryConfig: Record<HealthCategory, { label: string; emoji: string; color: string }> = {
  clinic: { label: "Lawatan Klinik", emoji: "🏥", color: "bg-blue-100 text-blue-700" },
  vaccination: { label: "Vaksinasi", emoji: "💉", color: "bg-green-100 text-green-700" },
  medication: { label: "Ubat-ubatan", emoji: "💊", color: "bg-purple-100 text-purple-700" },
  allergy: { label: "Alahan", emoji: "⚠️", color: "bg-red-100 text-red-700" },
  dental: { label: "Pergigian", emoji: "🦷", color: "bg-yellow-100 text-yellow-700" },
  eye: { label: "Penglihatan", emoji: "👁️", color: "bg-cyan-100 text-cyan-700" },
  hospital: { label: "Kemasukan Hospital", emoji: "🏨", color: "bg-orange-100 text-orange-700" },
};
