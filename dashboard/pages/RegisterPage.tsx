import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { signUp } from '../../services/authService';
import { useAuth } from '../../components/AuthProvider';
import { useEffect } from 'react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(RoutePath.DASHBOARD);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(email, password, name);
      // Supabase might require email verification, but we'll navigate for now
      // or show a success message.
      alert('Registration successful! Please check your email for confirmation or sign in.');
      navigate(RoutePath.LOGIN);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background-light dark:bg-background-dark">
      {/* Right Side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 order-last">
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80")'}}></div>
        <div className="relative z-10 flex flex-col justify-end p-16 w-full text-white h-full">
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium italic">
              "FlavorHub has completely transformed how we manage our kitchen inventory and online orders. It's intuitive, fast, and reliable."
            </p>
            <footer className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 rounded-full bg-white/20"></div>
              <div>
                <div className="font-bold">Marcus Chen</div>
                <div className="text-slate-300 text-sm">Head Chef, The Urban Fork</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex lg:hidden justify-center mb-6">
                 <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                    <span className="text-xl font-bold tracking-tight text-text-main-light dark:text-white">PAYPYA Cafe</span>
                 </div>
            </div>
            <h2 className="text-3xl font-black text-text-main-light dark:text-white tracking-tight">Create an account</h2>
            <p className="mt-2 text-text-sub-light dark:text-text-sub-dark">Start managing your menu today.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-main-light dark:text-white mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-surface-light dark:bg-slate-800 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-main-light dark:text-white mb-1.5">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-surface-light dark:bg-slate-800 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="name@company.com"
                  />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-main-light dark:text-white mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-surface-light dark:bg-slate-800 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Create a password"
                  />
                </div>
                <p className="mt-2 text-xs text-text-sub-light dark:text-text-sub-dark">Must be at least 6 characters.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Creating account...' : 'Get started'}
            </button>
          </form>

          <p className="mt-2 text-center text-sm text-text-sub-light dark:text-text-sub-dark">
            Already have an account?{' '}
            <Link to={RoutePath.LOGIN} className="font-bold text-primary hover:text-blue-600 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
