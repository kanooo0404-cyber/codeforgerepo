import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import {
  RECOVERY_STATUS,
  REPORT_STATUS,
  SENSITIVE_CATEGORIES,
} from '../config/constants.js';
import { loadDemoState, saveDemoState } from '../data/localStore.js';
import { createNotification } from './notificationService.js';

async function appendAuditLog({ actor, action, targetId, details }) {
  const log = {
    actorId: actor.uid,
    actorName: actor.name || 'User',
    action,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, 'auditLogs'), log);
    return;
  }
  const state = loadDemoState();
  state.auditLogs.unshift({ id: `audit_${Date.now()}`, ...log });
  saveDemoState(state);
}

export async function listRecoveryRequests({ userId = null, isAdmin = false } = {}) {
  let requests = [];
  let reports = [];

  if (isFirebaseConfigured && db) {
    const [reqSnap, repSnap] = await Promise.all([
      getDocs(query(collection(db, 'recoveryRequests'), orderBy('updatedAt', 'desc'))),
      getDocs(collection(db, 'reports')),
    ]);
    requests = reqSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    reports = repSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } else {
    const state = loadDemoState();
    requests = [...state.recoveryRequests].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    reports = state.reports;
  }

  const reportMap = new Map(reports.map((r) => [r.id, r]));

  return requests
    .filter((req) => {
      if (isAdmin) return true;
      return req.ownerId === userId || req.finderId === userId;
    })
    .map((req) => ({
      ...req,
      lostReport: reportMap.get(req.lostReportId) || null,
      foundReport: reportMap.get(req.foundReportId) || null,
      requiresSecurityOffice: SENSITIVE_CATEGORIES.includes(req.category),
    }));
}

/**
 * TRUSTLOOP STEP 1: Owner sends recovery request from a potential AI match.
 */
export async function createRecoveryRequest({
  matchId,
  lostReport,
  foundReport,
  owner,
  claimNote = '',
}) {
  if (!owner?.uid) throw new Error('Sign in required to send a recovery request.');
  if (!lostReport || !foundReport) throw new Error('Missing report pair.');
  if (lostReport.reporterId !== owner.uid) {
    throw new Error('Only the owner of the lost item report can initiate recovery.');
  }

  const now = new Date().toISOString();
  const reqId = `RQ${Math.floor(1500 + Math.random() * 8400)}`;
  const payload = {
    matchId,
    lostReportId: lostReport.id,
    foundReportId: foundReport.id,
    itemName: lostReport.itemName,
    photoUrl: foundReport.photoUrl || lostReport.photoUrl || '',
    category: lostReport.category,
    ownerId: owner.uid,
    ownerName: owner.name || lostReport.reporterName,
    finderId: foundReport.reporterId,
    finderName: foundReport.reporterName,
    status: RECOVERY_STATUS.PENDING,
    claimNote: claimNote.trim(),
    adminAssistanceRequested: SENSITIVE_CATEGORIES.includes(lostReport.category),
    meeting: {
      location: SENSITIVE_CATEGORIES.includes(lostReport.category)
        ? 'College Security Office'
        : 'Main Reception',
      date: '',
      time: '',
      proposedBy: null,
      confirmedByOwner: false,
      confirmedByFinder: false,
    },
    verification: {
      ownerSubmittedDetails: '',
      submittedAt: null,
      finderVerified: false,
      adminVerified: false,
      handoverConfirmedByOwner: false,
      handoverConfirmedByFinder: false,
    },
    messages: claimNote.trim()
      ? [
          {
            id: `msg_${Date.now()}`,
            senderId: owner.uid,
            senderName: owner.name,
            senderRole: 'student',
            text: claimNote.trim(),
            createdAt: now,
          },
        ]
      : [],
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    const existingSnap = await getDocs(collection(db, 'recoveryRequests'));
    const duplicate = existingSnap.docs
      .map((d) => d.data())
      .find((r) => r.matchId === matchId && r.status !== RECOVERY_STATUS.REJECTED);
    if (duplicate) throw new Error('A recovery request already exists for this match.');

    const ref = await addDoc(collection(db, 'recoveryRequests'), payload);
    payload.id = ref.id;
    await updateDoc(doc(db, 'reports', foundReport.id), {
      status: REPORT_STATUS.IN_REVIEW,
      updatedAt: now,
    });
  } else {
    const state = loadDemoState();
    const duplicate = state.recoveryRequests.find(
      (r) => r.matchId === matchId && r.status !== RECOVERY_STATUS.REJECTED
    );
    if (duplicate) throw new Error('A recovery request already exists for this match.');

    payload.id = reqId;
    state.recoveryRequests.unshift(payload);
    const fIdx = state.reports.findIndex((r) => r.id === foundReport.id);
    if (fIdx !== -1 && state.reports[fIdx].status === REPORT_STATUS.AVAILABLE) {
      state.reports[fIdx].status = REPORT_STATUS.IN_REVIEW;
    }
    saveDemoState(state);
  }

  await createNotification({
    userId: foundReport.reporterId,
    title: `New recovery request for ${foundReport.itemName}`,
    message: `${owner.name} requested TrustLoop recovery. Review and accept, reject, or involve Campus Security.`,
    type: 'recovery',
    link: '/student/recovery-requests',
  });

  return payload;
}

