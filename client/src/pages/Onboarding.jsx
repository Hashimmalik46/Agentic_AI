import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, Building2, Target, Zap } from 'lucide-react';
import { supabase } from '/lib/supabaseClient.jsx';
import { useAuth } from '../App';

const STEPS = [
  { id: 1, label: 'Startup Identity', icon: Building2 },
  { id: 2, label: 'Targeting Matrix', icon: Target },
  { id: 3, label: 'Pipeline Settings', icon: Zap },
];

const SERVICE_TYPES = [
  { value: 'website_development',     label: 'Website Development' },
  { value: 'video_creation',          label: 'Video Creation & Production' },
  { value: 'seo',                     label: 'SEO & Search Visibility' },
  { value: 'social_media_management', label: 'Social Media Management' },
  { value: 'digital_marketing',       label: 'Digital Marketing & Ads' },
];

const EMPTY = {
  startupName: '', niche: '', targetRoles: '',
  location: '', companySize: '', keywords: '',
  serviceType: 'website_development', maxResults: 10,
};

const STEP_REQUIRED = {
  1: ['startupName', 'niche'],
  2: ['targetRoles', 'location', 'companySize'],
  3: ['keywords'],
};

const FIELD_LABELS = {
  startupName: 'Startup Name',
  niche:        'Industry / Niche',
  targetRoles:  'Target Roles',
  location:     'Geographic Focus',
  companySize:  'Company Size',
  keywords:     'Keywords / Tech Stack',
};

// Defined OUTSIDE Onboarding to prevent remount on every keystroke
function Field({ field, placeholder, form, errors, update, type = 'text' }) {
  return (
    <div className="flex flex-col gap-2">
      <label className={`text-[11px] uppercase tracking-[0.1em] font-medium ${errors[field] ? 'text-red-400' : 'text-[#ba9eff]'}`}>
        {FIELD_LABELS[field]}
        {errors[field] && <span className="normal-case ml-1 text-red-400">— {errors[field]}</span>}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        className={`bg-transparent border-b py-3 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/40 focus:border-[#699cff] ${
          errors[field] ? 'border-red-400/70' : 'border-[#40485d]/50'
        }`}
      />
    </div>
  );
}

export default function Onboarding() {
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (s) => {
    const errs = {};
    (STEP_REQUIRED[s] || []).forEach(key => {
      if (!form[key]?.toString().trim()) errs[key] = `${FIELD_LABELS[key]} is required`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next   = () => { if (validateStep(step)) setStep(s => s + 1); };
  const back   = () => { setErrors({}); setStep(s => s - 1); };

  const finish = async () => {
    if (!validateStep(3)) return;
    setSaving(true);
    await supabase.from('users').update({
      startup_name:  form.startupName,
      niche:         form.niche,
      target_roles:  form.targetRoles,
      location:      form.location,
      company_size:  form.companySize,
      keywords:      form.keywords,
      service_type:  form.serviceType,
      max_results:   Number(form.maxResults) || 10,
    }).eq('id', user.id);
    navigate('/profile');
  };

  // Shared props for Field
  const fieldProps = { form, errors, update };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans flex flex-col items-center justify-center p-6 selection:bg-[#ba9eff]/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8455ef]/15 via-[#060e20] to-[#060e20] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">

        {/* Progress bar */}
        <div className="mb-8">
          <p className="text-xs text-[#a3aac4] mb-4 text-center">Step {step} of {STEPS.length}</p>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done   = step > s.id;
              const active = step === s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-300 ${
                    done   ? 'bg-[#ba9eff]/10 border-[#ba9eff]/30 text-[#ba9eff]' :
                    active ? 'bg-[#8455ef]/15 border-[#8455ef]/40 text-[#dee5ff]' :
                             'border-[#40485d]/20 text-[#a3aac4]/50'
                  }`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px transition-colors duration-300 ${step > s.id ? 'bg-[#ba9eff]/30' : 'bg-[#40485d]/20'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)]">

          {/* Step 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-7">
              <div>
                <h2 className="text-2xl font-semibold text-[#dee5ff] mb-1">What's your startup?</h2>
                <p className="text-sm text-[#a3aac4]">Tell us about your company and the industry you're targeting.</p>
              </div>
              <Field {...fieldProps} field="startupName" placeholder="e.g. Acme Agency" />
              <Field {...fieldProps} field="niche"       placeholder="e.g. restaurants, dental clinics, gyms" />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-7">
              <div>
                <h2 className="text-2xl font-semibold text-[#dee5ff] mb-1">Who are you targeting?</h2>
                <p className="text-sm text-[#a3aac4]">Define your ideal prospect so the agent knows where to look.</p>
              </div>
              <Field {...fieldProps} field="targetRoles" placeholder="e.g. founders, marketing managers" />
              <Field {...fieldProps} field="location"    placeholder="e.g. Delhi, Mumbai, Bangalore" />
              <Field {...fieldProps} field="companySize" placeholder="e.g. 1–10 employees, small business" />
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-7">
              <div>
                <h2 className="text-2xl font-semibold text-[#dee5ff] mb-1">Configure the pipeline</h2>
                <p className="text-sm text-[#a3aac4]">Set the signals and service type to sharpen lead scoring.</p>
              </div>
              <Field {...fieldProps} field="keywords" placeholder="e.g. no website, low reviews, no social media" />

              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] font-medium">Service Type</label>
                <div className="relative">
                  <select
                    value={form.serviceType}
                    onChange={e => update('serviceType', e.target.value)}
                    className="w-full bg-[#060e20] border-b border-[#40485d]/50 py-3 text-lg outline-none text-[#dee5ff] appearance-none cursor-pointer focus:border-[#699cff] transition-colors"
                  >
                    {SERVICE_TYPES.map(s => (
                      <option key={s.value} value={s.value} className="bg-[#060e20]">{s.label}</option>
                    ))}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a3aac4] pointer-events-none">▾</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] font-medium">Max Leads to Generate</label>
                <input
                  type="number" min={1} max={50}
                  value={form.maxResults}
                  onChange={e => update('maxResults', e.target.value)}
                  className="bg-transparent border-b border-[#40485d]/50 py-3 text-lg outline-none text-[#dee5ff] focus:border-[#699cff] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 1 ? (
              <button onClick={back} className="flex items-center gap-2 text-sm text-[#a3aac4] hover:text-[#dee5ff] transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < STEPS.length ? (
              <button onClick={next} className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-black hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)] hover:-translate-y-0.5 transition-all">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={saving}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all ${
                  saving
                    ? 'bg-[#a3aac4] opacity-70 cursor-not-allowed text-black'
                    : 'bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-black hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)] hover:-translate-y-0.5'
                }`}
              >
                {saving
                  ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                  : <><CheckCircle2 className="w-4 h-4" /> Complete Setup</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
