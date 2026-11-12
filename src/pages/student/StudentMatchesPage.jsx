import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { MatchCard } from '../../components/MatchCard.jsx';
import { TrustLoopModal } from '../../components/TrustLoopModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { dismissMatch, listHydratedMatches } from '../../services/matchService.js';
import {
  createRecoveryRequest,
  respondToRecoveryRequest,
  scheduleRecoveryMeeting,
  sendRecoveryMessage,
  submitVerificationDetails,
  verifyAndConfirmHandover,
} from '../../services/recoveryService.js';

export function StudentMatchesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [activeTrustLoop, setActiveTrustLoop] = useState(null);

  const loadMatches = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await listHydratedMatches({ userId: user.uid });
      setMatches(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [user?.uid]);

  const handleRequestRecovery = async (match, claimNote) => {
    try {
      const created = await createRecoveryRequest({
        matchId: match.id,
        lostReport: match.lostReport,
        foundReport: match.foundReport,
        owner: user,
        claimNote,
      });
      showToast('TrustLoop recovery request sent to the finder!');
      await loadMatches();
      setActiveTrustLoop({
        ...created,
        lostReport: match.lostReport,
        foundReport: match.foundReport,
      });
    } catch (err) {
      showToast(err.message || 'Unable to start recovery request.', 'error');
    }
  };

  const handleDismiss = async (matchId) => {
    await dismissMatch(matchId);
    showToast('Match dismissed.', 'info');
    loadMatches();
  };

  const refreshAndSyncModal = async (updatedReq) => {
    setActiveTrustLoop((prev) => ({ ...prev, ...updatedReq }));
    await loadMatches();
  };

  const filtered = matches.filter((m) =>
    tierFilter === 'ALL' ? true : m.tier === tierFilter
  );

  return (
    <PortalLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#303BFA]">
              <Sparkles className="w-3.5 h-3.5" />
              SmartFind AI Engine
            </span>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
              Potential Matches
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Weighted comparison of descriptions (35%), category (25%), location (25%), and date proximity (15%). Similarity scores assist review and never prove ownership.
            </p>
          </div>

          <div className="inline-flex bg-white p-1 rounded-full border border-slate-200/80 self-start">
            {[
              { id: 'ALL', label: 'All (40%+)' },
              { id: 'HIGH', label: 'High (80+)' },
              { id: 'MEDIUM', label: 'Medium (60–79)' },
              { id: 'LOW', label: 'Low (40–59)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  tierFilter === t.id ? 'bg-[#303BFA] text-white' : 'text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-56 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card space-y-2">
            <Sparkles className="w-8 h-8 text-[#303BFA] mx-auto" />
            <h3 className="font-heading font-bold text-lg text-[#11183B]">
              No matches at this threshold yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              As soon as another student reports a matching item, SmartFind AI will score it automatically and notify you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                currentUserId={user?.uid}
                onRequestRecovery={handleRequestRecovery}
                onOpenRecovery={(req) =>
                  setActiveTrustLoop({
                    ...req,
                    lostReport: match.lostReport,
                    foundReport: match.foundReport,
                  })
                }
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </div>

      <TrustLoopModal
        request={activeTrustLoop}
        currentUser={user}
        onClose={() => setActiveTrustLoop(null)}
        onRespond={async (id, payload) => {
          const updated = await respondToRecoveryRequest(id, { ...payload, actor: user });
          showToast('Recovery response saved.');
          await refreshAndSyncModal(updated);
        }}
        onScheduleMeeting={async (id, payload) => {
          const updated = await scheduleRecoveryMeeting(id, { ...payload, actor: user });
          showToast('Meeting scheduled in TrustLoop.');
          await refreshAndSyncModal(updated);
        }}
        onSendMessage={async (id, payload) => {
          const updated = await sendRecoveryMessage(id, { ...payload, actor: user });
          await refreshAndSyncModal(updated);
        }}
        onSubmitVerification={async (id, payload) => {
          const updated = await submitVerificationDetails(id, { ...payload, actor: user });
          showToast('Private verification details submitted.');
          await refreshAndSyncModal(updated);
        }}
        onVerifyHandover={async (id, payload) => {
          const updated = await verifyAndConfirmHandover(id, { ...payload, actor: user });
          showToast('Handover confirmation recorded!');
          await refreshAndSyncModal(updated);
        }}
      />
    </PortalLayout>
  );
}