/**
 * TRUSTLOOP STEP 2: Finder accepts, rejects, or requests Campus Security assistance.
 */
export async function respondToRecoveryRequest(requestId, { decision, note = '', actor }) {
  if (!['ACCEPT', 'REJECT', 'ADMIN_ASSISTANCE'].includes(decision)) {
    throw new Error('Invalid decision.');
  }

  const now = new Date().toISOString();
  let updated = null;

  const computePatch = (req) => {
    if (req.finderId !== actor.uid && actor.role !== 'admin') {
      throw new Error('Only the finder or an administrator can respond to this request.');
    }

    const nextStatus =
      decision === 'ACCEPT'
        ? RECOVERY_STATUS.ACCEPTED
        : decision === 'ADMIN_ASSISTANCE'
          ? RECOVERY_STATUS.ADMIN_ASSISTANCE
          : RECOVERY_STATUS.REJECTED;

    const messages = [...(req.messages || [])];
    if (note.trim()) {
      messages.push({
        id: `msg_${Date.now()}`,
        senderId: actor.uid,
        senderName: actor.name,
        senderRole: actor.role,
        text: note.trim(),
        createdAt: now,
      });
    }

    return {
      status: nextStatus,
      adminAssistanceRequested:
        decision === 'ADMIN_ASSISTANCE' ? true : req.adminAssistanceRequested,
      messages,
      updatedAt: now,
    };
  };

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'recoveryRequests', requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Recovery request not found.');
    const req = { id: snap.id, ...snap.data() };
    const patch = computePatch(req);
    await updateDoc(ref, patch);
    updated = { ...req, ...patch };
  } else {
    const state = loadDemoState();
    const idx = state.recoveryRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error('Recovery request not found.');
    const patch = computePatch(state.recoveryRequests[idx]);
    state.recoveryRequests[idx] = { ...state.recoveryRequests[idx], ...patch };
    updated = state.recoveryRequests[idx];
    saveDemoState(state);
  }

  await createNotification({
    userId: updated.ownerId,
    title:
      decision === 'ACCEPT'
        ? `Recovery accepted for ${updated.itemName}`
        : decision === 'ADMIN_ASSISTANCE'
          ? `Admin supervision requested for ${updated.itemName}`
          : `Recovery request declined for ${updated.itemName}`,
    message:
      decision === 'REJECT'
        ? note || 'The finder indicated this item does not match.'
        : 'Proceed to schedule your campus handover meeting in TrustLoop.',
    type: 'recovery',
    link: '/student/recovery-requests',
  });

  if (decision === 'ADMIN_ASSISTANCE') {
    await appendAuditLog({
      actor,
      action: 'ADMIN_ASSISTANCE_REQUESTED',
      targetId: requestId,
      details: `Supervised handover requested for ${updated.itemName}.`,
    });
  }

  return updated;
}

/**
 * TRUSTLOOP STEP 3: Schedule & agree on handover meeting location, date, and time.
 */
