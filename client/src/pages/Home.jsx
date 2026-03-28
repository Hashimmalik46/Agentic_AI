import React, { useState } from 'react';
import { ArrowRight, Terminal, Check, ArrowLeft, Code } from 'lucide-react';

export default function LeadScraperPipeline() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startupName: '',
    niche: '',
    targetRoles: '',
    location: '',
    companySize: '',
    keywords: ''
  });

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = (e) => {
    e?.preventDefault();
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleExecute = () => {
    console.log('Sending Payload to Scraper:', formData);
    // Add your backend fetch API call here
    alert("JSON payload sent to scraper! Check console.");
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#ba9eff]/30 p-6">
      {/* Ambient Background Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8455ef]/15 via-[#060e20] to-[#060e20] pointer-events-none" />

      <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* --- STEP 1: INITIALIZE PROFILE --- */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-16 text-center">
              <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.02em] mb-6 text-[#dee5ff]">
                Find the leads that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">matter.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#a3aac4] max-w-2xl mx-auto">
                Drop your startup details below. Our AI agent will analyze your niche and construct a scraping matrix.
              </p>
            </div>

            <div className="w-full max-w-3xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-6 sm:p-8 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)]">
              <form onSubmit={nextStep} className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-left">
                  <div className="flex-1 flex flex-col relative group">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Startup Name</label>
                    <input
                      required
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-transparent border-b border-[#40485d]/50 py-3 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                      value={formData.startupName}
                      onChange={(e) => updateForm('startupName', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col relative group">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Niche / Industry</label>
                    <input
                      required
                      placeholder="e.g. B2B SaaS Logistics"
                      className="w-full bg-transparent border-b border-[#40485d]/50 py-3 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                      value={formData.niche}
                      onChange={(e) => updateForm('niche', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#40485d]/20">
                  <button type="submit" className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold tracking-wide">
                    Next Step
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- STEP 2: TARGETING MATRIX --- */}
        {step === 2 && (
          <div className="w-full max-w-2xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 sm:p-12 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)] animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-3">Define Target Matrix</h2>
              <p className="text-[#a3aac4] text-sm leading-relaxed">Provide the specific parameters for the AI agent to begin scraping.</p>
            </div>
            <form onSubmit={nextStep} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Target Roles / Titles</label>
                  <input required placeholder="e.g. CTO, VP of Logistics" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff]" value={formData.targetRoles} onChange={(e) => updateForm('targetRoles', e.target.value)} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Geographic Focus</label>
                  <input required placeholder="e.g. North America, UK" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff]" value={formData.location} onChange={(e) => updateForm('location', e.target.value)} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Company Size</label>
                  <input placeholder="e.g. 50-200 Employees" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff]" value={formData.companySize} onChange={(e) => updateForm('companySize', e.target.value)} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Keywords / Tech Stack</label>
                  <input placeholder="e.g. Shopify, B2B" className="bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff]" value={formData.keywords} onChange={(e) => updateForm('keywords', e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#40485d]/20">
                <button type="button" onClick={prevStep} className="text-[#a3aac4] hover:text-[#dee5ff] transition-colors text-sm font-medium flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" aria-label="Proceed to JSON" className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_25px_0_rgba(186,158,255,0.4)] hover:scale-105 transition-all duration-300">
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- STEP 3: AI COMPILED JSON VIEW --- */}
        {step === 3 && (
          <div className="w-full max-w-3xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 sm:p-12 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)] animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-3 flex items-center gap-3">
                  <Code className="text-[#ba9eff]" /> Generated Scraper Payload
                </h2>
                <p className="text-[#a3aac4] text-sm leading-relaxed">
                  The AI has compiled your context into a structured JSON configuration ready for the scraping engine.
                </p>
              </div>
            </div>

            {/* Terminal Window JSON Display */}
            <div className="bg-[#030712] rounded-xl border border-[#40485d]/40 p-6 font-mono text-sm overflow-x-auto shadow-inner relative group">
              <div className="absolute top-4 right-4 flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#ff6e84]/50"></div>
                 <div className="w-3 h-3 rounded-full bg-[#fbbc04]/50"></div>
                 <div className="w-3 h-3 rounded-full bg-[#ba9eff]/50"></div>
              </div>
              <pre className="text-[#699cff] mt-4">
                <code dangerouslySetInnerHTML={{ __html: JSON.stringify({
                  "task": "lead_generation_scrape",
                  "client_context": {
                    "startup": formData.startupName,
                    "industry_niche": formData.niche
                  },
                  "targeting_parameters": {
                    "roles": formData.targetRoles.split(',').map(s => s.trim()).filter(Boolean),
                    "locations": formData.location.split(',').map(s => s.trim()).filter(Boolean),
                    "company_size": formData.companySize,
                    "search_keywords": formData.keywords.split(',').map(s => s.trim()).filter(Boolean)
                  },
                  "output_format": "json_array",
                  "status": "ready_for_execution"
                }, null, 2).replace(/"(.*?)":/g, '<span class="text-[#ba9eff]">"$1":</span>')
                          .replace(/null/g, '<span class="text-[#ff6e84]">null</span>') }} />
              </pre>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#40485d]/20">
              <button type="button" onClick={prevStep} className="text-[#a3aac4] hover:text-[#dee5ff] transition-colors text-sm font-medium flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Edit Parameters
              </button>
              
              <button onClick={handleExecute} className="group flex items-center gap-3 px-8 py-3.5 rounded-xl bg-[#dee5ff] text-[#000000] hover:bg-[#ffffff] hover:shadow-[0_0_30px_0_rgba(222,229,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold tracking-wide">
                Execute Scraper
                <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}