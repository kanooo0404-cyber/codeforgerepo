import { describe, expect, it } from 'vitest';
import {
  computeCategorySimilarity,
  computeDateSimilarity,
  computeDescriptionSimilarity,
  computeLocationSimilarity,
  findCandidateMatchesForReport,
  getMatchTier,
  scoreReportPair,
  tokenizeText,
} from './matchingEngine.js';
import { REPORT_STATUS } from '../config/constants.js';

describe('SmartFind AI Matching Engine', () => {
  it('lowercases, removes punctuation/stopwords, and normalizes synonyms', () => {
    const tokens = tokenizeText('Lost my White AirPods! Inside the Library.');
    expect(tokens).toContain('white');
    expect(tokens).toContain('earbuds');
    expect(tokens).toContain('library');
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('my');
    expect(tokens).not.toContain('lost');
  });

  it('scores identical/high-similarity pairs >= 80 (HIGH tier)', () => {
    const today = new Date().toISOString().split('T')[0];
    const lost = {
      id: 'l1',
      type: 'lost',
      reporterId: 'u1',
      itemName: 'White Wireless Earbuds',
      description: 'Apple AirPods charging case dropped near 2nd floor reading table',
      category: 'Electronics',
      colour: 'White',
      location: 'Library',
      date: today,
      status: REPORT_STATUS.ACTIVE,
    };
    const found = {
      id: 'f1',
      type: 'found',
      reporterId: 'u2',
      itemName: 'White Earbuds Charging Case',
      description: 'Found white wireless earbuds case at 2nd floor reading desk in Library',
      category: 'Electronics',
      colour: 'White',
      location: 'Library',
      date: today,
      status: REPORT_STATUS.AVAILABLE,
    };

    const result = scoreReportPair(lost, found);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.tier).toBe('HIGH');
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.matchKey).toBe('l1__f1');
  });

  it('weights category, location proximity, and date decay accurately', () => {
    expect(computeCategorySimilarity('Electronics', 'Electronics')).toBe(1);
    expect(computeCategorySimilarity('Electronics', 'Accessories')).toBe(0.45);
    expect(computeCategorySimilarity('Electronics', 'Bottles')).toBe(0.05);

    expect(computeLocationSimilarity('Library', 'Library')).toBe(1);
    expect(computeLocationSimilarity('Library', 'Main Building')).toBe(0.6);
    expect(computeLocationSimilarity('Library', 'Hostel')).toBe(0.15);

    expect(computeDateSimilarity('2026-11-10', '2026-11-10')).toBe(1);
    expect(computeDateSimilarity('2026-11-10', '2026-11-12')).toBe(0.75);
    expect(computeDateSimilarity('2026-11-01', '2026-11-25')).toBe(0.05);
  });

  it('respects configurable thresholds and excludes closed/returned/same-reporter items', () => {
    const today = '2026-11-12';
    const target = {
      id: 'l_target',
      type: 'lost',
      reporterId: 'u1',
      itemName: 'Blue Water Bottle',
      description: 'Matte blue insulated steel water flask',
      category: 'Bottles',
      colour: 'Blue',
      location: 'Canteen',
      date: today,
      status: REPORT_STATUS.ACTIVE,
    };

    const pool = [
      {
        id: 'f_closed',
        type: 'found',
        reporterId: 'u2',
        itemName: 'Blue Water Bottle',
        description: 'Matte blue insulated water flask',
        category: 'Bottles',
        colour: 'Blue',
        location: 'Canteen',
        date: today,
        status: REPORT_STATUS.RETURNED,
      },
      {
        id: 'f_self',
        type: 'found',
        reporterId: 'u1',
        itemName: 'Blue Water Bottle',
        description: 'Matte blue insulated water flask',
        category: 'Bottles',
        colour: 'Blue',
        location: 'Canteen',
        date: today,
        status: REPORT_STATUS.AVAILABLE,
      },
      {
        id: 'f_valid',
        type: 'found',
        reporterId: 'u3',
        itemName: 'Blue Insulated Bottle',
        description: 'Royal blue steel bottle found in canteen',
        category: 'Bottles',
        colour: 'Blue',
        location: 'Canteen',
        date: today,
        status: REPORT_STATUS.AVAILABLE,
      },
    ];

    const matches = findCandidateMatchesForReport(target, pool);
    expect(matches).toHaveLength(1);
    expect(matches[0].foundReportId).toBe('f_valid');
    expect(getMatchTier(82)).toBe('HIGH');
    expect(getMatchTier(65)).toBe('MEDIUM');
    expect(getMatchTier(45)).toBe('LOW');
    expect(getMatchTier(39)).toBe('HIDDEN');
  });

  it('applies colour mismatch penalty in description similarity', () => {
    const descSame = computeDescriptionSimilarity(
      { itemName: 'Wallet', description: 'leather bi-fold wallet', colour: 'Black' },
      { itemName: 'Wallet', description: 'leather bi-fold wallet', colour: 'Black' }
    );
    const descDiff = computeDescriptionSimilarity(
      { itemName: 'Wallet', description: 'leather bi-fold wallet', colour: 'Black' },
      { itemName: 'Wallet', description: 'leather bi-fold wallet', colour: 'Red' }
    );
    expect(descSame.score).toBeGreaterThan(descDiff.score);
  });
});
