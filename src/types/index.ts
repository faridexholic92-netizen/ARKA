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

  // Maklumat Asas
  fullName: string;
  nickname?: string;
  birthDate: string;
  gender: "male" | "female";
  bloodType?: string;
  photo?: string;

  // Maklumat Rasmi
  icNumber?: string;        // No. MyKid / No. Kad Pengenalan
  birthCertNo?: string;     // No. Sijil Kelahiran
  passportNo?: string;      // No. Passport
  birthPlace?: string;      // Tempat Lahir
  nationality?: string;     // Kerakyatan
  race?: string;            // Bangsa
  religion?: string;        // Agama

  // Alamat
  address?: string;         // Alamat penuh
  postcode?: string;        // Poskod
  city?: string;            // Bandar
  state?: string;           // Negeri

  // Maklumat Sekolah / Tadika
  schoolName?: string;      // Nama Sekolah / Tadika
  schoolYear?: string;      // Darjah / Tahun / Level
  schoolClass?: string;     // Nama Kelas

  // Maklumat Bapa
  fatherName?: string;
  fatherIc?: string;
  fatherPhone?: string;
  fatherJob?: string;

  // Maklumat Ibu
  motherName?: string;
  motherIc?: string;
  motherPhone?: string;
  motherJob?: string;

  // Kenalan Kecemasan
  emergencyContact?: string;
  emergencyPhone?: string;

  // Nota
  medicalNotes?: string;

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
