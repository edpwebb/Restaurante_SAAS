'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabase-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faSpinner, faCircleCheck, faLock } from '@fortawesome/free-solid-svg-icons';
import { faUser, faEnvelope } from '@fortawesome/free-regular-svg-icons';

export default function Registro() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabaseAuth.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre: form.nombre } },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Este correo ya tiene una cuenta.'
        : 'Error al crear la cuenta. Intenta de nuevo.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <FontAwesomeIcon icon={faCircleCheck} className="text-[#2d6a4f] text-5xl" />
          <h3 className="font-semibold text-lg">¡Cuenta creada!</h3>
          <p className="text-gray-500 text-sm">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-semibold text-[#1c1c1e] text-lg mb-2">
            <FontAwesomeIcon icon={faUtensils} className="text-[#2d6a4f]" />
            La Bandera
          </div>
          <p className="text-sm text-gray-400">Crea tu cuenta para ordenar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-4">
          <Field icon={faUser} label="Nombre completo" name="nombre" type="text"
            placeholder="Tu nombre" value={form.nombre} onChange={handleChange} />
          <Field icon={faEnvelope} label="Correo electrónico" name="email" type="email"
            placeholder="ejemplo@correo.com" value={form.email} onChange={handleChange} />
          <Field icon={faLock} label="Contraseña" name="password" type="password"
            placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} />

          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-70 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all mt-1">
            {loading ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Creando...</> : 'Crear cuenta'}
          </button>

          <p className="text-center text-xs text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-[#2d6a4f] hover:underline">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ icon, label, name, type, placeholder, value, onChange }: {
  icon: import('@fortawesome/fontawesome-svg-core').IconDefinition;
  label: string; name: string; type: string;
  placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <FontAwesomeIcon icon={icon} className="text-[#2d6a4f] text-xs" />
        {label}
      </label>
      <input type={type} name={name} placeholder={placeholder} value={value}
        onChange={onChange} required
        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors bg-white" />
    </div>
  );
}