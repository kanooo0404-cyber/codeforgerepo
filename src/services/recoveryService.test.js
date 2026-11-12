import { beforeEach, describe, expect, it } from 'vitest';
import { resetDemoState, loadDemoState } from '../data/localStore.js';
import { registerStudent } from '../services/authService.js';
import { createReport, sanitizeReportForViewer } from '../services/reportService.js';
import {
  createRecoveryRequest,
  respondToRecoveryRequest,
  scheduleRecoveryMeeting,
  sendRecoveryMessage,
  submitVerificationDetails,
  verifyAndConfirmHandover,
} from '../services/recoveryService.js';
import { RECOVERY_STATUS, REPORT_STATUS } from '../config/constants.js';

describe('FoundIt Security, Privacy & TrustLoop Workflow', () => {
  beforeEach(() => {
    resetDemoState();
  });

  it('always assigns student role on public registration regardless of payload', async () => {
    const user = await registerStudent({
      name: 'Test Student',
      email: 'newstudent@campus.edu',
      password: 'password123',
      studentId: 'CS999',
      department: 'CSE',
      role: 'admin',
    });
    expect(user.role).toBe('student');
  });

  it('redacts private identifying details and masks numbers for public viewers', () => {
    const sensitiveReport = {
      id: 'rep_test',
      type: 'found',
      category: 'Documents / ID Cards',
      description: 'Found ID card number 20249981 near Auditorium.',
      reporterId: 'finder_1',
      reporterName: 'Kunal Verma',
    };

    const publicView = sanitizeReportForViewer(
      sensitiveReport,
      null,
      'Roll number 20249981 Belongs to Meera'
    );
    expect(publicView.privateDetails).toBeUndefined();
    expect(publicView.canViewPrivateDetails).toBe(false);
    expect(publicView.description).not.toContain('20249981');
    expect(publicView.sensitiveNotice).toBeTruthy();

    const adminView = sanitizeReportForViewer(
      sensitiveReport,
      { uid: 'admin_1', role: 'admin' },
      'Roll number 20249981 Belongs to Meera'
    );
    expect(adminView.canViewPrivateDetails).toBe(true);
    expect(adminView.privateDetails).toContain('Meera');
  });

  it('executes complete 4-step TrustLoop flow and marks both reports RETURNED', async () => {
    const owner = { uid: 'owner_1', name: 'Owner One', role: 'student' };
    const finder = { uid: 'finder_1', name: 'Finder Two', role: 'student' };

    const { report: lostRep } = await createReport({
      type: 'lost',
      itemName: 'Silver Casio Watch',
      category: 'Accessories',
      description: 'Silver stainless steel analog watch lost near Library steps',
      colour: 'Silver',
      location: 'Library',
      date: '2026-11-12',
      privateDetails: 'Engraved "12-08" on back clasp',
      reporter: owner,
    });

    const { report: foundRep } = await createReport({
      type: 'found',
      itemName: 'Silver Analog Watch',
      category: 'Accessories',
      description: 'Found silver steel analog watch near Library entrance',
      colour: 'Silver',
      location: 'Library',
      date: '2026-11-12',
      privateDetails: 'Back clasp says 12-08',
      reporter: finder,
    });

    const stateAfterMatch = loadDemoState();
    const matched = stateAfterMatch.matches.find(
      (m) => m.lostReportId === lostRep.id && m.foundReportId === foundRep.id
    );
    expect(matched).toBeTruthy();
    expect(matched.score).toBeGreaterThanOrEqual(75);

    // Step 1: Owner sends recovery request
    const req = await createRecoveryRequest({
      matchId: matched.id,
      lostReport: lostRep,
      foundReport: foundRep,
      owner,
      claimNote: 'I dropped it walking out of the library.',
    });
    expect(req.status).toBe(RECOVERY_STATUS.PENDING);

    // Step 2: Finder accepts
    const accepted = await respondToRecoveryRequest(req.id, {
      decision: 'ACCEPT',
      note: 'Happy to return it!',
      actor: finder,
    });
    expect(accepted.status).toBe(RECOVERY_STATUS.ACCEPTED);

    // Step 3: Schedule meeting & exchange controlled message
    const scheduled = await scheduleRecoveryMeeting(req.id, {
      location: 'College Security Office',
      date: '2026-11-13',
      time: '15:00',
      actor: finder,
    });
    expect(scheduled.status).toBe(RECOVERY_STATUS.MEETING_SCHEDULED);

    const messaged = await sendRecoveryMessage(req.id, {
      text: 'See you at 3 PM!',
      actor: owner,
    });
    expect(messaged.messages.some((m) => m.text === 'See you at 3 PM!')).toBe(true);

    // Step 4: Owner submits private proof, finder verifies, owner confirms handover
    const verifiedSubmitted = await submitVerificationDetails(req.id, {
      details: 'Engraved 12-08 on the back clasp.',
      actor: owner,
    });
    expect(verifiedSubmitted.status).toBe(RECOVERY_STATUS.VERIFICATION_SUBMITTED);

    await verifyAndConfirmHandover(req.id, { actor: finder });
    const completed = await verifyAndConfirmHandover(req.id, { actor: owner });
    expect(completed.status).toBe(RECOVERY_STATUS.COMPLETED);

    const finalState = loadDemoState();
    const finalLost = finalState.reports.find((r) => r.id === lostRep.id);
    const finalFound = finalState.reports.find((r) => r.id === foundRep.id);
    expect(finalLost.status).toBe(REPORT_STATUS.RETURNED);
    expect(finalFound.status).toBe(REPORT_STATUS.RETURNED);
  });
});
