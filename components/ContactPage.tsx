import React, { useState } from 'react';
import { sendContactMessage } from '../services/contactService';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await sendContactMessage(formData);
      alert(`Thank you, ${formData.name}! We have received your message.`);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-12 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-text-main dark:text-white mb-4 tracking-tight">Get in Touch</h1>
        <p className="text-text-secondary dark:text-gray-400 text-lg">
          Have a question or feedback? We'd love to hear from you. Fill out the form below or reach out to us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Form */}
        <div className="bg-white dark:bg-[#2c241b] p-8 rounded-3xl border border-[#f4f2f0] dark:border-white/5 shadow-sm">
          <h2 className="text-2xl font-bold text-text-main dark:text-white mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-text-main dark:text-gray-200 mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-transparent focus:border-primary focus:ring-0 text-text-main dark:text-white transition-all placeholder:text-gray-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-text-main dark:text-gray-200 mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-transparent focus:border-primary focus:ring-0 text-text-main dark:text-white transition-all placeholder:text-gray-400"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-bold text-text-main dark:text-gray-200 mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-background-light dark:bg-white/5 border border-transparent focus:border-primary focus:ring-0 text-text-main dark:text-white transition-all resize-none placeholder:text-gray-400"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-2 w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-base transition-all active:scale-95 shadow-lg shadow-primary/20 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div className="bg-white dark:bg-[#2c241b] p-8 rounded-3xl border border-[#f4f2f0] dark:border-white/5 shadow-sm flex items-start gap-5">
             <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-2xl">mail</span>
             </div>
             <div>
               <h3 className="text-xl font-bold text-text-main dark:text-white mb-1">Email Us</h3>
               <p className="text-text-secondary dark:text-gray-400 mb-2">For general inquiries and support.</p>
               <a href="mailto:hello@paypya.com" className="text-primary font-bold hover:underline">hello@paypya.com</a>
             </div>
          </div>

          <div className="bg-white dark:bg-[#2c241b] p-8 rounded-3xl border border-[#f4f2f0] dark:border-white/5 shadow-sm flex items-start gap-5">
             <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-2xl">call</span>
             </div>
             <div>
               <h3 className="text-xl font-bold text-text-main dark:text-white mb-1">Call Us</h3>
               <p className="text-text-secondary dark:text-gray-400 mb-2">Mon-Fri from 8am to 5pm.</p>
               <a href="tel:+628123456789" className="text-primary font-bold hover:underline">+62 812 3456 789</a>
             </div>
          </div>

          <div className="bg-white dark:bg-[#2c241b] p-8 rounded-3xl border border-[#f4f2f0] dark:border-white/5 shadow-sm flex items-start gap-5">
             <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-2xl">chat</span>
             </div>
             <div>
               <h3 className="text-xl font-bold text-text-main dark:text-white mb-1">Live Chat</h3>
               <p className="text-text-secondary dark:text-gray-400 mb-2">Chat with our support team in real-time.</p>
               <button className="text-primary font-bold hover:underline text-left">Start Chat</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};