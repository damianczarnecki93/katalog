import React, { useState } from 'react';
import Header from '../components/Header';
import { Upload, Users, ShoppingBag, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { adminAction } from '../api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: async (results) => {
        try {
          const data = results.data.map(item => {
              if (type === 'products') {
                  return {
                      indeks: item.Indeks,
                      ean: item.EAN,
                      nazwa: item.Nazwa,
                      cena: parseFloat((item.Cena || "0").toString().replace(',', '.'))
                  };
              }
              if (type === 'users') {
                  return {
                      email: item.Email,
                      password: item.Haslo,
                      name: item.Nazwa,
                      role: item.Rola || 'user'
                  };
              }
              return item;
          });
          await adminAction('import', type, data);
          setStatus({ type: 'success', message: `Import zakończony sukcesem.` });
        } catch (err) {
          setStatus({ type: 'error', message: 'Błąd importu.' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <div className="max-w-[1000px] mx-auto px-5">
        <h1 className="text-3xl font-black text-slate-800 mb-8">Panel Administratora</h1>
        <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm">
            <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'products' ? 'bg-brunnen-blue text-white' : 'text-slate-500'}`}>Produkty</button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'users' ? 'bg-brunnen-blue text-white' : 'text-slate-500'}`}>Użytkownicy</button>
        </div>
        {status && <div className={`p-4 rounded-xl mb-4 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.message}</div>}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <input type="file" onChange={(e) => handleFileUpload(e, activeTab)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {loading && <Loader2 className="animate-spin mt-4 mx-auto" />}
        </div>
      </div>
    </div>
  );
};
export default Admin;