import React, { useState, useRef } from 'react';
import { formatIDR } from '../../utils/format';

export const QRGenerator: React.FC = () => {
    const [tableNumber, setTableNumber] = useState('1');
    const [qrSize, setQrSize] = useState(250);
    const [isLoading, setIsLoading] = useState(false);
    
    // Get current site URL (base)
    const baseUrl = window.location.origin;
    const targetUrl = `${baseUrl}/?table=${tableNumber}`;
    
    // Using api.qrserver.com for QR generation
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(targetUrl)}`;

    const handleDownload = () => {
        setIsLoading(true);
        fetch(qrUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `QR_Meja_${tableNumber}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error downloading QR:', err);
                setIsLoading(false);
                alert('Gagal mendownload QR Code');
            });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light dark:bg-background-dark animate-fade-in">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-black text-text-main-light dark:text-white">QR Code Generator</h1>
                    <p className="text-text-sub-light dark:text-text-sub-dark">Buat barcode khusus untuk masing-masing meja customer.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Settings Side */}
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <h3 className="font-bold text-lg text-text-main-light dark:text-white border-b border-border-light dark:border-border-dark pb-2">Pengaturan Barcode</h3>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Nomor Meja</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">table_restaurant</span>
                                    <input 
                                        type="text" 
                                        className="w-full bg-background-light dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl pl-10 pr-4 py-3 font-bold text-text-main-light dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Meja 1"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Ukuran QR (px)</label>
                                <input 
                                    type="range" 
                                    min="150" 
                                    max="500" 
                                    step="50"
                                    className="w-full accent-primary"
                                    value={qrSize}
                                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                                />
                                <div className="flex justify-between text-[10px] text-text-sub-light font-bold">
                                    <span>150px</span>
                                    <span>{qrSize}px</span>
                                    <span>500px</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-1">
                                <span className="material-symbols-outlined text-sm">link</span>
                                Link Website
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 break-all font-mono">
                                {targetUrl}
                            </p>
                        </div>
                    </div>

                    {/* Preview Side */}
                    <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex flex-col items-center justify-center gap-6 group print:shadow-none print:border-none">
                        <div className="text-center">
                            <h3 className="font-black text-2xl text-text-main-light dark:text-white mb-1">SCAN ME</h3>
                            <p className="text-text-sub-light dark:text-text-sub-dark font-bold uppercase tracking-widest text-sm">MEJA {tableNumber}</p>
                        </div>
                        
                        <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5 relative print:shadow-none">
                            <img 
                                src={qrUrl} 
                                alt={`QR Meja ${tableNumber}`} 
                                className="rounded-lg transition-transform group-hover:scale-[1.02]"
                                style={{ width: qrSize, height: qrSize }}
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full max-w-xs print:hidden">
                            <button 
                                onClick={handleDownload}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">{isLoading ? 'sync' : 'download'}</span>
                                {isLoading ? 'Pros...' : 'Download'}
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex items-center justify-center bg-background-light dark:bg-slate-800 border border-border-light dark:border-border-dark text-text-main-light dark:text-white font-bold p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                                title="Print Preview"
                            >
                                <span className="material-symbols-outlined">print</span>
                            </button>
                        </div>
                        
                        <p className="text-[10px] text-text-sub-light dark:text-slate-500 font-medium text-center max-w-[200px] print:hidden">
                            Download untuk mencetak barcode ini pada stiker meja Anda.
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-6 rounded-2xl flex gap-4 items-start">
                    <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-300">
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">Tips Pemasangan Barcode</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                            Tempelkan barcode di sudut meja yang mudah terlihat. Ketika pelanggan scan barcode ini, sistem akan otomatis mengenali nomor mejanya sehingga proses pemesanan menjadi lebih cepat dan akurat.
                        </p>
                    </div>
                </div>
            </div>

            {/* Print specific styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
                    .print\\:shadow-none { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border: none !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}} />
        </div>
    );
};
