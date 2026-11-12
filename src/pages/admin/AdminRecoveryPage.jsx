import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Handshake, MapPin, ShieldCheck } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { TrustLoopModal } from '../../components/TrustLoopModal.jsx';
import { RECOVERY_STATUS } from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  listRecoveryRequests,
  respondToRecoveryRequest,
  scheduleRecoveryMeeting,
  sendRecoveryMessage,
  submitVerificationDetails,
  verifyAndConfirmHandover,
} from '../../services/recoveryService.js';

export function AdminRecoveryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await listRecoveryRequests({ isAdmin: true });
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const syncReq = async (updated) => {
    setSelectedReq((prev) => ({ ...prev, ...updated }));
    await loadAll();
  };

  const filtered = requests.filter((r) => {
    if (filter === 'COMPLETED') return r.status === RECOVERY_STATUS.COMPLETED;
    if (filter === 'ASSISTED') return r.adminAssistanceRequested && r.status !== RECOVERY_STATUS.COMPLETED;
    if (filter === 'OPEN') return r.status !== RECOVERY_STATUS.COMPLETED && r.status !== RECOVERY_STATUS.REJECTED;
    return true;
  });

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
              Recovery Requests Supervision
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitor TrustLoop exchanges, step in when Security assistance is requested, and verify handovers.
            </p>
          </div>

          <div className="inline-flex bg-white p-1 rounded-full border border-slate-200/80 self-start">
            {[
              { id: 'OPEN', label: 'Open' },
              { id: 'ASSISTED', label: 'Security Assisted' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'ALL', label: 'All' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  filter === t.id ? 'bg-[#303BFA] text-white' : 'text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card space-y-2">
            <Handshake className="w-8 h-8 text-[#303BFA] mx-auto" />
            <p className="font-heading font-bold text-lg text-[#11183B]">
              No requests in this filter
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedReq(req)}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-slate-100 hover:border-[#303BFA]/40 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={req.photoUrl}
                    alt={req.itemName}
                    className="w-12 h-12 rounded-2xl object-cover bg-[#F3F6F2] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#303BFA]">#{req.id}</span>
                      <StatusBadge status={req.status} />
                      {req.adminAssistanceRequested && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          <ShieldCheck className="w-3 h-3" />
                          Security Supervised
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#11183B] mt-1">
                      {req.itemName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>
                        {req.ownerName} ↔ {req.finderName}
                      </span>
                      {req.meeting?.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#303BFA]" />
                          {req.meeting.location}
                        </span>
                      )}
                      {req.meeting?.date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {req.meeting.date} {req.meeting.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3F6F2] hover:bg-[#303BFA] text-[#11183B] hover:text-white text-xs font-semibold transition self-start sm:self-center">
                  <span>Inspect &amp; Supervise</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <TrustLoopModal
        request={selectedReq}
        currentUser={user}
        onClose={() => setSelectedReq(null)}
        onRespond={async (id, payload) => {
          const updated = await respondToRecoveryRequest(id, { ...payload, actor: user });
          showToast('Recovery status updated.');
          await syncReq(updated);
        }}
        onScheduleMeeting={async (id, payload) => {
          const updated = await scheduleRecoveryMeeting(id, { ...payload, actor: user });
          showToast('Handover meeting scheduled.');
          await syncReq(updated);
        }}
        onSendMessage={async (id, payload) => {
          const updated = await sendRecoveryMessage(id, { ...payload, actor: user });
          await syncReq(updated);
        }}
        onSubmitVerification={async (id, payload) => {
          const updated = await submitVerificationDetails(id, { ...payload, actor: user });
          await syncReq(updated);
        }}
        onVerifyHandover={async (id, payload) => {
          const updated = await verifyAndConfirmHandover(id, { ...payload, actor: user });
          showToast('Security verification logged!');
          await syncReq(updated);
        }}
      />
    </PortalLayout>
  );
}
