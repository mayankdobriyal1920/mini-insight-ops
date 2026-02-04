import { AppUser, Role, User } from '@/types/user';
import { InsightEvent } from '@/types/insight';
import { seedEvents } from './seed';

type UserRecord = User & { password: string };

const users: UserRecord[] = [
  { id: 'u-admin', email: 'admin@test.com', password: 'password', role: 'Admin' },
  { id: 'u-analyst', email: 'analyst@test.com', password: 'password', role: 'Analyst' },
  { id: 'u-viewer', email: 'viewer@test.com', password: 'password', role: 'Viewer' },
];

const sessionStore = new Map<string, string>();
const events = new Map<string, InsightEvent>();
let seeded = false;

export function findUserByCredentials(email: string, password: string): User | null {
  const match = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  );
  if (!match) return null;
  const { id, email: userEmail, role } = match;
  return { id, email: userEmail, role };
}

export function getUserById(userId: string): User | null {
  const match = users.find((user) => user.id === userId);
  if (!match) return null;
  const { id, email, role } = match;
  return { id, email, role };
}

export function listUsers(): AppUser[] {
  return users.map(({ id, email, role }) => ({ id, email, role }));
}

export function updateUserRole(userId: string, role: Role): AppUser | null {
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx].role = role;
  return { id: users[idx].id, email: users[idx].email, role: users[idx].role };
}

export function createSessionRecord(userId: string) {
  const sessionId = crypto.randomUUID();
  sessionStore.set(sessionId, userId);
  return sessionId;
}

export function getSessionUser(sessionId: string | undefined | null): User | null {
  if (!sessionId) return null;
  const userId = sessionStore.get(sessionId) ?? sessionId;
  return getUserById(userId);
}

export function deleteSession(sessionId: string | undefined | null) {
  if (!sessionId) return;
  sessionStore.delete(sessionId);
}

export function clearSessions() {
  sessionStore.clear();
}

export function ensureSeeded() {
  if (seeded) return;
  const seededEvents = seedEvents(40);
  seededEvents.forEach((evt) => events.set(evt.id, evt));
  seeded = true;
}

export function listEvents(): InsightEvent[] {
  ensureSeeded();
  return Array.from(events.values());
}

export function getEvent(id: string): InsightEvent | null {
  ensureSeeded();
  return events.get(id) ?? null;
}

export function createEvent(input: Omit<InsightEvent, 'id' | 'createdAt'>): InsightEvent {
  ensureSeeded();
  const event: InsightEvent = {
    ...input,
    id: `evt_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  events.set(event.id, event);
  return event;
}

export function updateEvent(
  id: string,
  input: Partial<Omit<InsightEvent, 'id' | 'createdAt'>>,
): InsightEvent | null {
  ensureSeeded();
  const existing = events.get(id);
  if (!existing) return null;
  const updated: InsightEvent = { ...existing, ...input, id, createdAt: existing.createdAt };
  events.set(id, updated);
  return updated;
}

export function deleteEvent(id: string): boolean {
  ensureSeeded();
  return events.delete(id);
}
