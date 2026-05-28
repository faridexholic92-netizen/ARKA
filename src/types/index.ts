export type UserRole = "parent" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  fullName: string;
  nickname?: string;
  birthDate: string;
  gender: "male" | "female";
  bloodType?: string;
  photo?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
}

export interface GrowthRecord {
  id: string;
  childId: string;
  weight: number;
  height: number;
  bmi: number;
  headSize?: number;
  recordDate: string;
  notes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  status: "present" | "absent" | "sick" | "holiday" | "half-day";
  attendanceDate: string;
  notes?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  childId: string;
  title: string;
  category: "academic" | "sports" | "arts" | "religion" | "competition" | "award";
  description?: string;
  score?: string;
  certificate?: string;
  recordDate: string;
  createdAt: string;
}

export type HealthCategory =
  | "clinic"
  | "vaccination"
  | "medication"
  | "allergy"
  | "dental"
  | "eye"
  | "hospital";

export interface HealthRecord {
  id: string;
  childId: string;
  category: HealthCategory;
  title: string;
  description?: string;
  hospital?: string;
  doctor?: string;
  medication?: string;
  nextAppointment?: string;
  recordDate: string;
  createdAt: string;
}
