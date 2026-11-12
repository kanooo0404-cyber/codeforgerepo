import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { MatchCard } from '../../components/MatchCard.jsx';
import { TrustLoopModal } from '../../components/TrustLoopModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  dismissMatch,
  listHydratedMatches,
  recalculateAllMatches,
} from '../../services/matchService.js';
import {
  respondToRecoveryRequest,
  scheduleRecoveryMeeting,
  sendRecoveryMessage,
  submitVerificationDetails,
  verifyAndConfirmHandover,
} from '../../services/recoveryService.js';

export function AdminMatchesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [activeReq, setActiveReq] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await listHydratedMatches({ isAdmin: true });
      setMatches(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await recalculateAllMatches();
      showToast(
        `AI recalculation finished: ${res.createdCount} new, ${res.updatedCount} refreshed.`
      );
      await loadAll();
    } finally {
      setRecalculating(false);
    }
  };

  const syncReq = async (updated) => {
    setActiveReq((prev) => ({ ...prev, ...updated }));
    await loadAll();
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
              AI Matching Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review all SmartFind AI scored pairs across campus and re-run matching after threshold updates.
            </p>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-xs font-semibold shadow-pill disabled:opacity-60 self-start"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate All Matches'}</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-52 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card space-y-2">
            <Sparkles className="w-8 h-8 text-[#303BFA] mx-auto" />
            <h3 className="font-heading font-bold text-lg text-[#11183B]">
              No SmartFind matches stored
            </h3>
            <p className="text-sm text-slate-500">
              Click Recalculate All Matches to scan all eligible active lost &amp; found items.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isAdmin
                currentUserId={user?.uid}
                onOpenRecovery={(req) =>
                  setActiveReq({
                    ...req,
                    lostReport: match.lostReport,
                    foundReport: match.foundReport,
                  })
                }
                onDismiss={async (id) => {
                  await dismissMatch(id);
                  showToast('Match dismissed.', 'info');
                  loadAll();
                }}
              />
            ))}
          </div>
        )}
      </div>

      <TrustLoopModal
        request={activeReq}
        currentUser={user}
        onClose={() => setActiveReq(null)}
        onRespond={async (id, payload) => {
          const updated = await respondToRecoveryRequest(id, { ...payload, actor: user });
          showToast('Decision logged.');
          await syncReq(updated);
        }}
        onScheduleMeeting={async (id, payload) => {
          const updated = await scheduleRecoveryMeeting(id, { ...payload, actor: user });
          showToast('Meeting scheduled.');
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
          showToast('Admin verification confirmed.');
          await syncReq(updated);
        }}
      />
    </PortalLayout>
  );
}
