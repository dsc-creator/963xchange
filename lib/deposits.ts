import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export type DepositStatus =
  | 'pending_payment'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'rejected'
  | 'expired'

export interface DepositRecord {
  id: string
  userId: string
  userEmail: string
  userName: string
  cryptoSymbol: string
  cryptoAmount: number
  usdAmount: number
  network: string
  walletAddress: string
  status: DepositStatus
  createdAt: string         // ISO string
  expiresAt: string         // ISO string  (createdAt + 5 min)
  confirmedByUserAt?: string
  reviewedAt?: string
  adminNote?: string
}

const COL = 'deposits'

// ── Create a new deposit request ─────────────────────────────────────────────
export async function createDepositRequest(data: Omit<DepositRecord, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = await addDoc(collection(db, COL), {
    ...data,
    _createdAt: serverTimestamp(),
  })
  return ref.id
}

// ── User clicked "I Have Deposited" ──────────────────────────────────────────
export async function markUserDeposited(depositId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, COL, depositId), {
    status: 'awaiting_confirmation',
    confirmedByUserAt: new Date().toISOString(),
  })
}

// ── Admin: confirm deposit (credits balance) ─────────────────────────────────
export async function adminConfirmDeposit(depositId: string, note?: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, COL, depositId), {
    status: 'confirmed',
    reviewedAt: new Date().toISOString(),
    adminNote: note ?? '',
  })
}

// ── Admin: reject deposit ────────────────────────────────────────────────────
export async function adminRejectDeposit(depositId: string, note?: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, COL, depositId), {
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    adminNote: note ?? '',
  })
}

// ── Mark as expired (called client-side when timer runs out) ─────────────────
export async function markDepositExpired(depositId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, COL, depositId), {
    status: 'expired',
  })
}

// ── Get deposits for a specific user ─────────────────────────────────────────
export async function getUserDeposits(userId: string): Promise<DepositRecord[]> {
  if (!db) throw new Error('Firestore not initialised')
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DepositRecord))
}

// ── Admin: get ALL deposits ───────────────────────────────────────────────────
export async function getAllDeposits(): Promise<DepositRecord[]> {
  if (!db) throw new Error('Firestore not initialised')
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DepositRecord))
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function isExpired(deposit: DepositRecord): boolean {
  return new Date() > new Date(deposit.expiresAt)
}

export function timeLeft(deposit: DepositRecord): number {
  return Math.max(0, new Date(deposit.expiresAt).getTime() - Date.now())
}
