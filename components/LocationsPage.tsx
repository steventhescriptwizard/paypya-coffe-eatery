import React, { useState, useEffect } from 'react';
import { getAllLocations, DbLocation } from '../services/locationService';
import locationImage from '../assets/image/locationpageimage.jpeg';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<DbLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);
        const data = await getAllLocations();
        
        let locationsToSource = data || [];
        
        // If no locations found in DB, use a default one
        if (locationsToSource.length === 0) {
          locationsToSource = [{
            id: 'default',
            name: 'PAYPYA Cafe',
            phone: '+62 822-xxxx-xxxx',
            email: 'hello@paypya.com',
            display_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: '',
            city: '',
            image_url: '',
            map_url: ''
          } as any];
        }

        const updatedData = locationsToSource.slice(0, 1).map(loc => ({
          ...loc,
          image_url: locationImage,
          address: 'Jl. Waiwerang Sagu, Waiwerang Kota, Kec. Adonara Tim.',
          city: 'Kabupaten Flores Timur, Nusa Tenggara Tim.',
          map_url: 'https://maps.app.goo.gl/HjaqEKW3vso7Gkyg7',
          hours: [
            { day: 'Mon - Fri', time: '11.00 - 00:00' },
            { day: 'Sat - Sun', time: '17:00 - 00:00' }
          ]
        }));
        setLocations(updatedData as DbLocation[]);
      } catch (err) {
        console.error('Failed to load locations:', err);
        // Fallback on error too
        const fallbackData = [{
          id: 'error-fallback',
          name: 'PAYPYA Cafe',
          phone: '+62 822-xxxx-xxxx',
          email: 'hello@paypya.com',
          image_url: locationImage,
          address: 'Jl. Waiwerang Sagu, Waiwerang Kota, Kec. Adonara Tim.',
          city: 'Kabupaten Flores Timur, Nusa Tenggara Tim.',
          map_url: 'https://maps.app.goo.gl/HjaqEKW3vso7Gkyg7',
          hours: [
            { day: 'Mon - Fri', time: '11.00 - 00:00' },
            { day: 'Sat - Sun', time: '17:00 - 00:00' }
          ],
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any];
        setLocations(fallbackData as DbLocation[]);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-12 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-text-main dark:text-white mb-4 tracking-tight">Visit Us</h1>
        <p className="text-text-secondary dark:text-gray-400 text-lg">
          Experience our atmosphere in person. Enjoy free Wi-Fi, comfortable seating, and the aroma of freshly brewed coffee.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {locations.map((loc, index) => (
          <div 
            key={loc.id} 
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} bg-white dark:bg-[#2c241b] rounded-3xl overflow-hidden shadow-sm border border-[#f4f2f0] dark:border-white/5 hover:shadow-xl transition-shadow duration-300`}
          >
            {/* Image Section */}
            <div className="w-full lg:w-1/2 h-64 lg:h-auto relative overflow-hidden group">
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${loc.image_url})` }}
              ></div>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Our Store</span>
              </div>
              
              <h2 className="text-3xl font-bold text-text-main dark:text-white mb-6">{loc.name}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-full bg-background-light dark:bg-white/5 flex items-center justify-center shrink-0 text-text-secondary dark:text-gray-400">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main dark:text-white">Address</p>
                    <p className="text-text-secondary dark:text-gray-400 leading-relaxed">{loc.address}</p>
                    <p className="text-text-secondary dark:text-gray-400">{loc.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-full bg-background-light dark:bg-white/5 flex items-center justify-center shrink-0 text-text-secondary dark:text-gray-400">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main dark:text-white">Opening Hours</p>
                    {(loc.hours as any[]).map((h, i) => (
                      <div key={i} className="flex gap-4 text-text-secondary dark:text-gray-400">
                        <span className="w-20">{h.day}</span>
                        <span>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-full bg-background-light dark:bg-white/5 flex items-center justify-center shrink-0 text-text-secondary dark:text-gray-400">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-main dark:text-white">Contact</p>
                    <p className="text-text-secondary dark:text-gray-400">{loc.phone}</p>
                    <p className="text-text-secondary dark:text-gray-400">{loc.email}</p>
                  </div>
                </div>
              </div>

              <a 
                href={loc.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 bg-text-main dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-text-main dark:hover:text-white rounded-xl font-bold transition-all w-fit active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
              >
                <span className="material-symbols-outlined text-lg">map</span>
                Get Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};