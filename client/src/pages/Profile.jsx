import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Zap, Building2, Target, CheckCircle2, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '/lib/supabaseClient.jsx';
import { useAuth } from '../App';
import { api } from '../lib/api';

const SERVICE_TYPES = [
  { value: 'website_development', label: 'Website Development' },
  { value: 'video_creation', label: 'Video Creation & Production' },
  { value: 'seo', label: 'SEO & Search Visibility' },
  { value: 'social_media_management', label: 'Social Media Management' },
  { value: 'digital_marketing', label: 'Digital Marketing & Ads' },
];

export default function WorkspaceProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialProfileData = useMemo(() => {
    const state = location.state;
    return {
      startupName: state?.startupName ,
      niche: state?.niche ,
      targetRoles: state?.targetRoles ,
      location: state?.location ,
      companySize: state?.companySize ,
      keywords: state?.keywords ,
      serviceType: 'website_development',
      maxResults: 10,
    };
  }, [location.state]);

  const [profileData, setProfileData] = useState({ ...initialProfileData });
  const [isSaved, setIsSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const REQUIRED_FIELDS = [
    { key: 'niche',       label: 'Industry / Niche' },
    { key: 'targetRoles', label: 'Target Roles' },
    { key: 'location',    label: 'Geographic Focus' },
    { key: 'companySize', label: 'Company Size' },
    { key: 'keywords',    label: 'Keywords / Tech Stack' },
  ];

  const validate = () => {
    const errors = {};
    REQUIRED_FIELDS.forEach(({ key, label }) => {
      if (!profileData[key]?.trim()) errors[key] = `${label} is required`;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load saved profile from DB on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('startup_name, niche, target_roles, location, company_size, keywords, service_type, max_results')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setProfileData(prev => ({
          ...prev,
          startupName:  data.startup_name  || prev.startupName,
          niche:        data.niche         || prev.niche,
          targetRoles:  data.target_roles  || prev.targetRoles,
          location:     data.location      || prev.location,
          companySize:  data.company_size  || prev.companySize,
          keywords:     data.keywords      || prev.keywords,
          serviceType:  data.service_type  || prev.serviceType,
          maxResults:   data.max_results   || prev.maxResults,
        }));
      });
  }, [user]);

  const industries = [
    'B2B SaaS', 'E-commerce', 'Fintech', 'Healthcare Tech',
    'Logistics & Supply Chain', 'Real Estate', 'EdTech', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await supabase.from('users').update({
      startup_name:  profileData.startupName,
      niche:         profileData.niche,
      target_roles:  profileData.targetRoles,
      location:      profileData.location,
      company_size:  profileData.companySize,
      keywords:      profileData.keywords,
      service_type:  profileData.serviceType,
      max_results:   Number(profileData.maxResults) || 10,
    }).eq('id', user.id);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleGenerateLeads = async () => {
    if (!validate()) {
      setError('Please fill in all required fields before generating leads.');
      return;
    }
    setIsGenerating(true);
    setError('');
    // Auto-save profile before running pipeline
    await supabase.from('users').update({
      startup_name:  profileData.startupName,
      niche:         profileData.niche,
      target_roles:  profileData.targetRoles,
      location:      profileData.location,
      company_size:  profileData.companySize,
      keywords:      profileData.keywords,
      service_type:  profileData.serviceType,
      max_results:   Number(profileData.maxResults) || 10,
    }).eq('id', user.id);

    // Build the niche query: combine niche + first location
    const firstLocation = profileData.location.split(',')[0].trim();
    const nicheQuery = firstLocation
      ? `${profileData.niche} in ${firstLocation}`
      : profileData.niche;

    try {
      const res = await api('/generate-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: nicheQuery,
          service_type: profileData.serviceType,
          max_results: Number(profileData.maxResults) || 10,
          user_id: user?.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const result = await res.json();
      navigate('/dashboard', { state: { result, profileData } });
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-x-hidden p-6 md:p-12 selection:bg-[#ba9eff]/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#8455ef]/10 via-[#060e20] to-[#060e20] pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <span className="text-xs text-[#a3aac4]">{user?.email}</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-[#a3aac4] hover:text-[#dee5ff] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#40485d]/30 pb-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-2">Workspace Configuration</h1>
            <p className="text-[#a3aac4] text-sm">Manage your startup identity and targeting matrix before deploying the agent.</p>
          </div>
          <button
            onClick={handleUpdateProfile}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border transition-all text-sm font-medium tracking-wide ${
              isSaved ? 'bg-[#ba9eff]/10 border-[#ba9eff]/40 text-[#ba9eff]' : 'border-[#40485d]/50 text-[#dee5ff] hover:bg-[#ba9eff]/5 hover:border-[#ba9eff]/40'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 text-[#a3aac4]" />}
            {isSaved ? 'Profile Saved' : 'Save Changes'}
          </button>
        </div>

        <div className="flex flex-col gap-8">

          {/* Core Identity */}
          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-[#40485d]/20 shadow-[0_0_80px_-20px_rgba(186,158,255,0.05)]">
            <h2 className="text-lg font-semibold text-[#dee5ff] flex items-center gap-3 mb-8">
              <Building2 className="w-5 h-5 text-[#ba9eff]" /> Startup Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col relative">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Startup Name</label>
                <div className="border-b border-[#40485d]/30 py-2.5 text-lg text-[#a3aac4] select-none cursor-default">
                  {profileData.startupName || user?.user_metadata?.full_name || '—'}
                </div>
                <span className="text-[10px] text-[#a3aac4]/50 mt-1">Set during sign-up · not editable</span>
              </div>
              <div className="flex flex-col relative group">
                <label className={`text-[11px] uppercase tracking-[0.1em] mb-2 font-medium ${fieldErrors.niche ? 'text-red-400' : 'text-[#ba9eff]'}`}>
                  Industry / Niche {fieldErrors.niche && <span className="normal-case">— {fieldErrors.niche}</span>}
                </label>
                <input name="niche" value={profileData.niche || ''} onChange={handleChange}
                  placeholder="e.g. restaurants, dental clinics"
                  className={`bg-transparent border-b py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] ${fieldErrors.niche ? 'border-red-400/70' : 'border-[#40485d]/50'}`} />
              </div>
            </div>
          </div>

          {/* Targeting Matrix */}
          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-[#40485d]/20 shadow-[0_0_80px_-20px_rgba(186,158,255,0.05)]">
            <h2 className="text-lg font-semibold text-[#dee5ff] flex items-center gap-3 mb-8">
              <Target className="w-5 h-5 text-[#699cff]" /> Targeting Matrix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col relative group">
                <label className={`text-[11px] uppercase tracking-[0.1em] mb-2 font-medium ${fieldErrors.targetRoles ? 'text-red-400' : 'text-[#ba9eff]'}`}>
                  Target Roles {fieldErrors.targetRoles && <span className="normal-case">— {fieldErrors.targetRoles}</span>}
                </label>
                <input name="targetRoles" value={profileData.targetRoles || ''} onChange={handleChange}
                  placeholder="e.g. founders, marketing managers"
                  className={`bg-transparent border-b py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] ${fieldErrors.targetRoles ? 'border-red-400/70' : 'border-[#40485d]/50'}`} />
              </div>
              <div className="flex flex-col relative group">
                <label className={`text-[11px] uppercase tracking-[0.1em] mb-2 font-medium ${fieldErrors.location ? 'text-red-400' : 'text-[#ba9eff]'}`}>
                  Geographic Focus {fieldErrors.location && <span className="normal-case">— {fieldErrors.location}</span>}
                </label>
                <input name="location" value={profileData.location || ''} onChange={handleChange}
                  placeholder="e.g. Delhi, Mumbai"
                  className={`bg-transparent border-b py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] ${fieldErrors.location ? 'border-red-400/70' : 'border-[#40485d]/50'}`} />
              </div>
              <div className="flex flex-col relative group">
                <label className={`text-[11px] uppercase tracking-[0.1em] mb-2 font-medium ${fieldErrors.companySize ? 'text-red-400' : 'text-[#ba9eff]'}`}>
                  Company Size {fieldErrors.companySize && <span className="normal-case">— {fieldErrors.companySize}</span>}
                </label>
                <input name="companySize" value={profileData.companySize || ''} onChange={handleChange}
                  placeholder="e.g. 1-10, 10-50"
                  className={`bg-transparent border-b py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] ${fieldErrors.companySize ? 'border-red-400/70' : 'border-[#40485d]/50'}`} />
              </div>
              <div className="flex flex-col relative group">
                <label className={`text-[11px] uppercase tracking-[0.1em] mb-2 font-medium ${fieldErrors.keywords ? 'text-red-400' : 'text-[#ba9eff]'}`}>
                  Keywords / Tech Stack {fieldErrors.keywords && <span className="normal-case">— {fieldErrors.keywords}</span>}
                </label>
                <input name="keywords" value={profileData.keywords || ''} onChange={handleChange}
                  placeholder="e.g. no website, low reviews"
                  className={`bg-transparent border-b py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] ${fieldErrors.keywords ? 'border-red-400/70' : 'border-[#40485d]/50'}`} />
              </div>
            </div>
          </div>

          {/* Pipeline Config */}
          <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-[#40485d]/20 shadow-[0_0_80px_-20px_rgba(186,158,255,0.05)]">
            <h2 className="text-lg font-semibold text-[#dee5ff] flex items-center gap-3 mb-8">
              <Zap className="w-5 h-5 text-[#ba9eff]" /> Pipeline Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Service Type</label>
                <div className="relative">
                  <select name="serviceType" value={profileData.serviceType} onChange={handleChange}
                    className="w-full bg-[#060e20] border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] appearance-none cursor-pointer">
                    {SERVICE_TYPES.map(s => (
                      <option key={s.value} value={s.value} className="bg-[#060e20] text-[#dee5ff]">{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3aac4] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col relative group">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Max Results</label>
                <input name="maxResults" type="number" min={1} max={50} value={profileData.maxResults} onChange={handleChange}
                  className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]" />
              </div>
            </div>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Deploy */}
        <div className="mt-4 relative w-full rounded-3xl p-[1px] bg-gradient-to-r from-[#ba9eff]/40 via-[#699cff]/20 to-[#ba9eff]/40">
          <div className="w-full bg-[#060e20] rounded-[23px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-semibold text-[#dee5ff] mb-2">Deploy AI Scraper</h3>
              <p className="text-[#a3aac4] text-sm max-w-md">
                Initialize the agent using your targeting matrix. It will scour the web to generate a tailored list of high-intent leads.
              </p>
            </div>
            <button
              onClick={handleGenerateLeads}
              disabled={isGenerating}
              className={`group flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-[#000000] font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                isGenerating
                  ? 'bg-[#a3aac4] cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-[#8455ef] to-[#ba9eff] hover:shadow-[0_0_30px_0_rgba(186,158,255,0.4)] hover:-translate-y-0.5'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#000000]/30 border-t-[#000000] rounded-full animate-spin" />
                  Running pipeline...
                </>
              ) : (
                <>Generate Leads <Zap className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" /></>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