export async function scheduleRecoveryMeeting(
  requestId,
  { location, date, time, actor }
) {
  if (!location || !date || !time) {
    throw new Error('Please provide meeting location, date, and time.');
  }

  const now = new Date().toISOString();
  let updated = null;

  const computePatch = (req) => {
    const isParticipant =
      req.ownerId === actor.uid || req.finderId === actor.uid || actor.role === 'admin';
    if (!isParticipant) throw new Error('Not authorized to schedule this handover.');

    const isOwner = req.ownerId === actor.uid;
    const isFinder = req.finderId === actor.uid;

    const meeting = {
      location,
      date,
      time,
      proposedBy: actor.uid,
      confirmedByOwner: isOwner ? true : req.meeting?.proposedBy === actor.uid ? req.meeting.confirmedByOwner : false,
      confirmedByFinder: isFinder ? true : req.meeting?.proposedBy === actor.uid ? req.meeting.confirmedByFinder : false,
    };

    if (actor.role === 'admin') {
      meeting.confirmedByOwner = true;
      meeting.confirmedByFinder = true;
    }

    const messages = [
      ...(req.messages || []),
      {
        id: `msg_${Date.now()}`,
        senderId: actor.uid,
        senderName: actor.name,
        senderRole: actor.role,
        text: `Scheduled handover meeting: ${location} on ${date} at ${time}.`,
        createdAt: now,
      },
    ];

    return {
      status: RECOVERY_STATUS.MEETING_SCHEDULED,
      meeting,
      messages,
      updatedAt: now,
    };
  };

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'recoveryRequests', requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Recovery request not found.');
    const req = { id: snap.id, ...snap.data() };
    const patch = computePatch(req);
    await updateDoc(ref, patch);
    updated = { ...req, ...patch };
  } else {
    const state = loadDemoState();
    const idx = state.recoveryRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error('Recovery request not found.');
    const patch = computePatch(state.recoveryRequests[idx]);
    state.recoveryRequests[idx] = { ...state.recoveryRequests[idx], ...patch };
    updated = state.recoveryRequests[idx];
    saveDemoState(state);
  }

  const recipientId = actor.uid === updated.ownerId ? updated.finderId : updated.ownerId;
  await createNotification({
    userId: recipientId,
    title: `Handover meeting scheduled (${updated.itemName})`,
    message: `${location} on ${date} at ${time}. Open TrustLoop to confirm.`,
    type: 'recovery',
    link: '/student/recovery-requests',
  });

  return updated;
}

/**
 * Controlled in-app TrustLoop messaging between owner, finder, and admin.
 */
export async function sendRecoveryMessage(requestId, { text, actor }) {
  if (!text?.trim()) throw new Error('Message cannot be empty.');
  const now = new Date().toISOString();

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    senderId: actor.uid,
    senderName: actor.name,
    senderRole: actor.role,
    text: text.trim(),
    createdAt: now,
  };

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'recoveryRequests', requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Recovery request not found.');
    const req = snap.data();
    if (req.ownerId !== actor.uid && req.finderId !== actor.uid && actor.role !== 'admin') {
      throw new Error('Unauthorized thread access.');
    }
    const messages = [...(req.messages || []), newMessage];
    await updateDoc(ref, { messages, updatedAt: now });
    return { id: snap.id, ...req, messages, updatedAt: now };
  }

  const state = loadDemoState();
  const idx = state.recoveryRequests.findIndex((r) => r.id === requestId);
  if (idx === -1) throw new Error('Recovery request not found.');
  const req = state.recoveryRequests[idx];
  if (req.ownerId !== actor.uid && req.finderId !== actor.uid && actor.role !== 'admin') {
    throw new Error('Unauthorized thread access.');
  }
  req.messages = [...(req.messages || []), newMessage];
  req.updatedAt = now;
  saveDemoState(state);
  return req;
}

/**
 * TRUSTLOOP STEP 4A: Owner submits private identifying proof not displayed publicly.
 */
export async function submitVerificationDetails(requestId, { details, actor }) {
  if (!details?.trim()) {
    throw new Error('Please describe private identifying marks, serial numbers, or contents.');
  }

  const now = new Date().toISOString();
  let updated = null;

  const computePatch = (req) => {
    if (req.ownerId !== actor.uid) {
      throw new Error('Only the claiming owner can submit private verification details.');
    }
    return {
      status: RECOVERY_STATUS.VERIFICATION_SUBMITTED,
      verification: {
        ...req.verification,
        ownerSubmittedDetails: details.trim(),
        submittedAt: now,
      },
      updatedAt: now,
    };
  };

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'recoveryRequests', requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Recovery request not found.');
    const req = { id: snap.id, ...snap.data() };
    const patch = computePatch(req);
    await updateDoc(ref, patch);
    updated = { ...req, ...patch };
  } else {
    const state = loadDemoState();
    const idx = state.recoveryRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error('Recovery request not found.');
    const patch = computePatch(state.recoveryRequests[idx]);
    state.recoveryRequests[idx] = { ...state.recoveryRequests[idx], ...patch };
    updated = state.recoveryRequests[idx];
    saveDemoState(state);
  }

  await createNotification({
    userId: updated.finderId,
    title: `Ownership proof submitted for ${updated.itemName}`,
    message: 'Review the private details and confirm physical verification at handover.',
    type: 'verification',
    link: '/student/recovery-requests',
  });

  return updated;
}

