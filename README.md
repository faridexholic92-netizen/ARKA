# 🌟 ARKA — Arkib Rekod Kanak-Kanak

Platform digital untuk memantau perkembangan anak secara sistematik.

## Features (Phase 1 MVP)

- ✅ **Authentication** — Login, Register, Forgot Password (Firebase Auth)
- ✅ **Child Profile** — Tambah & urus profil anak
- ✅ **Growth Tracker** — Rekod berat, tinggi, BMI dengan carta
- ✅ **Attendance** — Rekod kehadiran dengan statistik
- ✅ **Achievements** — Rekod pencapaian anak
- ✅ **Dashboard** — Ringkasan & overview

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** TailwindCSS + ShadCN UI
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **Deploy:** Vercel

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/faridexholic92-netizen/arka.git
cd arka
npm install
```

### 2. Firebase Setup

1. Pergi ke [Firebase Console](https://console.firebase.google.com)
2. Buat projek baru
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**
5. Enable **Storage**
6. Pergi ke **Project Settings → General → Your apps → Add Web App**
7. Copy config

### 3. Environment Variables

Buat fail `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel

1. Push ke GitHub
2. Pergi ke [vercel.com](https://vercel.com)
3. Import repository `arka`
4. Tambah Environment Variables (sama seperti `.env.local`)
5. Deploy!

## Firebase Security Rules

Untuk Firestore, set rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /children/{childId} {
      allow read, write: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /growthRecords/{recordId} {
      allow read, write: if request.auth != null;
    }
    match /attendance/{recordId} {
      allow read, write: if request.auth != null;
    }
    match /achievements/{recordId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Folder Structure

```
src/
 ├── app/
 │    ├── (auth)/          # Login, Register, Forgot Password
 │    └── (dashboard)/     # Protected pages
 ├── components/           # Shared components (Sidebar)
 ├── features/             # Feature modules
 ├── services/             # Firebase services
 ├── store/                # Zustand state
 ├── lib/                  # Utils & Firebase config
 └── types/                # TypeScript types
```

---

Built with ❤️ for ARKA
