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
  REPORT_STATUS,
  SENSITIVE_CATEGORIES,
} from '../config/constants.js';
import { loadDemoState, saveDemoState } from '../data/localStore.js';
import { uploadReportPhoto } from './storageService.js';
import { runMatchingForReport } from './matchService.js';
import { ITEM_ARTWORKS } from '../data/demoSeed.js';

function pickFallbackArtwork(category = '') {
  const lower = category.toLowerCase();
  if (lower.includes('wallet')) return ITEM_ARTWORKS.wallet;
  if (lower.includes('bottle')) return ITEM_ARTWORKS.bottle;
  if (lower.includes('document') || lower.includes('id')) return ITEM_ARTWORKS.idcard;
  if (lower.includes('bag')) return ITEM_ARTWORKS.bag;
  if (lower.includes('book')) return ITEM_ARTWORKS.book;
  if (lower.includes('key')) return ITEM_ARTWORKS.keys;
  if (lower.includes('electronic')) return ITEM_ARTWORKS.earbuds;
  return ITEM_ARTWORKS.calculator;
}

function maskSensitiveNumbers(text = '') {
  // Redact long digit sequences (IDs, card numbers, phone digits) in public views
  return text.replace(/\b\d{4,}\b/g, (match) => `${'*'.repeat(Math.max(2, match.length - 2))}${match.slice(-2)}`);
}

export function sanitizeReportForViewer(report, viewer = null, secretText = '') {
  if (!report) return null;
  const isAdmin = viewer?.role === 'admin';
  const isOwner = viewer?.uid && viewer.uid === report.reporterId;
  const isSensitive = SENSITIVE_CATEGORIES.includes(report.category);

  const sanitized = { ...report };
  sanitized.isSensitive = isSensitive;

  if (isOwner || isAdmin) {
    sanitized.privateDetails = secretText || '';
    sanitized.canViewPrivateDetails = true;
    return sanitized;
  }

  // Public or non-owner viewer: never expose privateDetails or personal contact info
  delete sanitized.privateDetails;
  sanitized.canViewPrivateDetails = false;

  if (!viewer) {
    // Public explore restricts full reporter name
    const first = (report.reporterName || 'Campus User').split(' ')[0];
    sanitized.reporterName = `${first} (Verified Student)`;
  }

  if (isSensitive) {
    sanitized.description = maskSensitiveNumbers(report.description);
    sanitized.sensitiveNotice =
      'Complete identifying details are protected and verified in person via TrustLoop / Campus Security.';
  }

  return sanitized;
}

export async function createReport({
  type,
  itemName,
  category,
  description,
  colour,
  location,
  date,
  time = '',
  photoFile = null,
  privateDetails = '',
  heldBySecurity = false,
  reporter,
}) {
  if (!reporter?.uid) throw new Error('You must be signed in to submit a report.');
  if (!itemName?.trim() || !category || !description?.trim() || !location || !date) {
    throw new Error('Please fill in all required item details.');
  }

  const photoUrl = photoFile
    ? await uploadReportPhoto(photoFile, reporter.uid)
    : pickFallbackArtwork(category);

  const now = new Date().toISOString();
  const initialStatus =
    type === 'found'
      ? heldBySecurity
        ? REPORT_STATUS.HELD_BY_SECURITY
        : REPORT_STATUS.AVAILABLE
      : REPORT_STATUS.ACTIVE;

  const reportPayload = {
    type,
    itemName: itemName.trim(),
    category,
    description: description.trim(),
    colour: colour || 'Other',
    location,
    date,
    time,
    photoUrl,
    reporterId: reporter.uid,
    reporterName: reporter.name || 'Student',
    status: initialStatus,
    heldBySecurity: Boolean(type === 'found' && heldBySecurity),
    securityShelfCode: heldBySecurity ? `SEC-${Math.floor(100 + Math.random() * 900)}` : '',
    createdAt: now,
    updatedAt: now,
  };

  let createdReport = null;

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'reports'), reportPayload);
    createdReport = { id: docRef.id, ...reportPayload };
    if (privateDetails?.trim()) {
      await setDoc(doc(db, 'reportSecrets', docRef.id), {
        reporterId: reporter.uid,
        privateDetails: privateDetails.trim(),
        updatedAt: now,
      });
    }
  } else {
    const state = loadDemoState();
    const id = `rep_${type}_${Date.now()}`;
    createdReport = { id, ...reportPayload };
    state.reports.unshift(createdReport);
    if (privateDetails?.trim()) {
      state.reportSecrets[id] = {
        reporterId: reporter.uid,
        privateDetails: privateDetails.trim(),
      };
    }
    saveDemoState(state);
  }

  const generatedMatches = await runMatchingForReport(createdReport);

  return {
    report: sanitizeReportForViewer(createdReport, reporter, privateDetails.trim()),
    matchesFound: generatedMatches.length,
  };
}

