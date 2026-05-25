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
          const findVal = (obj, keys) => {
            const foundKey = Object.keys(obj).find(k => keys.includes(k.toLowerCase().trim()));
            return foundKey ? obj[foundKey] : undefined;
          };

          const data = results.data.map(item => {
              if (type === 'products') {
                  const indeks = findVal(item, ['indeks', 'index', 'kod']);
                  const cenaRaw = findVal(item, ['cena', 'price', 'wartosc']) || "0";

                  if (!indeks) return null;

                  return {
                      indeks: indeks.toString().trim(),
                      ean: findVal(item, ['ean', 'kod kreskowy']) || '',
                      nazwa: findVal(item, ['nazwa', 'name', 'produkt']) || 'Produkt bez nazwy',
                      cena: parseFloat(cenaRaw.toString().replace(',', '.')) || 0
                  };
              }
              if (type === 'users') {
                  const email = findVal(item, ['email', 'login', 'uzytkownik']);
                  const password = findVal(item, ['haslo', 'password', 'pass']);

                  if (!email || !password) return null;

                  return {
                      email: email.toString().trim(),
                      password: password.toString().trim(),
                      name: findVal(item, ['nazwa', 'name', 'imie']) || email,
                      role: findVal(item, ['rola', 'role']) || 'user'
                  };
              }
              return item;
          }).filter(i => i !== null);

          if (data.length === 0) throw new Error("Nie znaleziono poprawnych danych w pliku CSV.");

          await adminAction('import', type, data);
          setStatus({ type: 'success', message: `Import zakończony sukcesem. Zaimportowano ${data.length} pozycji.` });
        } catch (err) {
          setStatus({ type: 'error', message: `Błąd importu: ${err.message || 'Nieznany błąd'}` });
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