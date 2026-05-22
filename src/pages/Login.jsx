import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { login as loginApi } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      login(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd logowania.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
            <img src="/logo.png" alt="Logo" className="max-w-[160px] mx-auto mb-6" onError={(e) => e.target.src="https://via.placeholder.com/160x50?text=E-Dekor"} />
            <h2 className="text-2xl font-bold text-slate-800">Zaloguj się</h2>
        </div>
        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm mb-6 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200" placeholder="Hasło" required />
          <button type="submit" disabled={loading} className="w-full py-4 bg-brunnen-blue text-white rounded-2xl font-bold hover:bg-blue-800 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <LogIn />} Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;