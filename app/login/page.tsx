'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabase-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabaseAuth.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError('Correo o contraseña incorrectos.');
      return;
    }

    router.push('/portal');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-semibold text-[#1c1c1e] text-lg mb-2">
            <FontAwesomeIcon icon={faUtensils} className="text-[#2d6a4f]" />
            La Bandera
          </div>
          <p className="text-sm text-gray-400">Inicia sesión para ordenar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <FontAwesomeIcon icon={faEnvelope} className="text-[#2d6a4f] text-xs" />
              Correo electrónico
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="ejemplo@correo.com"
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
            {loading ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Entrando...</> : 'Iniciar sesión'}
          </button>

          <p className="text-center text-xs text-gray-400">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="text-[#2d6a4f] hover:underline">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  );
}