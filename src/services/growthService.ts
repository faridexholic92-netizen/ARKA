import {
  collection, addDoc, getDocs, query, where, deleteDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrowthRecord } from "@/types";
import { calculateBMI } from "@/lib/utils";

export async function addGrowthRecord(
  childId: string,
  data: { weight: number; height: number; headSize?: number; recordDate: string; notes?: string }
): Promise<GrowthRecord> {
  const bmi = calculateBMI(data.weight, data.height);
  const record: Omit<GrowthRecord, "id"> = { ...data, childId, bmi, createdAt: new Date().toISOString() };
  const docRef = await addDoc(collection(db, "growthRecords"), record);
  return { id: docRef.id, ...record };
}

export async function getGrowthRecords(childId: string): Promise<GrowthRecord[]> {
  const q = query(collection(db, "growthRecords"), where("childId", "==", childId));
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GrowthRecord));
  return records.sort((a, b) => a.recordDate.localeCompare(b.recordDate));
}

export async function deleteGrowthRecord(recordId: string): Promise<void> {
  await deleteDoc(doc(db, "growthRecords", recordId));
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { label: "Normal", color: "text-green-500" };
  if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
  return { label: "Obese", color: "text-red-500" };
}
