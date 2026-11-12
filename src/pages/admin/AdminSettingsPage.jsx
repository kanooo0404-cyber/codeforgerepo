import React, { useEffect, useState } from 'react';
import { Save, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { DEFAULT_MATCHING_CONFIG } from '../../config/matchingConfig.js';
import { isGeminiConfigured } from '../../config/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  getAdminSettings,
  saveAdminSettings,
} from '../../services/adminService.js';

export function AdminSettingsPage() {
  const { user, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    matchingConfig: DEFAULT_MATCHING_CONFIG,
    requireSecurityHandoverForSensitive: true,
    campusName: 'FoundIt University Campus',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSettings().then((data) => {
      if (data) setSettings(data);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAdminSettings(settings, user);
      showToast('Administrative settings saved!');
    } catch (err) {
      showToast(err.message || 'Unable to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const thresholds = settings.matchingConfig?.thresholds || DEFAULT_MATCHING_CONFIG.thresholds;

  return (
    <PortalLayout role="admin">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#303BFA]">
            <Settings className="w-3.5 h-3.5" />
            Platform Configuration
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B] mt-1">
            Administrative Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure SmartFind AI match thresholds, Gemini enhancement, and Campus Security handover policies.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6"
        >
          <div>
            <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
              Campus Institution Name
            </label>
            <input
              type="text"
              value={settings.campusName || ''}
              onChange={(e) =>
                setSettings({ ...settings, campusName: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
            />
          </div>

          {/* Configurable AI Match Thresholds */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#303BFA]" />
              <h2 className="font-heading font-bold text-base text-[#11183B]">
                SmartFind AI Similarity Thresholds
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  High Match (min %)
                </label>
                <input
                  type="number"
                  min={50}
                  max={99}
                  value={thresholds.high}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      matchingConfig: {
                        ...settings.matchingConfig,
                        thresholds: { ...thresholds, high: Number(e.target.value) },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F3F6F2] text-sm font-semibold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Medium Match (min %)
                </label>
                <input
                  type="number"
                  min={30}
                  max={89}
                  value={thresholds.medium}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      matchingConfig: {
                        ...settings.matchingConfig,
                        thresholds: { ...thresholds, medium: Number(e.target.value) },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F3F6F2] text-sm font-semibold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Display Cutoff (min %)
                </label>
                <input
                  type="number"
                  min={10}
                  max={70}
                  value={thresholds.low}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      matchingConfig: {
                        ...settings.matchingConfig,
                        thresholds: { ...thresholds, low: Number(e.target.value) },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F3F6F2] text-sm font-semibold tabular-nums"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#F3F6F2] cursor-pointer">
              <div className="text-xs">
                <span className="font-bold text-[#11183B]">
                  Use Gemini Semantic Matching When Configured
                </span>
                <p className="text-slate-500 mt-0.5">
                  Status:{' '}
                  {isGeminiConfigured
                    ? 'VITE_GEMINI_API_KEY detected'
                    : 'Not configured — deterministic weighted algorithm active'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.matchingConfig?.useGeminiWhenAvailable)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    matchingConfig: {
                      ...settings.matchingConfig,
                      useGeminiWhenAvailable: e.target.checked,
                    },
                  })
                }
                className="rounded text-[#303BFA]"
              />
            </label>
          </div>

          {/* Security Policy */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#303BFA]" />
              <h2 className="font-heading font-bold text-base text-[#11183B]">
                TrustLoop &amp; Security Policy
              </h2>
            </div>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#F3F6F2] cursor-pointer">
              <div className="text-xs">
                <span className="font-bold text-[#11183B]">
                  Require Security-Office Handover for Sensitive Categories
                </span>
                <p className="text-slate-500 mt-0.5">
                  Flags ID cards, wallets, and electronics for supervised Campus Security verification.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.requireSecurityHandoverForSensitive)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    requireSecurityHandoverForSensitive: e.target.checked,
                  })
                }
                className="rounded text-[#303BFA]"
              />
            </label>

            <div className="text-xs text-slate-500 px-1">
              Runtime Environment:{' '}
              <strong className="text-[#11183B]">
                {isDemoMode ? 'Local Demo Mode (Browser Storage)' : 'Live Firebase Mode'}
              </strong>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-sm font-semibold shadow-pill disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Administrative Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
