import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ChevronLeft, ChevronRight, Download, FileUp, Loader2, Plus, Minus, X, ShoppingCart, Trash2, FileJson, FileType, Copy, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useCart } from '../context/CartContext';
import { getProducts, getCatalogs } from '../api';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Reader = () => {
  const { catalogId } = useParams();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.4);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const catalogs = await getCatalogs();
        const found = catalogs.find(c => c._id === catalogId);
        if (found) {
          setCatalog(found);
          loadPdf(found.url);
        } else { navigate('/'); }
      } catch (err) { navigate('/'); }
    };
    fetchCatalog();
  }, [catalogId]);

  const loadPdf = async (url) => {
    setPdfLoading(true);
    const proxyUrls = [url, `https://corsproxy.io/?url=${encodeURIComponent(url)}` ];
    for (const pUrl of proxyUrls) {
      try {
        const pdf = await pdfjsLib.getDocument(pUrl).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPdfLoading(false);
        return;
      } catch (e) { console.warn(e); }
    }
    setPdfLoading(false);
    setPdfError('cors_error');
  };

  const handleManualUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const pdf = await pdfjsLib.getDocument(new Uint8Array(ev.target.result)).promise;
      setPdfDoc(pdf); setTotalPages(pdf.numPages); setPdfError(null);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleIndexClick = async (text) => {
    try {
      const product = await getProducts(text.trim());
      if (product) { setSelectedProduct(product); setQuantity(1); }
    } catch (err) { console.log("Not found"); }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-brunnen-blue text-white font-bold text-xs rounded-xl flex items-center gap-2">
          <ChevronLeft size={16} /> Powrót
        </button>
        {totalPages > 0 && (
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border text-xs font-bold">
            Strona {currentPage} z {totalPages}
          </div>
        )}
        <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 bg-slate-100 rounded-lg"><Minus size={14} /></button>
            <span className="text-[10px] font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 bg-slate-100 rounded-lg"><Plus size={14} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-200 custom-scrollbar scroll-smooth" id="pdf-viewer">
        {pdfLoading ? <Loader2 className="animate-spin mx-auto mt-20 text-brunnen-blue" size={40} /> : 
         pdfError ? (
           <div className="max-w-md mx-auto bg-white p-8 rounded-3xl text-center shadow-xl">
             <AlertTriangle className="mx-auto text-rose-500 mb-4" size={48} />
             <h3 className="font-bold mb-2">Błąd wczytywania (CORS)</h3>
             <p className="text-xs text-slate-500 mb-6">Serwer blokuje dostęp. Pobierz plik i wgraj go ręcznie.</p>
             <button onClick={() => fileInputRef.current.click()} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
               <FileUp size={16} /> Wgraj plik PDF
             </button>
             <input type="file" ref={fileInputRef} onChange={handleManualUpload} className="hidden" accept=".pdf" />
           </div>
         ) : (
           <div className="flex flex-col items-center gap-6">
             {Array.from({length: totalPages}, (_, i) => (
               <PdfPage key={i+1} pdf={pdfDoc} pageNum={i+1} zoom={zoom} onIndexClick={handleIndexClick} onVisible={() => setCurrentPage(i+1)} />
             ))}
           </div>
         )}
      </div>

      {selectedProduct && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-3xl p-6 w-80 shadow-2xl border border-blue-100 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-extrabold text-slate-800">{selectedProduct.nazwa}</h3>
            <button onClick={() => setSelectedProduct(null)}><X size={20} className="text-slate-300" /></button>
          </div>
          <div className="text-xs space-y-1 mb-4 text-slate-500">
            <p>Indeks: <span className="font-bold text-slate-700">{selectedProduct.indeks}</span></p>
            <p className="text-xl font-black text-brunnen-blue pt-2">{selectedProduct.cena.toFixed(2)} zł</p>
          </div>
          <div className="flex items-center gap-3 mb-6 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">-</button>
            <input type="number" value={quantity} readOnly className="w-full bg-transparent text-center font-bold" />
            <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">+</button>
          </div>
          <button onClick={() => { addToCart(selectedProduct, quantity); setSelectedProduct(null); }} className="w-full py-4 bg-brunnen-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
            <ShoppingCart size={20} /> Dodaj do listy
          </button>
        </div>
      )}
      <CartFloating />
    </div>
  );
};

const PdfPage = ({ pdf, pageNum, zoom, onIndexClick, onVisible }) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dim, setDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) { setIsVisible(true); onVisible(); } }, { threshold: 0.1 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !pdf) return;
    const render = async () => {
      const page = await pdf.getPage(pageNum);
      const vp = page.getViewport({ scale: zoom });
      setDim({ w: vp.width, h: vp.height });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.height = vp.height; canvas.width = vp.width;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const textContent = await page.getTextContent();
      const tl = textLayerRef.current;
      tl.innerHTML = ''; tl.style.width = vp.width+'px'; tl.style.height = vp.height+'px';
      await pdfjsLib.renderTextLayer({ textContentSource: textContent, container: tl, viewport: vp, textDivs: [] }).promise;
      tl.querySelectorAll('span').forEach(s => { if(s.textContent.trim().length > 5) s.classList.add('matched-product'); });
    };
    render();
  }, [isVisible, pdf, zoom]);

  return (
    <div ref={containerRef} id={`pdf-page-${pageNum}`} className="pdf-canvas-container bg-white relative" style={{ width: dim.w || 500, height: dim.h || 700 }} onClick={e => e.target.tagName === 'SPAN' && onIndexClick(e.target.textContent)}>
      <canvas ref={canvasRef}></canvas>
      <div ref={textLayerRef} className="textLayer absolute top-0 left-0"></div>
    </div>
  );
};

const CartFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [opiekun, setOpiekun] = useState('damian');
  const { cart, removeFromCart, clearCart, totals, discount, setDiscount } = useCart();

  const sendToOpiekun = () => {
    const email = opiekun === 'damian' ? 'damian.czarnecki@e-dekor.pl' : 'bartosz.redlinski@e-dekor.pl';
    let body = `Zamówienie:\n\n` + cart.map(i => `- [${i.indeks}] ${i.nazwa} | Ilość: ${i.qty}`).join('\n');
    window.location.href = `mailto:${email}?subject=Zamówienie&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border w-[350px] h-[500px] mb-4 flex flex-col overflow-hidden animate-fade-in">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
            <span className="font-bold">Twój Koszyk ({cart.length})</span>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {cart.map((item, idx) => (
              <div key={item.id} className="flex justify-between items-center mb-3 border-b pb-2 text-xs">
                <div><p className="font-bold">{item.nazwa}</p><p className="text-slate-400">{item.indeks} x {item.qty}</p></div>
                <button onClick={() => removeFromCart(idx)} className="text-rose-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 border-t">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setOpiekun('damian')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${opiekun==='damian'?'bg-brunnen-blue text-white':'bg-white border'}`}>Damian</button>
              <button onClick={() => setOpiekun('bartosz')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${opiekun==='bartosz'?'bg-brunnen-blue text-white':'bg-white border'}`}>Bartosz</button>
            </div>
            <div className="flex justify-between items-center font-bold mb-4">
                <span className="text-sm">Suma:</span>
                <span className="text-lg text-brunnen-blue">{totals.total.toFixed(2)} zł</span>
            </div>
            <button onClick={sendToOpiekun} disabled={cart.length===0} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <Mail size={18} /> Wyślij do opiekuna
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen?'bg-slate-800':'bg-brunnen-blue'}`}>
        <ShoppingCart size={24} className="text-white" />
        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
      </button>
    </div>
  );
};

export default Reader;