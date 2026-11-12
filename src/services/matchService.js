import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import { DEFAULT_MATCHING_CONFIG } from '../config/matchingConfig.js';
import { REPORT_STATUS } from '../config/constants.js';
import {
  findCandidateMatchesForReport,
  isReportEligibleForMatching,
  scoreReportPair,
} from '../ai/matchingEngine.js';
import { getGeminiSemanticSimilarity } from '../ai/geminiEnhancer.js';
import { loadDemoState, saveDemoState } from '../data/localStore.js';
import { createNotification } from './notificationService.js';

export async function getMatchingConfig() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'adminSettings', 'matching'));
      if (snap.exists() && snap.data().matchingConfig) {
        return snap.data().matchingConfig;
      }
    } catch {
      // Fallback to defaults if rules restrict or doc missing
    }
    return DEFAULT_MATCHING_CONFIG;
  }
  const state = loadDemoState();
  return state.adminSettings?.matchingConfig || DEFAULT_MATCHING_CONFIG;
}

export async function runMatchingForReport(targetReport, allReportsArg = null) {
  if (!isReportEligibleForMatching(targetReport)) return [];

  const config = await getMatchingConfig();
  let allReports = allReportsArg;
  let existingMatches = [];

  if (isFirebaseConfigured && db) {
    if (!allReports) {
      const repSnap = await getDocs(collection(db, 'reports'));
      allReports = repSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    const matchSnap = await getDocs(collection(db, 'matches'));
    existingMatches = matchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } else {
    const state = loadDemoState();
    if (!allReports) allReports = state.reports;
    existingMatches = state.matches;
  }

  const candidateMatches = findCandidateMatchesForReport(targetReport, allReports, config);
  const existingKeys = new Set(existingMatches.map((m) => m.matchKey));
  const createdOrUpdated = [];

  for (let i = 0; i < candidateMatches.length; i++) {
    let scored = candidateMatches[i];
    if (existingKeys.has(scored.matchKey)) continue;

    const lostReport = allReports.find((r) => r.id === scored.lostReportId);
    const foundReport = allReports.find((r) => r.id === scored.foundReportId);
    if (!lostReport || !foundReport) continue;

    // Optional Gemini semantic boost for top 3 candidates when configured
    if (config.useGeminiWhenAvailable && i < 3) {
      const semantic = await getGeminiSemanticSimilarity(lostReport, foundReport);
      if (semantic) {
        scored = scoreReportPair(lostReport, foundReport, config, semantic);
      }
    }

    const matchRecord = {
      ...scored,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      const ref = await addDoc(collection(db, 'matches'), matchRecord);
      matchRecord.id = ref.id;
      if (scored.score >= (config.thresholds?.medium ?? 60)) {
        if (lostReport.status === REPORT_STATUS.ACTIVE) {
          await updateDoc(doc(db, 'reports', lostReport.id), { status: REPORT_STATUS.MATCH_FOUND });
        }
      }
    } else {
      const state = loadDemoState();
      matchRecord.id = `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      state.matches.unshift(matchRecord);

      if (scored.score >= (config.thresholds?.medium ?? 60)) {
        const lostIdx = state.reports.findIndex((r) => r.id === lostReport.id);
        if (lostIdx !== -1 && state.reports[lostIdx].status === REPORT_STATUS.ACTIVE) {
          state.reports[lostIdx].status = REPORT_STATUS.MATCH_FOUND;
        }
      }
      saveDemoState(state);
    }

    createdOrUpdated.push(matchRecord);

    // Notify both parties when match score meets medium or high threshold
    if (scored.score >= (config.thresholds?.medium ?? 60)) {
      await createNotification({
        userId: lostReport.reporterId,
        title: `Potential match found (${scored.score}%)`,
        message: `SmartFind AI matched "${lostReport.itemName}" with a found report near ${foundReport.location}.`,
        type: 'match',
        link: '/student/matches',
      });
      await createNotification({
        userId: foundReport.reporterId,
        title: `Possible owner report (${scored.score}%)`,
        message: `A student lost "${lostReport.itemName}" matching your found report.`,
        type: 'match',
        link: '/student/matches',
      });
    }
  }

  return createdOrUpdated;
}

export async function recalculateAllMatches() {
  const config = await getMatchingConfig();
  let allReports = [];
  let existingMatches = [];

  if (isFirebaseConfigured && db) {
    const repSnap = await getDocs(collection(db, 'reports'));
    allReports = repSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const matchSnap = await getDocs(collection(db, 'matches'));
    existingMatches = matchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } else {
    const state = loadDemoState();
    allReports = state.reports;
    existingMatches = state.matches;
  }

  const existingMap = new Map(existingMatches.map((m) => [m.matchKey, m]));
  const lostReports = allReports.filter((r) => r.type === 'lost' && isReportEligibleForMatching(r));
  const foundReports = allReports.filter((r) => r.type === 'found' && isReportEligibleForMatching(r));

  let createdCount = 0;
  let updatedCount = 0;

  for (const lost of lostReports) {
    for (const found of foundReports) {
      if (lost.reporterId === found.reporterId) continue;
      const scored = scoreReportPair(lost, found, config);
      if (scored.score < (config.thresholds?.low ?? 40)) continue;

      const existing = existingMap.get(scored.matchKey);
      if (existing) {
        updatedCount += 1;
        if (isFirebaseConfigured && db) {
          await updateDoc(doc(db, 'matches', existing.id), {
            score: scored.score,
            tier: scored.tier,
            breakdown: scored.breakdown,
            reasons: scored.reasons,
          });
        } else {
          const state = loadDemoState();
          const idx = state.matches.findIndex((m) => m.id === existing.id);
          if (idx !== -1) {
            state.matches[idx] = { ...state.matches[idx], ...scored };
            saveDemoState(state);
          }
        }
      } else {
        createdCount += 1;
        const record = { ...scored, status: 'ACTIVE', createdAt: new Date().toISOString() };
        if (isFirebaseConfigured && db) {
          await addDoc(collection(db, 'matches'), record);
        } else {
          const state = loadDemoState();
          record.id = `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          state.matches.unshift(record);
          saveDemoState(state);
        }
      }
    }
  }

  return { createdCount, updatedCount };
}

