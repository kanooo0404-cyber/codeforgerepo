import {
  CATEGORY_RELATIONS,
  DEFAULT_MATCHING_CONFIG,
  LOCATION_PROXIMITY_MAP,
} from '../config/matchingConfig.js';
import { REPORT_STATUS } from '../config/constants.js';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'were', 'be', 'been', 'it',
  'its', 'this', 'that', 'my', 'i', 'me', 'lost', 'found', 'item', 'near',
  'around', 'inside', 'outside', 'someone', 'please', 'left', 'dropped', 'very',
  'some', 'one', 'two', 'has', 'have', 'had',
]);

const SYNONYM_MAP = {
  earphone: 'earbuds',
  earphones: 'earbuds',
  earbud: 'earbuds',
  airpod: 'earbuds',
  airpods: 'earbuds',
  headphone: 'headphones',
  headphones: 'headphones',
  buds: 'earbuds',
  purse: 'wallet',
  wallets: 'wallet',
  cardholder: 'wallet',
  flask: 'bottle',
  thermos: 'bottle',
  bottles: 'bottle',
  tumbler: 'bottle',
  calc: 'calculator',
  casio: 'calculator',
  id: 'idcard',
  badge: 'idcard',
  lanyard: 'idcard',
  spectacles: 'glasses',
  eyeglasses: 'glasses',
  specs: 'glasses',
  backpack: 'bag',
  rucksack: 'bag',
  handbag: 'bag',
  satchel: 'bag',
  notebook: 'book',
  textbook: 'book',
  notes: 'book',
  keys: 'key',
  keychain: 'key',
  keyring: 'key',
  adapter: 'charger',
  cable: 'charger',
};

const INELIGIBLE_STATUSES = new Set([
  REPORT_STATUS.RETURNED,
  REPORT_STATUS.CLOSED,
  REPORT_STATUS.REJECTED,
  REPORT_STATUS.REMOVED,
]);

export function clamp01(value) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function normalizeToken(word) {
  let clean = word.toLowerCase().trim();
  if (clean.length > 4 && clean.endsWith('ing')) {
    clean = clean.slice(0, -3);
  } else if (clean.length > 3 && clean.endsWith('es') && !SYNONYM_MAP[clean]) {
    clean = clean.slice(0, -2);
  } else if (clean.length > 3 && clean.endsWith('s') && !SYNONYM_MAP[clean]) {
    clean = clean.slice(0, -1);
  }
  return SYNONYM_MAP[clean] || clean;
}

export function tokenizeText(text = '') {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .map(normalizeToken);

  return Array.from(new Set(cleaned));
}

export function computeDescriptionSimilarity(lostReport, foundReport) {
  const lostText = [
    lostReport.itemName || '',
    lostReport.description || '',
    lostReport.colour || '',
  ].join(' ');
  const foundText = [
    foundReport.itemName || '',
    foundReport.description || '',
    foundReport.colour || '',
  ].join(' ');

  const lostTokens = tokenizeText(lostText);
  const foundTokens = tokenizeText(foundText);

  if (lostTokens.length === 0 || foundTokens.length === 0) {
    return { score: 0, matchedTerms: [], colourMatched: false };
  }

  const foundSet = new Set(foundTokens);
  const matchedTerms = lostTokens.filter((token) => foundSet.has(token));

  // Overlap coefficient blended with Dice coefficient so concise vs detailed descriptions still score fairly
  const dice = (2 * matchedTerms.length) / (lostTokens.length + foundTokens.length);
  const overlap = matchedTerms.length / Math.min(lostTokens.length, foundTokens.length);
  let score = dice * 0.55 + overlap * 0.45;

  const lostColour = (lostReport.colour || '').toLowerCase().trim();
  const foundColour = (foundReport.colour || '').toLowerCase().trim();
  const colourMatched = Boolean(
    lostColour && foundColour && lostColour !== 'other' && lostColour === foundColour
  );

  if (colourMatched) {
    score = Math.min(1, score + 0.12);
  } else if (
    lostColour &&
    foundColour &&
    lostColour !== 'other' &&
    foundColour !== 'other' &&
    lostColour !== foundColour
  ) {
    score = Math.max(0, score - 0.12);
  }

  return {
    score: clamp01(score),
    matchedTerms,
    colourMatched,
  };
}

export function computeCategorySimilarity(catA = '', catB = '') {
  if (!catA || !catB) return 0;
  if (catA === catB) return 1;
  const related = CATEGORY_RELATIONS[catA] || [];
  if (related.includes(catB)) return 0.45;
  return 0.05;
}

export function computeLocationSimilarity(locA = '', locB = '') {
  if (!locA || !locB) return 0;
  if (locA === locB) return 1;
  const nearby = LOCATION_PROXIMITY_MAP[locA] || [];
  if (nearby.includes(locB)) return 0.6;
  if (locA === 'Other' || locB === 'Other') return 0.3;
  return 0.15;
}

