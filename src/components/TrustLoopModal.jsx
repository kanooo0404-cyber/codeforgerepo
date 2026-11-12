import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  MessageSquare,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  HANDOVER_LOCATIONS,
  RECOVERY_STATUS,
} from '../config/constants.js';
import { StatusBadge } from './StatusBadge.jsx';

const STEPS = [
  { key: 1, label: 'Request Sent' },
  { key: 2, label: 'Finder Review' },
  { key: 3, label: 'Meeting Scheduled' },
  { key: 4, label: 'Verified & Returned' },
];

function getStepIndex(status) {
  switch (status) {
    case RECOVERY_STATUS.PENDING:
      return 1;
    case RECOVERY_STATUS.ACCEPTED:
    case RECOVERY_STATUS.ADMIN_ASSISTANCE:
      return 2;
    case RECOVERY_STATUS.MEETING_SCHEDULED:
      return 3;
    case RECOVERY_STATUS.VERIFICATION_SUBMITTED:
    case RECOVERY_STATUS.COMPLETED:
      return 4;
    default:
      return 1;
  }
}

export function TrustLoopModal({
  request,
  currentUser,
  onClose,
  onRespond,
  onScheduleMeeting,
  onSendMessage,
  onSubmitVerification,
  onVerifyHandover,
}) {
  const [decisionNote, setDecisionNote] = useState('');
  const [meetingLoc, setMeetingLoc] = useState(
    request?.meeting?.location ||
      (request?.requiresSecurityOffice ? 'College Security Office' : 'Main Reception')
  );
  const [meetingDate, setMeetingDate] = useState(
    request?.meeting?.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [meetingTime, setMeetingTime] = useState(request?.meeting?.time || '14:00');
  const [chatText, setChatText] = useState('');
  const [proofText, setProofText] = useState(
    request?.verification?.ownerSubmittedDetails || ''
  );
  const [adminNote, setAdminNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (!request) return null;

  const isOwner = currentUser?.uid === request.ownerId;
  const isFinder = currentUser?.uid === request.finderId;
  const isAdmin = currentUser?.role === 'admin';
  const activeStep = getStepIndex(request.status);
  const isClosed =
    request.status === RECOVERY_STATUS.COMPLETED ||
    request.status === RECOVERY_STATUS.REJECTED;

  const runAction = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11183B]/60 backdrop-blur-sm">
      <div className="bg-[#F3F6F2] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-panel border border-white/40">
        {/* Top Modal Header */}
        <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            <img
              src={request.photoUrl}
              alt={request.itemName}
              className="w-12 h-12 rounded-2xl object-cover bg-[#F3F6F2] border border-slate-100"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#303BFA] bg-[#DDE2FF] px-2.5 py-0.5 rounded-full">
                  TrustLoop #{request.id}
                </span>
                <StatusBadge status={request.status} />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#11183B] mt-0.5">
                {request.itemName}
              </h3>
              <p className="text-xs text-slate-500">
                Owner: <strong className="text-[#11183B]">{request.ownerName}</strong> ↔ Finder:{' '}
                <strong className="text-[#11183B]">{request.finderName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
            aria-label="Close TrustLoop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 4-Step TrustLoop Progress Stepper */}
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STEPS.map((step) => {
                const done =
                  request.status === RECOVERY_STATUS.COMPLETED || activeStep > step.key;
                const current = activeStep === step.key && request.status !== RECOVERY_STATUS.COMPLETED;
                return (
                  <div
                    key={step.key}
                    className={`rounded-xl px-3 py-2.5 border transition ${
                      done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : current
                          ? 'bg-[#DDE2FF]/60 border-[#303BFA]/30 text-[#11183B]'
                          : 'bg-[#F8F9FA] border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      Step {step.key}
                    </div>
                    <div className="text-xs font-semibold mt-0.5">{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {request.requiresSecurityOffice && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
              <ShieldAlert className="w-4 h-4 text-[#303BFA] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Supervised Security-Office Handover Recommended</p>
                <p className="mt-0.5 text-indigo-900/80">
                  Because this item falls under a sensitive or high-value category ({request.category}), TrustLoop recommends completing verification and handover at the College Security Office.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Workflow Actions */}
            <div className="lg:col-span-7 space-y-5">
              {/* STEP 2: Finder / Admin Review */}
              {request.status === RECOVERY_STATUS.PENDING && (isFinder || isAdmin) && (
                <div className="bg-white rounded-2xl p-5 shadow-card space-y-3 border border-[#DDE2FF]">
                  <h4 className="font-heading font-bold text-[#11183B] text-base">
                    Step 2: Review Recovery Request
                  </h4>
                  <p className="text-xs text-slate-600">
                    Accept if the owner’s note sounds plausible, request Campus Security assistance for a supervised handover, or reject if it clearly does not match.
                  </p>
                  <input
                    type="text"
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Optional response note..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busy}
                      onClick={() =>
                        runAction(() =>
                          onRespond(request.id, { decision: 'ACCEPT', note: decisionNote })
                        )
                      }
                      className="px-4 py-2 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-xs font-semibold"
                    >
                      Accept Request
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        runAction(() =>
                          onRespond(request.id, {
                            decision: 'ADMIN_ASSISTANCE',
                            note: decisionNote,
                          })
                        )
                      }
                      className="px-4 py-2 rounded-full bg-[#DDE2FF] hover:bg-indigo-200 text-[#11183B] text-xs font-semibold"
                    >
                      Request Admin Assistance
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        runAction(() =>
                          onRespond(request.id, { decision: 'REJECT', note: decisionNote })
                        )
                      }
                      className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {request.status === RECOVERY_STATUS.PENDING && isOwner && (
                <div className="bg-white rounded-2xl p-5 shadow-card text-sm text-slate-600">
                  Waiting for <strong className="text-[#11183B]">{request.finderName}</strong> to accept your recovery request or involve Campus Security.
                </div>
              )}

              {/* STEP 3: Meeting Scheduling */}
              {!isClosed && request.status !== RECOVERY_STATUS.PENDING && (
                <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-[#11183B] text-base">
                      Step 3: Safe Handover Meeting
                    </h4>
                    {request.meeting?.date && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Proposed: {request.meeting.date} at {request.meeting.time}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Location
                      </label>
                      <select
                        value={meetingLoc}
                        onChange={(e) => setMeetingLoc(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#F8F9FA] px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                      >
                        {HANDOVER_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#F8F9FA] px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#F8F9FA] px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#303BFA]" />
                        {request.meeting?.location || meetingLoc}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Owner: {request.meeting?.confirmedByOwner ? 'Confirmed' : 'Pending'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Finder: {request.meeting?.confirmedByFinder ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <button
                      disabled={busy}
                      onClick={() =>
                        runAction(() =>
                          onScheduleMeeting(request.id, {
                            location: meetingLoc,
                            date: meetingDate,
                            time: meetingTime,
                          })
                        )
                      }
                      className="px-4 py-2 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-xs font-semibold"
                    >
                      Save & Confirm Meeting
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: In-Person Private Detail Verification & Handover */}
              {!isClosed && request.status !== RECOVERY_STATUS.PENDING && (
                <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#303BFA]" />
                    <h4 className="font-heading font-bold text-[#11183B] text-base">
                      Step 4: In-Person Verification & Handover
                    </h4>
                  </div>

                  {isOwner && (
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-slate-600">
                        Provide private identifying details hidden from public listings (e.g., wallpaper, engraving, contents inside pocket, serial suffix):
                      </label>
                      <textarea
                        rows={2}
                        value={proofText}
                        onChange={(e) => setProofText(e.target.value)}
                        placeholder="Describe exact hidden marks or private identifying details..."
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={busy || !proofText.trim()}
                          onClick={() =>
                            runAction(() =>
                              onSubmitVerification(request.id, { details: proofText })
                            )
                          }
                          className="px-4 py-2 rounded-full bg-[#DDE2FF] hover:bg-indigo-200 text-[#11183B] text-xs font-semibold disabled:opacity-50"
                        >
                          Submit Private Proof
                        </button>
                        <button
                          disabled={busy || request.verification?.handoverConfirmedByOwner}
                          onClick={() => runAction(() => onVerifyHandover(request.id, {}))}
                          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {request.verification?.handoverConfirmedByOwner
                            ? 'Owner Confirmed Handover ✓'
                            : 'Confirm Physical Handover Received'}
                        </button>
                      </div>
                    </div>
                  )}

                  {(isFinder || isAdmin) && (
                    <div className="space-y-3">
                      <div className="bg-[#F3F6F2] rounded-xl p-3.5 text-xs">
                        <p className="font-semibold text-slate-500 uppercase text-[10px] mb-1">
                          Owner’s Private Verification Claim
                        </p>
                        <p className="text-[#11183B] text-sm">
                          {request.verification?.ownerSubmittedDetails ||
                            'Owner has not submitted private verification proof yet.'}
                        </p>
                      </div>

                      {isAdmin && (
                        <input
                          type="text"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Security Admin verification note (e.g., Checked student ID card & physical serial)"
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                        />
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-slate-500 space-x-3">
                          <span>
                            Finder Verified:{' '}
                            <strong>{request.verification?.finderVerified ? 'Yes ✓' : 'No'}</strong>
                          </span>
                          <span>
                            Owner Handover:{' '}
                            <strong>
                              {request.verification?.handoverConfirmedByOwner ? 'Confirmed ✓' : 'Pending'}
                            </strong>
                          </span>
                        </div>
                        <button
                          disabled={
                            busy ||
                            (isFinder && request.verification?.finderVerified) ||
                            (isAdmin && request.verification?.adminVerified)
                          }
                          onClick={() =>
                            runAction(() => onVerifyHandover(request.id, { adminNote }))
                          }
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            {isAdmin
                              ? request.verification?.adminVerified
                                ? 'Admin Verified ✓'
                                : 'Approve Verification & Complete Return'
                              : request.verification?.finderVerified
                                ? 'Finder Confirmed ✓'
                                : 'Verify Proof & Confirm Handover'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {request.status === RECOVERY_STATUS.COMPLETED && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-heading font-bold text-emerald-950 text-base">
                      TrustLoop Closed — Item Safely Returned
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Both lost and found reports have been marked RETURNED. Verified proof:{' '}
                      {request.verification?.ownerSubmittedDetails || 'In-person confirmation'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Controlled In-App Recovery Messages */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-card flex flex-col h-[420px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#303BFA]" />
                  <h4 className="font-heading font-bold text-[#11183B] text-sm">
                    Controlled Recovery Thread
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">Logged & Monitored</span>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {(request.messages || []).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center pt-10">
                    No messages yet. Coordinate your handover safely here.
                  </p>
                ) : (
                  request.messages.map((msg) => {
                    const isMine = msg.senderId === currentUser?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                          {msg.senderName} {msg.senderRole === 'admin' ? '(Admin)' : ''}
                        </span>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            isMine
                              ? 'bg-[#303BFA] text-white'
                              : msg.senderRole === 'admin'
                                ? 'bg-amber-50 text-amber-950 border border-amber-200'
                                : 'bg-[#F3F6F2] text-[#11183B]'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatText.trim()) return;
                  runAction(async () => {
                    await onSendMessage(request.id, { text: chatText });
                    setChatText('');
                  });
                }}
                className="pt-3 border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  disabled={isClosed}
                  placeholder={isClosed ? 'Thread closed' : 'Send controlled message...'}
                  className="flex-1 rounded-full bg-[#F3F6F2] px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#303BFA] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={busy || isClosed || !chatText.trim()}
                  className="w-9 h-9 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white flex items-center justify-center disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