export async function listHydratedMatches({ userId = null, isAdmin = false } = {}) {
  const config = await getMatchingConfig();
  const minThreshold = isAdmin ? 0 : (config.thresholds?.low ?? 40);

  let matches = [];
  let reports = [];
  let recoveryRequests = [];

  if (isFirebaseConfigured && db) {
    const [mSnap, rSnap, reqSnap] = await Promise.all([
      getDocs(collection(db, 'matches')),
      getDocs(collection(db, 'reports')),
      getDocs(collection(db, 'recoveryRequests')),
    ]);
    matches = mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    reports = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    recoveryRequests = reqSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } else {
    const state = loadDemoState();
    matches = state.matches;
    reports = state.reports;
    recoveryRequests = state.recoveryRequests;
  }

  const reportMap = new Map(reports.map((r) => [r.id, r]));

  return matches
    .map((m) => {
      const lostReport = reportMap.get(m.lostReportId);
      const foundReport = reportMap.get(m.foundReportId);
      if (!lostReport || !foundReport) return null;
      if (!isAdmin && (!isReportEligibleForMatching(lostReport) || !isReportEligibleForMatching(foundReport))) {
        return null;
      }
      if (!isAdmin && m.status === 'DISMISSED') return null;
      if (m.score < minThreshold) return null;

      if (userId && !isAdmin) {
        const involvesUser = lostReport.reporterId === userId || foundReport.reporterId === userId;
        if (!involvesUser) return null;
      }

      const activeRequest = recoveryRequests.find(
        (req) => req.matchId === m.id && req.status !== 'REJECTED'
      );

      return {
        ...m,
        lostReport,
        foundReport,
        activeRequest: activeRequest || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

export async function dismissMatch(matchId) {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'matches', matchId), { status: 'DISMISSED' });
    return;
  }
  const state = loadDemoState();
  const idx = state.matches.findIndex((m) => m.id === matchId);
  if (idx !== -1) {
    state.matches[idx].status = 'DISMISSED';
    saveDemoState(state);
  }
}