export function computeDateSimilarity(dateA, dateB) {
  if (!dateA || !dateB) return 0.5;
  const timeA = new Date(dateA).getTime();
  const timeB = new Date(dateB).getTime();
  if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0.5;

  const diffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);
  if (diffDays <= 0.5) return 1;
  if (diffDays <= 1.5) return 0.9;
  if (diffDays <= 3) return 0.75;
  if (diffDays <= 5) return 0.55;
  if (diffDays <= 7) return 0.4;
  if (diffDays <= 14) return 0.2;
  return 0.05;
}

export function getMatchTier(score, thresholds = DEFAULT_MATCHING_CONFIG.thresholds) {
  if (score >= thresholds.high) return 'HIGH';
  if (score >= thresholds.medium) return 'MEDIUM';
  if (score >= thresholds.low) return 'LOW';
  return 'HIDDEN';
}

export function isReportEligibleForMatching(report) {
  if (!report || !report.id) return false;
  return !INELIGIBLE_STATUSES.has(report.status);
}

export function scoreReportPair(
  lostReport,
  foundReport,
  config = DEFAULT_MATCHING_CONFIG,
  semanticOverride = null
) {
  const weights = config?.weights || DEFAULT_MATCHING_CONFIG.weights;
  const thresholds = config?.thresholds || DEFAULT_MATCHING_CONFIG.thresholds;

  const descResult = computeDescriptionSimilarity(lostReport, foundReport);
  const descScore =
    typeof semanticOverride?.score === 'number'
      ? clamp01(descResult.score * 0.5 + clamp01(semanticOverride.score) * 0.5)
      : descResult.score;

  const catScore = computeCategorySimilarity(lostReport.category, foundReport.category);
  const locScore = computeLocationSimilarity(lostReport.location, foundReport.location);
  const dateScore = computeDateSimilarity(lostReport.date, foundReport.date);

  const rawWeighted =
    descScore * weights.description +
    catScore * weights.category +
    locScore * weights.location +
    dateScore * weights.date;

  const finalScore = Math.round(clamp01(rawWeighted) * 100);
  const tier = getMatchTier(finalScore, thresholds);

  const reasons = [];
  if (descResult.matchedTerms.length > 0) {
    reasons.push(`Matching terms: ${descResult.matchedTerms.slice(0, 5).join(', ')}`);
  }
  if (descResult.colourMatched) {
    reasons.push(`Same colour (${lostReport.colour})`);
  }
  if (catScore === 1) {
    reasons.push(`Exact category (${lostReport.category})`);
  } else if (catScore >= 0.4) {
    reasons.push(`Related categories (${lostReport.category} / ${foundReport.category})`);
  }
  if (locScore === 1) {
    reasons.push(`Same campus location (${lostReport.location})`);
  } else if (locScore >= 0.5) {
    reasons.push(`Nearby campus areas (${lostReport.location} ↔ ${foundReport.location})`);
  }
  if (dateScore >= 0.9) {
    reasons.push('Reported within 24 hours of each other');
  } else if (dateScore >= 0.7) {
    reasons.push('Reported within a few days');
  }
  if (semanticOverride?.reason) {
    reasons.push(`Gemini insight: ${semanticOverride.reason}`);
  }

  return {
    matchKey: `${lostReport.id}__${foundReport.id}`,
    lostReportId: lostReport.id,
    foundReportId: foundReport.id,
    score: finalScore,
    tier,
    usedGemini: Boolean(semanticOverride),
    breakdown: {
      description: Math.round(descScore * 100),
      category: Math.round(catScore * 100),
      location: Math.round(locScore * 100),
      date: Math.round(dateScore * 100),
    },
    matchedTerms: descResult.matchedTerms,
    reasons,
  };
}

export function findCandidateMatchesForReport(
  targetReport,
  allReports,
  config = DEFAULT_MATCHING_CONFIG
) {
  if (!isReportEligibleForMatching(targetReport)) return [];

  const oppositeType = targetReport.type === 'lost' ? 'found' : 'lost';
  const candidates = allReports.filter(
    (r) =>
      r.type === oppositeType &&
      r.id !== targetReport.id &&
      r.reporterId !== targetReport.reporterId &&
      isReportEligibleForMatching(r)
  );

  const minDisplayThreshold = config?.thresholds?.low ?? 40;
  const results = [];

  for (const candidate of candidates) {
    const lostReport = targetReport.type === 'lost' ? targetReport : candidate;
    const foundReport = targetReport.type === 'found' ? targetReport : candidate;
    const scored = scoreReportPair(lostReport, foundReport, config);
    if (scored.score >= minDisplayThreshold) {
      results.push(scored);
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
