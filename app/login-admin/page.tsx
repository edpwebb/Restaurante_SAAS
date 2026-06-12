'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabase-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError('Credenciales incorrectas.');
      setLoading(false);
      return;
    }

    if (data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      await supabaseAuth.auth.signOut();
      setError('No tienes acceso a este panel.');
      setLoading(false);
      return;
    }

    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-semibold text-[#1c1c1e] text-lg mb-2">
            <FontAwesomeIcon icon={faUtensils} className="text-[#2d6a4f]" />
            La Bandera
          </div>
          <p className="text-sm text-gray-400">Panel de cocina</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <FontAwesomeIcon icon={faEnvelope} className="text-[#2d6a4f] text-xs" />
              Correo
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="admin@restaurante.com"
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <FontAwesomeIcon icon={faLock} className="text-[#2d6a4f] text-xs" />
              Contraseña
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="••••••••"
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors" />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-70 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all mt-1">
            {loading ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Entrando...</> : 'Entrar a cocina'}
          </button>
        </form>
      </div>
    </div>
  );
}