import React, { useState } from 'react';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passScore = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#ba9eff]/30 p-6">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8455ef]/15 via-[#060e20] to-[#060e20] pointer-events-none" />

      <main className="relative z-10 w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-[#091328]/60 backdrop-blur-[20px] rounded-3xl p-8 border border-t-[#ba9eff]/20 border-b-[#699cff]/10 border-x-transparent shadow-[0_0_80px_-20px_rgba(186,158,255,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#dee5ff] mb-2">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ba9eff] to-[#699cff]">Workspace</span>
            </h1>
            <p className="text-[#a3aac4] text-sm">
              Initialize your lead generation pipeline today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col relative group animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Full Name</label>
              <input 
                required 
                type="text"
                placeholder="e.g. Jane Doe" 
                className="w-full bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] placeholder:text-[#a3aac4]/50" 
                value={formData.name} 
                onChange={(e) => updateForm('name', e.target.value)} 
              />
            </div>

            <div className="flex flex-col relative group">
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] mb-2 font-medium">Email Address</label>
              <input 
                required 
                type="email"
                placeholder="e.g. name@company.com" 
                className="w-full bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] placeholder:text-[#a3aac4]/50" 
                value={formData.email} 
                onChange={(e) => updateForm('email', e.target.value)} 
              />
            </div>

            <div className="flex flex-col relative group">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#ba9eff] font-medium">Password</label>
              </div>
              <input 
                required 
                type="password"
                placeholder="••••••••" 
                className="w-full bg-transparent border-b border-[#40485d]/50 py-2.5 text-lg outline-none transition-all duration-300 text-[#dee5ff] focus:border-[#699cff] placeholder:text-[#a3aac4]/50 tracking-widest" 
                value={formData.password} 
                onChange={(e) => updateForm('password', e.target.value)} 
              />
              
              {formData.password.length > 0 && (
                <div className="flex gap-1 mt-3 animate-in fade-in duration-300">
                  <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${passScore > 0 ? 'bg-[#ff6b6b]' : 'bg-[#40485d]/50'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${passScore > 1 ? 'bg-[#feca57]' : 'bg-[#40485d]/50'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${passScore > 2 ? 'bg-[#1dd1a1]' : 'bg-[#40485d]/50'}`} />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`group flex items-center justify-center gap-2 mt-4 w-full py-3.5 rounded-xl text-[#000000] font-bold tracking-wide transition-all duration-300 ${
                isLoading 
                  ? 'bg-[#a3aac4] opacity-80 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#8455ef] to-[#ba9eff] hover:shadow-[0_0_20px_0_rgba(186,158,255,0.3)] hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
              ) : (
                <>
                  Initialize Workspace 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {/* Social Auth */}
            <div className="relative flex items-center py-2 mt-2">
              <div className="flex-grow border-t border-[#40485d]/40" />
              <span className="flex-shrink-0 mx-4 text-[#a3aac4] text-[10px] tracking-wider uppercase font-medium">Or continue with</span>
              <div className="flex-grow border-t border-[#40485d]/40" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#060e20]/50 border border-[#40485d]/40 text-[#dee5ff] hover:bg-[#060e20] hover:border-[#699cff]/30 transition-all duration-300 text-sm font-medium">
                <Mail className="w-4 h-4" /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#060e20]/50 border border-[#40485d]/40 text-[#dee5ff] hover:bg-[#060e20] hover:border-[#699cff]/30 transition-all duration-300 text-sm font-medium">
                <Mail className="w-4 h-4" /> Google
              </button>
            </div>
            
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 text-center text-sm text-[#a3aac4]">
            Already have a workspace?{" "}
            <Link 
              to="/"
              className="font-medium text-[#dee5ff] hover:text-[#ba9eff] transition-colors focus:outline-none"
            >
              Log in
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}