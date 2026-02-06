import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#f4f2f0] dark:border-white/5 bg-white dark:bg-[#2c241b] py-12 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <div className="flex items-center gap-2 text-text-main dark:text-white mb-4">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            </div>
            <span className="text-xl font-bold">PAYPYA Cafe</span>
          </div>
          <p className="text-text-secondary dark:text-gray-400 text-sm leading-relaxed mb-4">
            Crafting culinary experiences since 2012. Quality ingredients, local sourcing, and a passion for great taste.
          </p>
          <div className="flex items-start gap-2 text-text-secondary dark:text-gray-400 text-sm">
            <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
            <p>Jl. Waiwerang Sagu, Waiwerang Kota, Kec. Adonara Tim., Kabupaten Flores Timur, Nusa Tenggara Tim.</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-text-main dark:text-white">Quick Links</h4>
          <ul className="space-y-2 text-text-secondary dark:text-gray-400 text-sm font-medium">
            <li><a href="#" className="hover:text-primary transition-colors">Menu</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Reservations</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Our Story</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-text-main dark:text-white">Opening Hours</h4>
          <ul className="space-y-2 text-text-secondary dark:text-gray-400 text-sm font-medium">
            <li>Mon - Fri: 11.00 - 00:00</li>
            <li>Sat - Sun: 17:00 - 00:00</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-text-main dark:text-white">Newsletter</h4>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-secondary dark:text-gray-400">Subscribe for latest updates and offers.</p>
            <div className="flex gap-2">
                <input 
                className="bg-background-light dark:bg-white/5 border-none rounded-lg text-sm px-3 py-2 w-full focus:ring-1 focus:ring-primary text-text-main dark:text-white placeholder:text-gray-400" 
                placeholder="Your email" 
                type="email"
                />
                <button className="bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                    <span className="material-symbols-outlined text-lg">send</span>
                </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 mt-12 pt-8 border-t border-[#f4f2f0] dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary dark:text-gray-500">
        <p>© 2024 PAYPYA Cafe Inc. All rights reserved.</p>
        <div className="flex gap-6">
            <span className="cursor-pointer hover:text-primary transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-primary transition-colors">Terms of Service</span>
            <div className="flex gap-4 ml-4">
                <span className="material-symbols-outlined text-lg cursor-pointer hover:text-primary transition-colors">public</span>
                <span className="material-symbols-outlined text-lg cursor-pointer hover:text-primary transition-colors">photo_camera</span>
            </div>
        </div>
      </div>
    </footer>
  );
};