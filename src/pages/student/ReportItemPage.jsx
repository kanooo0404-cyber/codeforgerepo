import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Lock,
  Shield,
  Sparkles,
} from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import {
  CAMPUS_LOCATIONS,
  ITEM_CATEGORIES,
  ITEM_COLOURS,
  SENSITIVE_CATEGORIES,
} from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createReport } from '../../services/reportService.js';

export function ReportItemPage({ mode = 'lost' }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isFound = mode === 'found';

  const [form, setForm] = useState({
    itemName: '',
    category: ITEM_CATEGORIES[0],
    description: '',
    colour: ITEM_COLOURS[0],
    location: CAMPUS_LOCATIONS[0],
    date: new Date().toISOString().split('T')[0],
    time: '',
    privateDetails: '',
    heldBySecurity: false,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const isSensitiveCategory = SENSITIVE_CATEGORIES.includes(form.category);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const created = await createReport({
        type: mode,
        ...form,
        photoFile,
        reporter: user,
      });
      setResult(created);
      showToast(
        `${isFound ? 'Found' : 'Lost'} report saved! SmartFind AI found ${created.matchesFound} potential match(es).`
      );
    } catch (err) {
      setError(err.message || 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout role="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isFound
                ? 'bg-[#DDE2FF] text-[#303BFA]'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isFound ? 'Found Item Report' : 'Lost Item Report'}
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#11183B] mt-2">
            {isFound ? 'Report a Found Belonging' : 'Report a Lost Belonging'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isFound
              ? 'Help return a campus item safely. Private identifying details stay hidden so the true owner can verify ownership via TrustLoop.'
              : 'Describe your missing item clearly. SmartFind AI will immediately compare it against reported found items.'}
          </p>
        </div>

        {result ? (
          <div className="bg-white rounded-3xl p-8 shadow-card border border-emerald-200 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-[#11183B]">
                Report Submitted Successfully
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                <strong>{result.report.itemName}</strong> is now live with status{' '}
                <span className="font-semibold text-[#303BFA]">{result.report.status}</span>.
              </p>
            </div>

            <div className="bg-[#F3F6F2] rounded-2xl p-4 inline-flex items-center gap-2.5 text-sm font-medium text-[#11183B]">
              <Sparkles className="w-4 h-4 text-[#303BFA]" />
              <span>
                SmartFind AI detected <strong>{result.matchesFound}</strong> candidate match
                {result.matchesFound === 1 ? '' : 'es'}.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/student/matches')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#303BFA] text-white text-sm font-semibold hover:bg-[#232CD4]"
              >
                View AI Matches
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/student/my-reports')}
                className="px-6 py-3 rounded-full bg-[#DDE2FF] text-[#11183B] text-sm font-semibold hover:bg-indigo-200"
              >
                Go to My Reports
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-5"
          >
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl p-3.5">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  placeholder="e.g., White Wireless Earbuds"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F3F6F2] border border-transparent focus:bg-white focus:border-[#303BFA] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F3F6F2] border border-transparent focus:bg-white focus:border-[#303BFA] text-sm focus:outline-none"
                >
                  {ITEM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isSensitiveCategory && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
                <Shield className="w-4 h-4 text-[#303BFA] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Sensitive / Valuable Item Protection Active</p>
                  <p className="mt-0.5 text-indigo-900/80">
                    {isFound
                      ? 'For ID cards, wallets, or electronics, avoid writing full card/ID numbers publicly. We strongly recommend handing this item to Campus Security.'
                      : 'Do not write full ID/card numbers in the public description — place them in the encrypted Private Identifying Information field below.'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                Public Description *
              </label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe colour, brand, visible wear, stickers, or where exactly it was spotted..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F3F6F2] border border-transparent focus:bg-white focus:border-[#303BFA] text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  Colour *
                </label>
                <select
                  value={form.colour}
                  onChange={(e) => setForm({ ...form, colour: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                >
                  {ITEM_COLOURS.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  Campus Location *
                </label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  {isFound ? 'Found Date *' : 'Lost Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                  Approximate Time
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                Item Photograph {isFound ? '(Recommended)' : '(Optional)'}
              </label>
              <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#303BFA] bg-[#F8F9FA] cursor-pointer transition">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#DDE2FF] text-[#303BFA] flex items-center justify-center shrink-0">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                )}
                <div className="text-xs">
                  <p className="font-semibold text-[#11183B]">
                    {photoFile ? photoFile.name : 'Click to upload an item image (PNG, JPG up to 5 MB)'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Clear photos improve owner recognition while private clues remain hidden.
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Private Identifying Information */}
            <div className="bg-[#F3F6F2] rounded-2xl p-4 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#11183B]">
                <Lock className="w-3.5 h-3.5 text-[#303BFA]" />
                <span>
                  Private Identifying Information (Hidden from public listings — used in TrustLoop verification)
                </span>
              </label>
              <textarea
                rows={2}
                value={form.privateDetails}
                onChange={(e) => setForm({ ...form, privateDetails: e.target.value })}
                placeholder="e.g., Engraved initials inside lid, lock-screen photo, name on card, serial last 4 digits..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
              />
            </div>

            {isFound && (
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.heldBySecurity}
                  onChange={(e) => setForm({ ...form, heldBySecurity: e.target.checked })}
                  className="mt-1 rounded text-[#303BFA] focus:ring-[#303BFA]"
                />
                <div className="text-xs">
                  <span className="font-bold text-emerald-950">
                    Handed over to Campus Security Office
                  </span>
                  <p className="text-emerald-800/80 mt-0.5">
                    Recommended for wallets, ID cards, keys, and electronics. Marks item as Held by Security.
                  </p>
                </div>
              </label>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-sm font-semibold shadow-pill transition disabled:opacity-60"
              >
                <span>
                  {submitting
                    ? 'Saving & Running AI Match...'
                    : isFound
                      ? 'Submit Found Report'
                      : 'Submit Lost Report'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </PortalLayout>
  );
}
