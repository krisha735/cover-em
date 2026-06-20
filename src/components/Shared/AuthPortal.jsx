import React, { useState } from 'react';

export default function AuthPortal({ onAuthSuccess, usersDb, setUsersDb }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return setError('Please input all details.');

    if (isRegistering) {
      if (usersDb[form.username]) return setError('Username already registered!');
      
      const newUserDb = { 
        ...usersDb, 
        [form.username]: { username: form.username, password: form.password, linkedAccounts: [] } 
      };
      setUsersDb(newUserDb);
      setIsRegistering(false);
      setError('Registration complete. Proceed to Login Form!');
    } else {
      const user = usersDb[form.username];
      if (!user || user.password !== form.password) return setError('Invalid identity credentials matched.');
      onAuthSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
        
        <div className="mb-6 text-center">
          <span className="text-[18px] uppercase font-mono tracking-widest font-bold text-teal-400">C.OVER: The Unified Dashboard</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            {isRegistering ? 'Registration Form' : 'Login Form'}
          </h1>
        </div>

        {error && <div className="bg-slate-950 border border-slate-800 text-teal-400 text-xs p-3 rounded-lg mb-4 font-mono">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-1">Username</label>
            <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500" value={form.username} onChange={(e)=>setForm({...form, username: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-400 mb-1">Password</label>
            <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 text-sm font-bold uppercase tracking-wider py-3 rounded-xl mt-4">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-xs text-slate-400 hover:text-white font-medium underline">
            {isRegistering ? 'Already Registered? Login Now' : 'Not Registered! Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
