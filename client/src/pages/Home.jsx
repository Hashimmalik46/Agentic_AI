import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, ChevronDown, UserCircle } from 'lucide-react';
import { supabase } from '/lib/supabaseClient.jsx'; // Adjust path as needed

export default function LeadScraperPipeline() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startupName: '',
    niche: '', 
    targetRoles: '',
    location: '',
    companySize: '',
    keywords: ''
  });

  const industries = [
    'B2B SaaS', 'E-commerce', 'Fintech', 'Healthcare Tech', 
    'Logistics & Supply Chain', 'Real Estate', 'EdTech', 'Other'
  ];

  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const nextStep = (e) => { e?.preventDefault(); setStep(prev => prev + 1); };
  const prevStep = () => setStep(prev => prev - 1);

  const renderTags = (inputString) => {
    if (!inputString) return <span className="text-[#a3aac4] text-sm">Not specified</span>;
    const items = inputString.split(',').map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
        {items.map((item, idx) => (
          <span key={idx} className="bg-[#ba9eff]/10 border border-[#ba9eff]/20 text-[#ba9eff] px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide shadow-[0_0_10px_0_rgba(186,158,255,0.05)]">
            {item}
          </span>
        ))}
      </div>
    );
  };

  const handleSubmitDetails = async () => {
    setIsSubmitting(true);
    try {
      const rolesArray = formData.targetRoles.split(',').map(s => s.trim()).filter(Boolean);
      const locationsArray = formData.location.split(',').map(s => s.trim()).filter(Boolean);
      const keywordsArray = formData.keywords.split(',').map(s => s.trim()).filter(Boolean);

      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([{ startup_name: formData.startupName, industry: formData.niche }])
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      const { error: campaignError } = await supabase
        .from('scraping_campaigns')
        .insert([{
            workspace_id: workspaceData.id,
            target_roles: rolesArray,
            locations: locationsArray,
            company_size: formData.companySize,
            keywords: keywordsArray,
            status: 'profile_initialized'
        }]);

      if (campaignError) throw campaignError;

      navigate('/profile');

    } catch (error) {
      console.error('Error saving details:', error.message);
      alert('Failed to save profile. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#ba9eff]/30 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8455ef]/15 via-[#060e20] to-[#060e20] pointer-events-none" />

      <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* STEP 1: INITIALIZE */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-16 text-center">
              <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.02em] mb-6 text-[#dee5ff]">
                Find the leads that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">matter.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#a3aac4] max-w-2xl mx-auto">Drop your startup details below to initialize your workspace.</p>
            </div>
            <div className="w-full max-w-3xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-6 sm:p-8 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)]">
              <form onSubmit={nextStep} className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-left">
                  <div className="flex-1 flex flex-col relative group">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Startup Name</label>
                    <input required placeholder="e.g. Acme Corp" className="w-full bg-transparent border-b border-[#40485d]/50 py-3 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]" value={formData.startupName} onChange={(e) => updateForm('startupName', e.target.value)} />
                  </div>
                  <div className="flex-1 flex flex-col relative group">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Industry</label>
                    <div className="relative w-full">
                      <select required className="w-full bg-transparent border-b border-[#40485d]/50 py-3 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] appearance-none cursor-pointer" value={formData.niche} onChange={(e) => updateForm('niche', e.target.value)}>
                        <option value="" disabled className="bg-[#060e20] text-[#a3aac4]">Select your industry...</option>
                        {industries.map(ind => <option key={ind} value={ind} className="bg-[#060e20] text-[#dee5ff]">{ind}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3aac4] pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#40485d]/20">
                  <button type="submit" className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold tracking-wide">
                    Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: TARGETING MATRIX */}
        {step === 2 && (
          <div className="w-full max-w-2xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 sm:p-12 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)] animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-3">Define Target Matrix</h2>
              <p className="text-[#a3aac4] text-sm">Provide the initial parameters for your workspace.</p>
            </div>
            <form onSubmit={nextStep} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Target Roles (Comma Separated)</label>
                  <input required placeholder="e.g. CTO, VP of Logistics" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]" value={formData.targetRoles} onChange={(e) => updateForm('targetRoles', e.target.value)} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Locations (Comma Separated)</label>
                  <input required placeholder="e.g. North America, UK" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]" value={formData.location} onChange={(e) => updateForm('location', e.target.value)} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Company Size</label>
                  <input placeholder="e.g. 50-200 Employees" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]" value={formData.companySize} onChange={(e) => updateForm('companySize', e.target.value)} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Keywords (Comma Separated)</label>
                  <input placeholder="e.g. Shopify, B2B" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff]" value={formData.keywords} onChange={(e) => updateForm('keywords', e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#40485d]/20">
                <button type="button" onClick={prevStep} className="text-[#a3aac4] hover:text-[#dee5ff] transition-colors text-sm font-medium flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button type="submit" className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_25px_0_rgba(186,158,255,0.4)] hover:scale-105 transition-all duration-300"><ArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} /></button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: OVERVIEW & SUBMIT */}
        {step === 3 && (
          <div className="w-full max-w-2xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 sm:p-12 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)] animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-3 flex items-center gap-3"><CheckCircle2 className="text-[#ba9eff] w-8 h-8" /> Profile Overview</h2>
              <p className="text-[#a3aac4] text-sm">Review your workspace details before finalizing your profile.</p>
            </div>
            <div className="bg-[#060e20]/50 border border-[#40485d]/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-inner">
              <p className="text-[#dee5ff] text-lg leading-relaxed">
                Setting up workspace for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff] font-semibold">{formData.startupName}</span> in the <span className="text-[#dee5ff] font-semibold border-b border-[#ba9eff]/50 pb-0.5">{formData.niche}</span> sector.
              </p>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#40485d]/50 to-transparent" />
              <div className="space-y-6 text-[#a3aac4]">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3"><strong className="text-[#dee5ff] min-w-[120px] mt-1.5">Target Roles:</strong> <div className="flex-1">{renderTags(formData.targetRoles)}</div></div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3"><strong className="text-[#dee5ff] min-w-[120px] mt-1.5">Locations:</strong> <div className="flex-1">{renderTags(formData.location)}</div></div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"><strong className="text-[#dee5ff] min-w-[120px]">Company Size:</strong> <span className="text-[#dee5ff] bg-[#060e20] border border-[#40485d]/50 px-3 py-1.5 rounded-lg text-sm">{formData.companySize || 'Any size'}</span></div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3"><strong className="text-[#dee5ff] min-w-[120px] mt-1.5">Keywords:</strong> <div className="flex-1">{renderTags(formData.keywords)}</div></div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#40485d]/20">
              <button type="button" onClick={prevStep} className="text-[#a3aac4] hover:text-[#dee5ff] transition-colors text-sm font-medium flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Edit Parameters</button>
              
              <button 
                onClick={handleSubmitDetails} 
                disabled={isSubmitting}
                className={`group flex items-center gap-2 px-8 py-3.5 rounded-xl text-[#000000] hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold tracking-wide ${isSubmitting ? 'bg-[#a3aac4] cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-[#8455ef] to-[#ba9eff] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)]'}`}
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-[#000000]/30 border-t-[#000000] rounded-full animate-spin" /> Saving...</>
                ) : (
                  <>Submit Details <UserCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
