import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import {
  ITEM_CATEGORIES,
  RECOVERY_STATUS,
  REPORT_STATUS,
} from '../config/constants.js';
import { DEFAULT_MATCHING_CONFIG } from '../config/matchingConfig.js';
import { loadDemoState, saveDemoState } from '../data/localStore.js';

export async function listUsers() {
  if (isFirebaseConfigured && db) {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  }
  const state = loadDemoState();
  return state.users.map(({ password: _pw, ...u }) => u);
}

export async function toggleUserSuspension(targetUid, actor) {
  if (actor?.role !== 'admin') throw new Error('Administrator access required.');
  if (targetUid === actor.uid) throw new Error('You cannot suspend your own active admin session.');

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'users', targetUid);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('User not found.');
    const nextSuspended = !snap.data().isSuspended;
    await updateDoc(ref, { isSuspended: nextSuspended });
    await addDoc(collection(db, 'auditLogs'), {
      actorId: actor.uid,
      actorName: actor.name,
      action: nextSuspended ? 'USER_SUSPENDED' : 'USER_RESTORED',
      targetId: targetUid,
      details: `${nextSuspended ? 'Suspended' : 'Restored'} user ${snap.data().email}.`,
      createdAt: new Date().toISOString(),
    });
    return nextSuspended;
  }

  const state = loadDemoState();
  const user = state.users.find((u) => u.uid === targetUid);
  if (!user) throw new Error('User not found.');
  user.isSuspended = !user.isSuspended;
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    actorId: actor.uid,
    actorName: actor.name,
    action: user.isSuspended ? 'USER_SUSPENDED' : 'USER_RESTORED',
    targetId: targetUid,
    details: `${user.isSuspended ? 'Suspended' : 'Restored'} account ${user.email}.`,
    createdAt: new Date().toISOString(),
  });
  saveDemoState(state);
  return user.isSuspended;
}

export async function toggleHeldBySecurity(reportId, { heldBySecurity, shelfCode = '', actor }) {
  if (actor?.role !== 'admin') throw new Error('Administrator access required.');
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'reports', reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Report not found.');
    const nextStatus = heldBySecurity ? REPORT_STATUS.HELD_BY_SECURITY : REPORT_STATUS.AVAILABLE;
    await updateDoc(ref, {
      heldBySecurity,
      securityShelfCode: heldBySecurity ? shelfCode || 'SEC-VAULT' : '',
      status: nextStatus,
      updatedAt: now,
    });
    await addDoc(collection(db, 'auditLogs'), {
      actorId: actor.uid,
      actorName: actor.name,
      action: heldBySecurity ? 'HELD_ITEM_LOGGED' : 'HELD_ITEM_RELEASED',
      targetId: reportId,
      details: `${heldBySecurity ? 'Logged into Security custody' : 'Released from custody'}: ${snap.data().itemName}.`,
      createdAt: now,
    });
    return;
  }

  const state = loadDemoState();
  const rep = state.reports.find((r) => r.id === reportId);
  if (!rep) throw new Error('Report not found.');
  rep.heldBySecurity = heldBySecurity;
  rep.securityShelfCode = heldBySecurity ? shelfCode || `SEC-${Math.floor(100 + Math.random() * 899)}` : '';
  rep.status = heldBySecurity ? REPORT_STATUS.HELD_BY_SECURITY : REPORT_STATUS.AVAILABLE;
  rep.updatedAt = now;

  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    actorId: actor.uid,
    actorName: actor.name,
    action: heldBySecurity ? 'HELD_ITEM_LOGGED' : 'HELD_ITEM_RELEASED',
    targetId: reportId,
    details: `${heldBySecurity ? `Logged ${rep.itemName} on shelf ${rep.securityShelfCode}` : `Released ${rep.itemName} from vault`}.`,
    createdAt: now,
  });
  saveDemoState(state);
}

export async function markItemReturnedByAdmin(reportId, actor) {
  if (actor?.role !== 'admin') throw new Error('Administrator access required.');
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'reports', reportId), {
      status: REPORT_STATUS.RETURNED,
      heldBySecurity: false,
      updatedAt: now,
    });
    await addDoc(collection(db, 'auditLogs'), {
      actorId: actor.uid,
      actorName: actor.name,
      action: 'ITEM_MARKED_RETURNED',
      targetId: reportId,
      details: 'Administrator verified and marked item as returned.',
      createdAt: now,
    });
    return;
  }

  const state = loadDemoState();
  const rep = state.reports.find((r) => r.id === reportId);
  if (!rep) throw new Error('Report not found.');
  rep.status = REPORT_STATUS.RETURNED;
  rep.heldBySecurity = false;
  rep.updatedAt = now;
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    actorId: actor.uid,
    actorName: actor.name,
    action: 'ITEM_MARKED_RETURNED',
    targetId: reportId,
    details: `Marked "${rep.itemName}" as safely returned to owner.`,
    createdAt: now,
  });
  saveDemoState(state);
}

