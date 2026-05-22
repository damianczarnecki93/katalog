import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Phone, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white px-8 py-5 shadow-md mb-8 flex justify-between items-center flex-wrap gap-5">
      <div className="flex items-center gap-6">
        <Link to="/">
          <img src="/logo.png" alt="E-Dekor Logo" className="max-w-[160px] h-auto block" onError={(e) => { e.target.src="https://via.placeholder.com/160x50?text=E-Dekor"; }} />
        </Link>
        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors">
            <Settings size={16} /> Panel Admina
          </Link>
        )}
      </div>
      <div className="flex gap-8 text-xs flex-wrap items-start">
        <div className="flex flex-col">
          <div className="text-[#004b97] font-extrabold mb-1 text-sm uppercase">Damian</div>
          <div className="font-semibold leading-relaxed">
            <a href="tel:+48663011424" className="flex items-center gap-1.5"><Phone size={12} /> 663 011 424</a>
            <a href="mailto:damian.czarnecki@e-dekor.pl" className="flex items-center gap-1.5"><Mail size={12} /> damian.czarnecki@e-dekor.pl</a>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-[#004b97] font-extrabold mb-1 text-sm uppercase">Bartosz</div>
          <div className="font-semibold leading-relaxed">
            <a href="tel:+48603945001" className="flex items-center gap-1.5"><Phone size={12} /> 603 945 001</a>
            <a href="mailto:bartosz.redlinski@e-dekor.pl" className="flex items-center gap-1.5"><Mail size={12} /> bartosz.redlinski@e-dekor.pl</a>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4 pl-4 border-l">
          <div className="text-right font-bold text-slate-800 text-sm">
            {user?.name}
            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{user?.role === 'admin' ? 'Administrator' : 'Klient'}</div>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;