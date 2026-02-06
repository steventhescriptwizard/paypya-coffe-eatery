import React, { useState } from 'react';
import { MenuItem } from '../types';
import { formatIDR } from '../utils/format';

interface ProductCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCartClick = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
  };
  
  // Replace with your actual WhatsApp number
  const whatsappNumber = "6282324093711"; 
  const message = encodeURIComponent(`Halo Kaka, saya mau pesan menu ini ${quantity} x ${item.name}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="group flex flex-col gap-3 pb-4 bg-white dark:bg-[#2c241b] rounded-xl overflow-hidden border border-[#f4f2f0] dark:border-white/5 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-300 h-full">
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <div 
          className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-700 group-hover:scale-110" 
          style={{ backgroundImage: `url("${item.image}")` }}
        ></div>
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-[#2c241b]/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-sm font-bold shadow-sm text-primary">
          {formatIDR(item.price)}
        </div>
        {item.badge && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            {item.badge}
          </div>
        )}
      </div>
      
      <div className="px-5 pb-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
        </div>
        
        <p className="text-text-secondary dark:text-gray-400 text-sm font-normal leading-relaxed mb-4 line-clamp-2">
          {item.description}
        </p>
        
        {(item.tags || item.rating || item.calories) && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {item.rating && (
              <div className="flex items-center text-yellow-500 gap-1">
                 <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                 <span className="text-xs font-bold text-text-main dark:text-gray-200">{item.rating}</span>
              </div>
            )}
            {item.calories && (
               <span className="text-xs text-text-secondary dark:text-gray-400 font-medium">{item.calories} cal</span>
            )}
            {item.tags?.map(tag => (
              <span key={tag} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                tag === 'Spicy' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                tag === 'Vegan' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto mb-3 pt-3 border-t border-[#f4f2f0] dark:border-white/10">
            <span className="text-sm font-bold text-text-main dark:text-white">Quantity</span>
            <div className="flex items-center bg-background-light dark:bg-white/5 rounded-lg p-1 gap-1">
                <button 
                    onClick={handleDecrement}
                    className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-white/10 text-text-main dark:text-white shadow-sm hover:text-primary dark:hover:text-primary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    disabled={quantity <= 1}
                >
                    <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="w-8 text-center text-sm font-bold text-text-main dark:text-white">{quantity}</span>
                <button 
                    onClick={handleIncrement}
                    className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-white/10 text-text-main dark:text-white shadow-sm hover:text-primary dark:hover:text-primary active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                </button>
            </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button 
            onClick={handleAddToCartClick}
            className="w-full py-2.5 bg-background-light dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:bg-primary text-text-main dark:text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
            Add to Order
          </button>

          <a 
            href={whatsappUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.248-.57-.397M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c.93.509 1.693.803 2.805.803 3.181 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.784-5.767-5.784zm9.391 3.66c-.366-1.055-.957-2.005-1.713-2.768a8.312 8.312 0 0 0-2.825-1.742c-1.11-.383-2.288-.582-3.486-.582-5.462 0-9.92 4.195-9.92 9.429 0 1.956.574 3.737 1.547 5.385l-1.026 3.864 3.998-1.055c1.474.832 3.129 1.295 4.888 1.295 5.925 0 10.748-4.819 10.748-10.744 0-1.08-.2-2.115-.561-3.082h-1.65v.001z"/>
            </svg>
            Order via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};