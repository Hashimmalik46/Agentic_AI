import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function LeadFinderHomepage() {
  const [formData, setFormData] = useState({
    startupName: '',
    niche: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Starting agent flow with:', formData);
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#ba9eff]/30">
      
      {/* Ambient Background Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8455ef]/15 via-[#060e20] to-[#060e20] pointer-events-none" />

      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Hero Typography */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.02em] mb-6 text-[#dee5ff]">
            Find the leads that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">matter.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#a3aac4] max-w-2xl mx-auto">
            Drop your startup details below. Our agent will analyze your niche and instantly generate a targeted pipeline.
          </p>
        </div>

        {/* Input Dock (Glassmorphism) */}
        <div className="w-full max-w-3xl bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-6 sm:p-8 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-left">
              {/* Startup Name Field */}
              <div className="flex-1 flex flex-col relative group">
                <label htmlFor="startupName" className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">
                  Startup Name
                </label>
                <input
                  id="startupName"
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-transparent border-b border-[#40485d]/50 py-3 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                />
              </div>

              {/* Niche Field */}
              <div className="flex-1 flex flex-col relative group">
                <label htmlFor="niche" className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">
                  Niche / Industry
                </label>
                <input
                  id="niche"
                  type="text"
                  required
                  placeholder="e.g. B2B SaaS Logistics"
                  className="w-full bg-transparent border-b border-[#40485d]/50 py-3 text-lg outline-none transition-all duration-300 text-[#dee5ff] placeholder:text-[#a3aac4]/30 focus:border-[#699cff] focus:shadow-[0_15px_30px_-15px_rgba(105,156,255,0.15)]"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                />
              </div>
            </div>

            {/* Action Area */}
            <div className="flex items-center justify-center mt-4 pt-4 border-t border-[#40485d]/20">
              
                
              
              
              <button
                type="submit"
                className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8455ef] to-[#ba9eff] text-[#000000] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold tracking-wide"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}