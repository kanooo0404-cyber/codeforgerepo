import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { RECOVERY_STATUS } from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listReports } from '../../services/reportService.js';
import {
  listRecoveryRequests,
  verifyAndConfirmHandover,
} from '../../services/recoveryService.js';

export function AdminVerificationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [queue, setQueue] = useState([]);
  const [secretsByReportId, setSecretsByReportId] = useState({});
  const [notesByReq, setNotesByReq] = useState({});
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const [reqs, allReps] = await Promise.all([
        listRecoveryRequests({ isAdmin: true }),
        listReports({ includeClosed: true, viewer: user }),
      ]);
      const secMap = {};
      allReps.forEach((r) => {
        if (r.privateDetails) secMap[r.id] = r.privateDetails;
      });
      setSecretsByReportId(secMap);
      setQueue(
        reqs.filter(
          (r) =>
            r.status !== RECOVERY_STATUS.COMPLETED &&
            r.status !== RECOVERY_STATUS.REJECTED
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (req) => {
    await verifyAndConfirmHandover(req.id, {
      actor: user,
      adminNote: notesByReq[req.id] || 'Verified ID and physical identifying marks at Security Office.',
    });
    showToast(`Ownership verified & processed for Request #${req.id}!`);
    loadQueue();
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#303BFA]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Campus Security Verification Queue
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
            Ownership Verification
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Compare the claimant’s private identifying proof against confidential lost &amp; found clues before authorizing physical handover.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-[#11183B]">
              Verification queue clear
            </h3>
            <p className="text-sm text-slate-500">
              All active claims have been verified.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.photoUrl}
                      alt={req.itemName}
                      className="w-12 h-12 rounded-2xl object-cover bg-[#F3F6F2]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#303BFA]">
                          Req #{req.id}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-[#11183B]">
                        {req.itemName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Owner: <strong>{req.ownerName}</strong> ↔ Finder:{' '}
                        <strong>{req.finderName}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 bg-[#F3F6F2] px-3.5 py-2 rounded-xl">
                    Meeting: <strong>{req.meeting?.location || 'Unscheduled'}</strong>{' '}
                    {req.meeting?.date ? `• ${req.meeting.date} ${req.meeting.time}` : ''}
                  </div>
                </div>

                {/* Confidential Side-by-Side Clue Comparison (Admin Only) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#F3F6F2] rounded-2xl p-4">
                    <p className="font-bold text-slate-500 uppercase text-[10px] flex items-center gap-1 mb-1">
                      <Lock className="w-3 h-3 text-[#303BFA]" />
                      Owner’s Private Lost Clue
                    </p>
                    <p className="text-[#11183B]">
                      {secretsByReportId[req.lostReportId] || 'Not provided on initial lost report'}
                    </p>
                  </div>
                  <div className="bg-[#F3F6F2] rounded-2xl p-4">
                    <p className="font-bold text-slate-500 uppercase text-[10px] flex items-center gap-1 mb-1">
                      <Lock className="w-3 h-3 text-[#303BFA]" />
                      Finder’s Private Found Clue
                    </p>
                    <p className="text-[#11183B]">
                      {secretsByReportId[req.foundReportId] || 'Not provided on initial found report'}
                    </p>
                  </div>
                  <div className="bg-[#DDE2FF]/50 rounded-2xl p-4 border border-[#303BFA]/20">
                    <p className="font-bold text-[#303BFA] uppercase text-[10px] mb-1">
                      TrustLoop Verification Proof Submitted
                    </p>
                    <p className="text-[#11183B] font-medium">
                      {req.verification?.ownerSubmittedDetails ||
                        'Awaiting owner proof submission'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <input
                    type="text"
                    value={notesByReq[req.id] || ''}
                    onChange={(e) =>
                      setNotesByReq({ ...notesByReq, [req.id]: e.target.value })
                    }
                    placeholder="Admin verification note (e.g., Verified college ID card + physical engraving)"
                    className="flex-1 rounded-full bg-[#F3F6F2] px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                  />
                  <button
                    disabled={req.verification?.adminVerified}
                    onClick={() => handleApprove(req)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {req.verification?.adminVerified
                        ? 'Admin Verified (Awaiting Owner Confirm)'
                        : 'Verify Ownership & Confirm Handover'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
