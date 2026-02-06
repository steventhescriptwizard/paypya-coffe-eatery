import React, { useRef } from 'react';
import { Order } from '../types';
import { formatIDR } from '../utils/format';

interface InvoicePageProps {
  order: Order;
  onBack: () => void;
}

declare global {
  interface Window {
    html2pdf: any;
  }
}

export const InvoicePage: React.FC<InvoicePageProps> = ({ order, onBack }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;
    
    const element = invoiceRef.current;
    const opt = {
      margin: 0,
      filename: `Invoice-${order.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // New Promise-based usage:
    window.html2pdf().set(opt).from(element).save();
  };

  const handleShareWhatsApp = () => {
    const whatsappNumber = "6282324093711"; // Staff number
    let message = `*INVOICE ORDER #${order.id}*\n`;
    message += `Customer: ${order.customerName || 'Guest'}\n`;
    if (order.tableNumber) message += `Meja: ${order.tableNumber}\n`;
    message += `Tanggal: ${new Date(order.date).toLocaleDateString()}\n`;
    message += `Total: ${formatIDR(order.total)}\n\n`;
    message += `Detail Pesanan:\n`;
    order.items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${formatIDR(item.price * item.quantity)})\n`;
    });
    message += `\nTerima kasih telah memesan di PAYPYA Cafe! 🙏`;
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 py-8 px-4 animate-fade-in print:bg-white print:p-0">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .animate-fade-in {
            animation: none !important;
          }
        }
      `}</style>

      {/* Navigation - Hidden when printing */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors font-medium"
        >
          <span className="material-symbols-outlined font-variation-settings-fill">arrow_back</span>
          Back
        </button>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            WhatsApp
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Save PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print
          </button>
        </div>
      </div>

      {/* Invoice Content container */}
      <div ref={invoiceRef} className="max-w-3xl mx-auto bg-white dark:bg-[#2c241b] rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none dark:print:bg-white dark:print:text-black">
        {/* Invoice Header */}
        <div className="bg-primary/5 dark:bg-white/5 p-8 sm:p-12 border-b border-[#e6e0db] dark:border-white/10 print:bg-gray-50 dark:print:bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-primary mb-6">
                <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                   <span className="material-symbols-outlined text-2xl font-variation-settings-fill">restaurant_menu</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white dark:print:text-black leading-none">PAYPYA</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Cafe & Resto</p>
                </div>
              </div>
              <div className="text-xs text-text-secondary dark:text-gray-400 dark:print:text-gray-600 space-y-1">
                <p className="font-bold text-text-main dark:text-white dark:print:text-black">PAYPYA Cafe & Resto</p>
                <p>Jl. Jend. Sudirman Kav. 52-53, SCBD</p>
                <p>Jakarta Selatan, 12190</p>
                <p>hello@paypya.com | (021) 555-0123</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-black text-slate-200 dark:text-white/10 dark:print:text-gray-200 mb-1 leading-none select-none">INVOICE</h2>
              <p className="text-primary font-black text-xl mb-4">#{order.id}</p>
              <div className="text-xs text-text-secondary dark:text-gray-400 dark:print:text-gray-600 space-y-1">
                <p>Date: <span className="font-bold text-text-main dark:text-white dark:print:text-black">{new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                <p>Time: <span className="font-bold text-text-main dark:text-white dark:print:text-black">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                <div className="flex justify-end pt-2">
                  <span className={`font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-lg ${
                    order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Info Section */}
        <div className="px-8 sm:px-12 py-8 bg-[#fdfdfd] dark:bg-white/2 border-b border-[#e6e0db] dark:border-white/10 grid grid-cols-2 gap-8">
           <div>
              <p className="text-[10px] font-black text-text-secondary dark:text-gray-500 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="text-lg font-black text-text-main dark:text-white dark:print:text-black leading-tight mb-1">
                {order.customerName || 'Guest Customer'}
              </h3>
              {order.tableNumber && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-md">
                   <span className="material-symbols-outlined text-sm font-variation-settings-fill">table_restaurant</span>
                   <span className="text-xs font-black tracking-tight">Table {order.tableNumber}</span>
                </div>
              )}
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-text-secondary dark:text-gray-500 uppercase tracking-widest mb-2">Payment Status</p>
              <div className="flex items-center justify-end gap-2 text-emerald-600 font-black">
                 <span className="material-symbols-outlined text-lg">check_circle</span>
                 <span className="text-sm">Paid via Counter</span>
              </div>
              <p className="text-[10px] text-text-secondary opacity-60 mt-1 italic">Vat Inc. 10%</p>
           </div>
        </div>

        {/* Items Table */}
        <div className="p-8 sm:p-12">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-900/5 dark:border-white/10 text-[10px] uppercase font-black tracking-[0.2em] text-text-secondary dark:text-gray-500">
                  <th className="pb-6">Item Description</th>
                  <th className="pb-6 text-center">Qty</th>
                  <th className="pb-6 text-right">Unit Price</th>
                  <th className="pb-6 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-text-main dark:text-white dark:print:text-black">
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b border-[#f4f2f0] dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                    <td className="py-6 pr-4">
                      <p className="font-bold text-base leading-tight mb-0.5">{item.name}</p>
                      <p className="text-xs text-text-secondary dark:text-gray-400 dark:print:text-gray-500 line-clamp-1 opacity-70 italic">{item.description}</p>
                    </td>
                    <td className="py-6 text-center font-bold">{item.quantity}</td>
                    <td className="py-6 text-right whitespace-nowrap opacity-70 tracking-tight">{formatIDR(item.price)}</td>
                    <td className="py-6 text-right font-black whitespace-nowrap text-primary tracking-tight text-base">{formatIDR(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-12 pt-8 border-t-2 border-slate-900/5 dark:border-white/10 flex justify-end">
            <div className="w-full sm:w-72 space-y-4">
              <div className="flex justify-between text-text-secondary dark:text-gray-400 dark:print:text-gray-600">
                <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                <span className="font-black text-text-main dark:text-white dark:print:text-black tracking-tight">{formatIDR(order.total)}</span>
              </div>
              <div className="flex justify-between text-text-secondary dark:text-gray-400 dark:print:text-gray-600">
                <span className="text-xs font-bold uppercase tracking-wider">Service Fee</span>
                <span className="font-black text-text-main dark:text-white dark:print:text-black tracking-tight">{formatIDR(0)}</span>
              </div>
              <div className="flex justify-between items-center bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10">
                <span className="text-sm font-black text-text-main dark:text-white dark:print:text-black uppercase tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-primary tracking-tighter">{formatIDR(order.total)}</span>
              </div>
            </div>
          </div>
          
          {/* Footer Branding */}
          <div className="mt-24 pt-12 border-t border-dashed border-[#e6e0db] dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 opacity-70">
            <div className="text-center md:text-left">
              <h3 className="text-sm font-black text-text-main dark:text-white dark:print:text-black mb-1">PAYPYA Cafe & Resto</h3>
              <p className="text-[10px] text-text-secondary dark:text-gray-500 max-w-[240px]">
                Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan. Thank you for dining with us!
              </p>
            </div>
            <div className="flex items-center gap-4 text-text-secondary dark:text-gray-500">
               <div className="text-center px-4 border-r border-[#e6e0db] dark:border-white/10">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1">Wifi Pass</p>
                  <p className="text-xs font-bold text-primary italic">paypyacafe2024</p>
               </div>
               <div className="text-center px-4">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1">Instagram</p>
                  <p className="text-xs font-bold text-text-main dark:text-white dark:print:text-black tracking-tight">@paypya.cafe</p>
               </div>
            </div>
          </div>

          <div className="mt-8 text-center border-t border-[#f4f2f0] dark:border-white/5 pt-8 print:mt-12">
             <div className="flex items-center justify-center gap-2 text-text-secondary dark:text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                <span className="material-symbols-outlined text-sm font-variation-settings-fill">verified</span>
                Original Digital Invoice
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
