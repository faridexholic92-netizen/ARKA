import {
  collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc,
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

export async function getAttendance(childId: string): Promise<AttendanceRecord[]> {
  const q = query(
    collection(db, "attendance"),
    where("childId", "==", childId),
    orderBy("attendanceDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord));
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
