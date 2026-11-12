import React from 'react';
import {
  RECOVERY_STATUS,
  REPORT_STATUS,
} from '../config/constants.js';

const STATUS_STYLES = {
  [REPORT_STATUS.ACTIVE]: { label: 'New', cls: 'bg-[#DDE2FF] text-[#303BFA]' },
  [REPORT_STATUS.AVAILABLE]: { label: 'New', cls: 'bg-[#DDE2FF] text-[#303BFA]' },
  [REPORT_STATUS.MATCH_FOUND]: { label: 'Match Found', cls: 'bg-emerald-100 text-emerald-800' },
  [REPORT_STATUS.IN_REVIEW]: { label: 'In Review', cls: 'bg-amber-100 text-amber-800' },
  [REPORT_STATUS.HELD_BY_SECURITY]: { label: 'Held by Security', cls: 'bg-indigo-100 text-indigo-800' },
  [REPORT_STATUS.RETURNED]: { label: 'Returned', cls: 'bg-emerald-100 text-emerald-700' },
  [REPORT_STATUS.CLOSED]: { label: 'Closed', cls: 'bg-slate-200 text-slate-700' },
  [REPORT_STATUS.REJECTED]: { label: 'Rejected', cls: 'bg-rose-100 text-rose-700' },
  [REPORT_STATUS.REMOVED]: { label: 'Removed', cls: 'bg-rose-100 text-rose-800' },
  [RECOVERY_STATUS.PENDING]: { label: 'Pending', cls: 'bg-[#DDE2FF] text-[#11183B]' },
  [RECOVERY_STATUS.ACCEPTED]: { label: 'Accepted', cls: 'bg-sky-100 text-sky-800' },
  [RECOVERY_STATUS.ADMIN_ASSISTANCE]: { label: 'Security Assisted', cls: 'bg-indigo-100 text-indigo-800' },
  [RECOVERY_STATUS.MEETING_SCHEDULED]: { label: 'Meeting Scheduled', cls: 'bg-[#DDE2FF] text-[#303BFA]' },
  [RECOVERY_STATUS.VERIFICATION_SUBMITTED]: { label: 'Verification', cls: 'bg-amber-100 text-amber-800' },
  [RECOVERY_STATUS.COMPLETED]: { label: 'Returned', cls: 'bg-emerald-100 text-emerald-800' },
};

export function StatusBadge({ status, customLabel }) {
  const style = STATUS_STYLES[status] || {
    label: status || 'Pending',
    cls: 'bg-slate-100 text-slate-700',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${style.cls}`}
    >
      {customLabel || style.label}
    </span>
  );
}

export function MatchTierBadge({ tier, score }) {
  const styles = {
    HIGH: 'bg-emerald-100 text-emerald-800',
    MEDIUM: 'bg-[#DDE2FF] text-[#303BFA]',
    LOW: 'bg-amber-100 text-amber-800',
    HIDDEN: 'bg-slate-100 text-slate-600',
  };
  const label =
    tier === 'HIGH'
      ? 'High Similarity'
      : tier === 'MEDIUM'
        ? 'Medium Similarity'
        : tier === 'LOW'
          ? 'Low Similarity'
          : 'Weak Signal';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tabular-nums ${
        styles[tier] || styles.LOW
      }`}
    >
      <span>{score}%</span>
      <span className="opacity-75">• {label}</span>
    </span>
  );
}
