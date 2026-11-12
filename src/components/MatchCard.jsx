import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  Handshake,
  Info,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import { MatchTierBadge, StatusBadge } from './StatusBadge.jsx';

export function MatchCard({
  match,
  currentUserId,
  isAdmin = false,
  onRequestRecovery,
  onOpenRecovery,
  onDismiss,
}) {
  const [claimNote, setClaimNote] = useState('');
  const [showClaimInput, setShowClaimInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { lostReport, foundReport, activeRequest } = match;
  const isOwner = currentUserId && lostReport.reporterId === currentUserId;

  const handleConfirmRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onRequestRecovery(match, claimNote);
      setShowClaimInput(false);
      setClaimNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DDE2FF] text-[#303BFA] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-[#11183B] text-base">
                SmartFind AI Match
              </span>
              <MatchTierBadge tier={match.tier} score={match.score} />
              {match.usedGemini && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Gemini Enhanced
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Info className="w-3 h-3 shrink-0" />
              Similarity scores assist discovery only and do not establish ownership.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeRequest ? (
            <button
              onClick={() => onOpenRecovery?.(activeRequest)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DDE2FF] hover:bg-[#303BFA] text-[#11183B] hover:text-white text-xs font-semibold transition"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Open TrustLoop ({activeRequest.id})</span>
            </button>
          ) : isOwner && onRequestRecovery ? (
            <button
              onClick={() => setShowClaimInput((v) => !v)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-xs font-semibold shadow-pill transition"
            >
              <Handshake className="w-4 h-4" />
              <span>Request Item Recovery</span>
            </button>
          ) : !isAdmin ? (
            <span className="px-3.5 py-1.5 rounded-full bg-[#F3F6F2] text-slate-600 text-xs font-semibold">
              Awaiting Owner Claim
            </span>
          ) : null}

          {onDismiss && !activeRequest && (
            <button
              onClick={() => onDismiss(match.id)}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Dismiss suggestion"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lost vs Found Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
        {/* Lost Report Card */}
        <div className="lg:col-span-5 bg-[#F3F6F2] rounded-2xl p-4 flex gap-3.5">
          <img
            src={lostReport.photoUrl}
            alt={lostReport.itemName}
            className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Lost Report
              </span>
              <StatusBadge status={lostReport.status} />
            </div>
            <h4 className="font-heading font-bold text-[#11183B] text-sm truncate">
              {lostReport.itemName}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 mt-1">
              {lostReport.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#303BFA]" />
                {lostReport.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {lostReport.date}
              </span>
            </div>
          </div>
        </div>

        {/* Center Comparison Connector */}
        <div className="lg:col-span-1 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-[#DDE2FF] text-[#303BFA] flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* Found Report Card */}
        <div className="lg:col-span-5 bg-[#F3F6F2] rounded-2xl p-4 flex gap-3.5">
          <img
            src={foundReport.photoUrl}
            alt={foundReport.itemName}
            className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DDE2FF] text-[#303BFA]">
                Found Report
              </span>
              <StatusBadge status={foundReport.status} />
            </div>
            <h4 className="font-heading font-bold text-[#11183B] text-sm truncate">
              {foundReport.itemName}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 mt-1">
              {foundReport.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#303BFA]" />
                {foundReport.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {foundReport.date}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown & Matching Reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Weighted Score Breakdown
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {[
              { label: 'Description (35%)', val: match.breakdown?.description ?? 0 },
              { label: 'Category (25%)', val: match.breakdown?.category ?? 0 },
              { label: 'Location (25%)', val: match.breakdown?.location ?? 0 },
              { label: 'Date Proximity (15%)', val: match.breakdown?.date ?? 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-[#11183B] tabular-nums">{item.val}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#303BFA] rounded-full"
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F8F9FA] rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Why SmartFind Flagged This Pair
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(match.reasons || []).map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-medium text-[#11183B]"
              >
                {reason}
              </span>
            ))}
          </div>
          {isAdmin && (
            <p className="text-[11px] text-slate-500 mt-2">
              Owner: <strong>{lostReport.reporterName}</strong> ↔ Finder:{' '}
              <strong>{foundReport.reporterName}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Inline Request Recovery Claim Drawer */}
      {showClaimInput && (
        <form
          onSubmit={handleConfirmRequest}
          className="bg-[#DDE2FF]/35 border border-[#303BFA]/20 rounded-2xl p-4 space-y-3"
        >
          <p className="text-xs font-semibold text-[#11183B]">
            Initiate TrustLoop Recovery — Add a brief note for {foundReport.reporterName} (avoid sharing sensitive passwords; full verification happens in Step 4).
          </p>
          <textarea
            rows={2}
            value={claimNote}
            onChange={(e) => setClaimNote(e.target.value)}
            placeholder="e.g., I lost this right after my afternoon class and can confirm the mark inside the cover."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowClaimInput(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-full bg-[#303BFA] text-white text-xs font-semibold hover:bg-[#232CD4] disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Confirm & Send Recovery Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
