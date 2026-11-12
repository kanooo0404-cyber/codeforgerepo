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

export function StudentRecoveryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  const loadRequests = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await listRecoveryRequests({ userId: user.uid });
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user?.uid]);

  const syncSelected = async (updated) => {
    setSelectedReq((prev) => ({ ...prev, ...updated }));
    await loadRequests();
  };

  const filtered = requests.filter((r) => {
    const isCompleted = r.status === RECOVERY_STATUS.COMPLETED;
    const isRejected = r.status === RECOVERY_STATUS.REJECTED;
    if (tab === 'history') return isCompleted || isRejected;
    if (tab === 'incoming') return r.finderId === user?.uid && !isCompleted && !isRejected;
    if (tab === 'outgoing') return r.ownerId === user?.uid && !isCompleted && !isRejected;
    return !isCompleted && !isRejected;
  });

  return (
    <PortalLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#303BFA]">
              <Handshake className="w-3.5 h-3.5" />
              TrustLoop Verification
            </span>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
              Recovery Requests &amp; History
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Coordinate safe campus handovers, verify private ownership clues, and close recovered reports.
            </p>
          </div>

          <div className="inline-flex bg-white p-1 rounded-full border border-slate-200/80 self-start">
            {[
              { id: 'active', label: 'Active' },
              { id: 'incoming', label: 'As Finder' },
              { id: 'outgoing', label: 'As Owner' },
              { id: 'history', label: 'History' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  tab === t.id ? 'bg-[#303BFA] text-white' : 'text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card space-y-2">
            <Handshake className="w-8 h-8 text-[#303BFA] mx-auto" />
            <h3 className="font-heading font-bold text-lg text-[#11183B]">
              No recovery threads in this view
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Visit AI Matches to send a TrustLoop recovery request when you spot a candidate match.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const roleBadge = req.ownerId === user?.uid ? 'Claiming Owner' : 'Item Finder';
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReq(req)}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-slate-100 hover:border-[#303BFA]/40 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={req.photoUrl}
                      alt={req.itemName}
                      className="w-14 h-14 rounded-2xl object-cover bg-[#F3F6F2] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#303BFA]">#{req.id}</span>
                        <StatusBadge status={req.status} />
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F3F6F2] text-slate-700">
                          Role: {roleBadge}
                        </span>
                        {req.adminAssistanceRequested && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            <ShieldCheck className="w-3 h-3" />
                            Security Assisted
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#11183B] mt-1">
                        {req.itemName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>
                          {req.ownerName} ↔ {req.finderName}
                        </span>
                        {req.meeting?.date && (
                          <span className="inline-flex items-center gap-1 text-[#11183B] font-medium">
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
                    <span>Open TrustLoop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TrustLoopModal
        request={selectedReq}
        currentUser={user}
        onClose={() => setSelectedReq(null)}
        onRespond={async (id, payload) => {
          const updated = await respondToRecoveryRequest(id, { ...payload, actor: user });
          showToast('Decision recorded.');
          await syncSelected(updated);
        }}
        onScheduleMeeting={async (id, payload) => {
          const updated = await scheduleRecoveryMeeting(id, { ...payload, actor: user });
          showToast('Meeting updated!');
          await syncSelected(updated);
        }}
        onSendMessage={async (id, payload) => {
          const updated = await sendRecoveryMessage(id, { ...payload, actor: user });
          await syncSelected(updated);
        }}
        onSubmitVerification={async (id, payload) => {
          const updated = await submitVerificationDetails(id, { ...payload, actor: user });
          showToast('Private verification proof sent!');
          await syncSelected(updated);
        }}
        onVerifyHandover={async (id, payload) => {
          const updated = await verifyAndConfirmHandover(id, { ...payload, actor: user });
          showToast('Handover confirmation saved!');
          await syncSelected(updated);
        }}
      />
    </PortalLayout>
  );
}
