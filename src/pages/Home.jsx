import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { TreePine, Download, Loader2 } from 'lucide-react';
import { getCatalogs } from '../api';

const Home = () => {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatalogs().then(setCatalogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20 font-sans">
      <Header />
      {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-brunnen-blue" size={40} /> : (
        <div className="max-w-[1200px] mx-auto px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <div key={catalog._id} onClick={() => navigate(`/reader/${catalog._id}`)} className="bg-white border-2 border-brunnen-blue rounded-2xl p-6 text-center cursor-pointer hover:shadow-xl transition-all relative overflow-hidden">
              {catalog.isChristmas && <div className="absolute top-2 left-2 bg-green-800 text-white px-2 py-1 rounded-full text-[9px] font-bold uppercase flex items-center gap-1"><TreePine size={10} /> Oferta świąteczna</div>}
              <img src={catalog.logo} className="h-12 mx-auto mb-4 object-contain" onError={(e) => e.target.src="https://via.placeholder.com/100x50?text=Brand"} />
              <h3 className="text-brunnen-blue font-bold border-b pb-2 mb-2">{catalog.title}</h3>
              <p className="text-xs text-slate-500 flex-1">{catalog.description}</p>
              <a href={catalog.url} target="_blank" className="mt-4 px-4 py-2 border border-brunnen-blue text-brunnen-blue rounded-full text-[10px] font-bold hover:bg-brunnen-blue hover:text-white flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Download size={14} /> Pobierz PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Home;