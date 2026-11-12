import React, { useState } from 'react';
import { Building2, IdCard, Mail, Phone, Save, User } from 'lucide-react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function StudentProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await refreshProfile(form);
      showToast('Student profile updated!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#11183B]">
            Student Profile
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Keep your campus details up to date. Contact details remain hidden from public listings.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-5"
        >
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-[#303BFA] text-white font-heading font-bold text-xl flex items-center justify-center">
              {(user?.name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-[#11183B]">
                {user?.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email} • Verified Student Role
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                Student ID
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#11183B] mb-1.5">
                Phone Number (Private)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F3F6F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#303BFA]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#303BFA] hover:bg-[#232CD4] text-white text-sm font-semibold shadow-pill disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
