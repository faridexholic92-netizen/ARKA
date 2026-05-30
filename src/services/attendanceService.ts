import {
  collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AttendanceRecord } from "@/types";

export async function addAttendance(
  childId: string,
  data: { status: AttendanceRecord["status"]; attendanceDate: string; notes?: string }
): Promise<AttendanceRecord> {
  const record: Omit<AttendanceRecord, "id"> = { ...data, childId, createdAt: new Date().toISOString() };
  const docRef = await addDoc(collection(db, "attendance"), record);
  return { id: docRef.id, ...record };
}

export async function updateAttendanceRecord(
  recordId: string,
  data: { status: AttendanceRecord["status"]; attendanceDate: string; notes?: string }
): Promise<void> {
  await updateDoc(doc(db, "attendance", recordId), data);
}

export async function getAttendance(childId: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, "attendance"), where("childId", "==", childId));
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
  return records.sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
}

export async function deleteAttendance(recordId: string): Promise<void> {
  await deleteDoc(doc(db, "attendance", recordId));
}

export function getAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const sick = records.filter((r) => r.status === "sick").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, sick, percentage };
}
