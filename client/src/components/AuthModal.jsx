import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  
  // Registration fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('trainee'); // trainee, trainer
  const [organization, setOrganization] = useState('India Meteorological Department (IMD)');
  const [department, setDepartment] = useState('National Weather Forecasting Centre (NWFC)');
  const [designation, setDesignation] = useState('Scientific Assistant');
  const [degree, setDegree] = useState('M.Sc. Atmospheric Sciences');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const res = await api.login(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onAuthSuccess(res.user);
          onClose();
        }
      } else {
        // Register Flow
        const res = await api.register({
          name,
          email,
          password,
          role,
          organization,
          department,
          designation,
          qualifications: [{ degree, institute: 'MoES Affiliated University', year: '2024' }]
        });

        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(res.message);
          if (role === 'trainer') {
            // Inform about pending approval
            setTimeout(() => {
              setIsLogin(true);
              setEmail(email);
            }, 3000);
          } else {
            // Auto login trainee
            setTimeout(() => {
              onAuthSuccess(res.user);
              onClose();
            }, 1500);
          }
        }
      }
    } catch (err) {
      setErrorMsg('Network error communicating with MoES server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official MoES Authentication Portal</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Sign In to Capacity Connect' : 'New Officer / Faculty Registration'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Access specialized capacity building modules, examinations & records.
          </p>
        </div>

        {/* Toggle between Login and Register */}
        <div className="flex border-b border-slate-200 text-xs font-bold text-center">
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 transition-colors ${
              isLogin ? 'border-b-2 border-sky-600 text-sky-600 bg-sky-50/50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Registered Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 transition-colors ${
              !isLogin ? 'border-b-2 border-sky-600 text-sky-600 bg-sky-50/50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dr. Rajeshwar Rao or Ananya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">User Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden"
                  >
                    <option value="trainee">Trainee Officer</option>
                    <option value="trainer">Trainer (Faculty)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Institution</label>
                  <select
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden"
                  >
                    <option value="India Meteorological Department (IMD)">IMD</option>
                    <option value="IITM Pune">IITM</option>
                    <option value="NCMRWF Noida">NCMRWF</option>
                    <option value="INCOIS Hyderabad">INCOIS</option>
                    <option value="NIOT Chennai">NIOT</option>
                  </select>
                </div>
              </div>

              {role === 'trainer' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-snug">
                  <strong>Notice:</strong> Faculty accounts require administrative review and verification before course authoring privileges are activated.
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                required
                placeholder="officer@imd.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            {isLogin && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                (Demo password for pre-seeded accounts: <code>password123</code>)
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Portal' : 'Submit Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
