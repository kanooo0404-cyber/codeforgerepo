import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { RECOVERY_STATUS, REPORT_STATUS } from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { listReports } from '../../services/reportService.js';
import { listRecoveryRequests } from '../../services/recoveryService.js';

export function AdminReturnedItemsPage() {
  const { user } = useAuth();
  const [returnedReports, setReturnedReports] = useState([]);
  const [completedReqs, setCompletedReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listReports({ status: REPORT_STATUS.RETURNED, includeClosed: true, viewer: user }),
      listRecoveryRequests({ isAdmin: true }),
    ])
      .then(([reps, reqs]) => {
        setReturnedReports(reps);
        setCompletedReqs(reqs.filter((r) => r.status === RECOVERY_STATUS.COMPLETED));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Recovery Ledger
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
            Successfully Returned Items
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Audit trail of completed TrustLoop handovers and items returned to rightful owners.
          </p>
        </div>

        {loading ? (
          <div className="h-36 bg-white rounded-3xl animate-pulse" />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                Completed TrustLoop Handovers ({completedReqs.length})
              </h2>
              {completedReqs.length === 0 ? (
                <p className="text-sm text-slate-500">No completed TrustLoop handovers yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {completedReqs.map((rq) => (
                    <div
                      key={rq.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={rq.photoUrl}
                          alt={rq.itemName}
                          className="w-12 h-12 rounded-2xl object-cover bg-[#F3F6F2]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#303BFA]">#{rq.id}</span>
                            <StatusBadge status={rq.status} />
                          </div>
                          <p className="font-heading font-bold text-sm text-[#11183B] mt-0.5">
                            {rq.itemName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Returned to <strong>{rq.ownerName}</strong> by{' '}
                            <strong>{rq.finderName}</strong> • {rq.meeting?.location || 'Campus'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(rq.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                Returned Reports Archive ({returnedReports.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {returnedReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-[#F3F6F2] rounded-2xl p-4 flex items-center gap-3"
                  >
                    <img
                      src={rep.photoUrl}
                      alt={rep.itemName}
                      className="w-11 h-11 rounded-xl object-cover bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-sm text-[#11183B] truncate">
                        {rep.itemName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {rep.type.toUpperCase()} • {rep.location} • {rep.reporterName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