/**
 * TRUSTLOOP STEP 4B: In-person verification & final handover confirmation.
 */
export async function verifyAndConfirmHandover(requestId, { actor, adminNote = '' }) {
  const now = new Date().toISOString();
  let updated = null;

  const computePatch = (req) => {
    const isOwner = req.ownerId === actor.uid;
    const isFinder = req.finderId === actor.uid;
    const isAdmin = actor.role === 'admin';

    if (!isOwner && !isFinder && !isAdmin) {
      throw new Error('Unauthorized handover action.');
    }

    const verification = { ...req.verification };
    if (isFinder) {
      verification.finderVerified = true;
      verification.handoverConfirmedByFinder = true;
    }
    if (isOwner) {
      verification.handoverConfirmedByOwner = true;
    }
    if (isAdmin) {
      verification.adminVerified = true;
      if (adminNote.trim()) {
        verification.adminNote = adminNote.trim();
      }
    }

    const verified = verification.finderVerified || verification.adminVerified;
    const handedOver =
      (verification.handoverConfirmedByOwner && verification.handoverConfirmedByFinder) ||
      (verification.adminVerified && verification.handoverConfirmedByOwner) ||
      (isAdmin && verification.adminVerified && req.adminAssistanceRequested);

    const isCompleted = Boolean(verified && handedOver);

    return {
      status: isCompleted ? RECOVERY_STATUS.COMPLETED : req.status,
      verification,
      completedAt: isCompleted ? now : req.completedAt || null,
      updatedAt: now,
      isCompleted,
    };
  };

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'recoveryRequests', requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Recovery request not found.');
    const req = { id: snap.id, ...snap.data() };
    const { isCompleted, ...patch } = computePatch(req);
    await updateDoc(ref, patch);
    updated = { ...req, ...patch };

    if (isCompleted) {
      await Promise.all([
        updateDoc(doc(db, 'reports', req.lostReportId), {
          status: REPORT_STATUS.RETURNED,
          updatedAt: now,
        }),
        updateDoc(doc(db, 'reports', req.foundReportId), {
          status: REPORT_STATUS.RETURNED,
          heldBySecurity: false,
          updatedAt: now,
        }),
      ]);
    }
  } else {
    const state = loadDemoState();
    const idx = state.recoveryRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error('Recovery request not found.');
    const { isCompleted, ...patch } = computePatch(state.recoveryRequests[idx]);
    state.recoveryRequests[idx] = { ...state.recoveryRequests[idx], ...patch };
    updated = state.recoveryRequests[idx];

    if (isCompleted) {
      state.reports.forEach((rep) => {
        if (rep.id === updated.lostReportId || rep.id === updated.foundReportId) {
          rep.status = REPORT_STATUS.RETURNED;
          rep.heldBySecurity = false;
          rep.updatedAt = now;
        }
      });
    }
    saveDemoState(state);
  }

  if (updated.status === RECOVERY_STATUS.COMPLETED) {
    await appendAuditLog({
      actor,
      action: 'HANDOVER_COMPLETED',
      targetId: requestId,
      details: `Completed TrustLoop return for ${updated.itemName}.`,
    });

    await Promise.all([
      createNotification({
        userId: updated.ownerId,
        title: `Item Returned: ${updated.itemName}`,
        message: 'Handover confirmed! Thank you for closing the TrustLoop.',
        type: 'success',
        link: '/student/recovery-requests',
      }),
      createNotification({
        userId: updated.finderId,
        title: `Return Confirmed: ${updated.itemName}`,
        message: 'Thank you for helping return a campus belonging safely!',
        type: 'success',
        link: '/student/recovery-requests',
      }),
    ]);
  }

  return updated;
}