export async function listAuditLogs() {
  if (isFirebaseConfigured && db) {
    const snap = await getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  const state = loadDemoState();
  return [...(state.auditLogs || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getAdminSettings() {
  if (isFirebaseConfigured && db) {
    const snap = await getDoc(doc(db, 'adminSettings', 'matching'));
    if (snap.exists()) return snap.data();
    return {
      matchingConfig: DEFAULT_MATCHING_CONFIG,
      requireSecurityHandoverForSensitive: true,
      campusName: 'FoundIt University Campus',
    };
  }
  const state = loadDemoState();
  return state.adminSettings;
}

export async function saveAdminSettings(nextSettings, actor) {
  if (actor?.role !== 'admin') throw new Error('Administrator access required.');
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'adminSettings', 'matching'), nextSettings, { merge: true });
    await addDoc(collection(db, 'auditLogs'), {
      actorId: actor.uid,
      actorName: actor.name,
      action: 'SETTINGS_UPDATED',
      targetId: 'matching',
      details: 'Updated SmartFind AI weights, thresholds, or security policies.',
      createdAt: now,
    });
    return nextSettings;
  }

  const state = loadDemoState();
  state.adminSettings = { ...state.adminSettings, ...nextSettings };
  state.auditLogs.unshift({
    id: `audit_${Date.now()}`,
    actorId: actor.uid,
    actorName: actor.name,
    action: 'SETTINGS_UPDATED',
    targetId: 'adminSettings',
    details: 'Updated SmartFind AI thresholds and campus security settings.',
    createdAt: now,
  });
  saveDemoState(state);
  return state.adminSettings;
}

export function buildAnalyticsSummary(reports = [], matches = [], recoveryRequests = []) {
  const activeReports = reports.filter((r) => r.status !== REPORT_STATUS.REMOVED);
  const lostCount = activeReports.filter((r) => r.type === 'lost').length;
  const foundCount = activeReports.filter((r) => r.type === 'found').length;
  const returnedCount = activeReports.filter((r) => r.status === REPORT_STATUS.RETURNED).length;
  const heldCount = activeReports.filter((r) => r.heldBySecurity && r.status !== REPORT_STATUS.RETURNED).length;
  const pendingRequests = recoveryRequests.filter(
    (r) => r.status !== RECOVERY_STATUS.COMPLETED && r.status !== RECOVERY_STATUS.REJECTED
  ).length;
  const completedRequests = recoveryRequests.filter(
    (r) => r.status === RECOVERY_STATUS.COMPLETED
  ).length;

  const recoveryRate =
    activeReports.length > 0
      ? Math.round((returnedCount / Math.max(1, Math.min(lostCount, foundCount) || activeReports.length)) * 100)
      : 0;

  // Category distribution
  const catCounts = {};
  activeReports.forEach((r) => {
    const key = r.category || 'Other';
    catCounts[key] = (catCounts[key] || 0) + 1;
  });

  const total = Math.max(1, activeReports.length);
  const categoryBreakdown = ITEM_CATEGORIES.map((cat) => ({
    category: cat,
    count: catCounts[cat] || 0,
    percentage: Math.round(((catCounts[cat] || 0) / total) * 100),
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Weekly recovery & activity curve (last 7 days based on actual timestamps + baseline visibility)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklySeries = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateIso = d.toISOString().split('T')[0];
    const dayReports = activeReports.filter((r) => (r.createdAt || '').startsWith(dateIso) || r.date === dateIso).length;
    const dayRecoveries = recoveryRequests.filter(
      (rq) => rq.status === RECOVERY_STATUS.COMPLETED && (rq.updatedAt || '').startsWith(dateIso)
    ).length;
    weeklySeries.push({
      label: dayNames[d.getDay()],
      date: dateIso,
      reports: dayReports,
      recoveries: dayRecoveries,
    });
  }

  return {
    totalReports: activeReports.length,
    lostCount,
    foundCount,
    potentialMatches: matches.filter((m) => m.status !== 'DISMISSED').length,
    pendingRequests,
    completedRequests,
    returnedCount,
    heldCount,
    recoveryRate: Math.min(100, recoveryRate),
    categoryBreakdown,
    weeklySeries,
  };
}