export async function listReports({
  type = 'all',
  category = 'ALL',
  location = 'ALL',
  dateFrom = '',
  dateTo = '',
  search = '',
  status = 'ALL',
  reporterId = null,
  includeClosed = true,
  sortBy = 'newest',
  viewer = null,
} = {}) {
  let rawReports = [];
  let secretsMap = {};

  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    rawReports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (viewer?.role === 'admin' || reporterId === viewer?.uid) {
      const targetReports = rawReports.filter(
        (r) => viewer?.role === 'admin' || r.reporterId === viewer?.uid
      );
      await Promise.all(
        targetReports.map(async (r) => {
          try {
            const sec = await getDoc(doc(db, 'reportSecrets', r.id));
            if (sec.exists()) secretsMap[r.id] = sec.data().privateDetails;
          } catch {
            // Skip unauthorized secrets cleanly
          }
        })
      );
    }
  } else {
    const state = loadDemoState();
    rawReports = state.reports;
    secretsMap = Object.fromEntries(
      Object.entries(state.reportSecrets || {}).map(([k, v]) => [k, v.privateDetails])
    );
  }

  const searchLower = search.trim().toLowerCase();

  const filtered = rawReports
    .filter((r) => {
      if (r.status === REPORT_STATUS.REMOVED && viewer?.role !== 'admin') return false;
      if (!includeClosed && [REPORT_STATUS.RETURNED, REPORT_STATUS.CLOSED, REPORT_STATUS.REJECTED].includes(r.status)) {
        return false;
      }
      if (type !== 'all' && r.type !== type) return false;
      if (category !== 'ALL' && r.category !== category) return false;
      if (location !== 'ALL' && r.location !== location) return false;
      if (status !== 'ALL' && r.status !== status) return false;
      if (reporterId && r.reporterId !== reporterId) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (searchLower) {
        const haystack = `${r.itemName} ${r.description} ${r.category} ${r.location} ${r.colour}`.toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }
      return true;
    })
    .map((r) => sanitizeReportForViewer(r, viewer, secretsMap[r.id] || ''));

  filtered.sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'date_desc') return (b.date || '').localeCompare(a.date || '');
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return filtered;
}

export async function updateReport(reportId, updates, actor) {
  if (!actor?.uid) throw new Error('Authentication required.');

  const allowedUpdates = {
    itemName: updates.itemName?.trim(),
    category: updates.category,
    description: updates.description?.trim(),
    colour: updates.colour,
    location: updates.location,
    date: updates.date,
    time: updates.time,
    status: updates.status,
    updatedAt: new Date().toISOString(),
  };

  Object.keys(allowedUpdates).forEach(
    (k) => allowedUpdates[k] === undefined && delete allowedUpdates[k]
  );

  let updatedReport = null;

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'reports', reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Report not found.');
    const existing = snap.data();
    if (existing.reporterId !== actor.uid && actor.role !== 'admin') {
      throw new Error('You do not have permission to modify this report.');
    }
    await updateDoc(ref, allowedUpdates);
    if (updates.privateDetails !== undefined) {
      await setDoc(
        doc(db, 'reportSecrets', reportId),
        {
          reporterId: existing.reporterId,
          privateDetails: updates.privateDetails.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    updatedReport = { id: reportId, ...existing, ...allowedUpdates };
  } else {
    const state = loadDemoState();
    const idx = state.reports.findIndex((r) => r.id === reportId);
    if (idx === -1) throw new Error('Report not found.');
    const existing = state.reports[idx];
    if (existing.reporterId !== actor.uid && actor.role !== 'admin') {
      throw new Error('You do not have permission to modify this report.');
    }
    state.reports[idx] = { ...existing, ...allowedUpdates };
    if (updates.privateDetails !== undefined) {
      state.reportSecrets[reportId] = {
        reporterId: existing.reporterId,
        privateDetails: updates.privateDetails.trim(),
      };
    }
    saveDemoState(state);
    updatedReport = state.reports[idx];
  }

  if ([REPORT_STATUS.ACTIVE, REPORT_STATUS.AVAILABLE, REPORT_STATUS.MATCH_FOUND].includes(updatedReport.status)) {
    await runMatchingForReport(updatedReport);
  }

  return sanitizeReportForViewer(updatedReport, actor, updates.privateDetails);
}

export async function closeOrRemoveReport(reportId, targetStatus, actor) {
  const validStatuses = [REPORT_STATUS.CLOSED, REPORT_STATUS.REMOVED, REPORT_STATUS.REJECTED];
  if (!validStatuses.includes(targetStatus)) {
    throw new Error('Invalid status transition.');
  }
  if (targetStatus === REPORT_STATUS.REMOVED && actor.role !== 'admin') {
    throw new Error('Only Campus Security Administrators can remove reports.');
  }
  return await updateReport(reportId, { status: targetStatus }, actor);
}
