'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabase-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faBars, faXmark, faUser } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    supabaseAuth.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Menú', href: '#menu' },
    { label: 'Nosotros', href: '#nosotros' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md transition-all duration-200 ${scrolled ? 'border-b border-gray-100' : 'border-b border-transparent'}`}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-8">
        <a href="#" className="flex items-center gap-2 font-semibold text-[#1c1c1e]">
          <FontAwesomeIcon icon={faUtensils} className="text-[#2d6a4f]" />
          La Bandera
        </a>

        <ul className="hidden md:flex gap-8 ml-auto">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-gray-500 hover:text-[#1c1c1e] transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <button
              onClick={() => router.push('/portal')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1c1c1e] transition-colors"
            >
              <FontAwesomeIcon icon={faUser} />
              Mi cuenta
            </button>
          ) : (
            <a href="/login" className="text-sm text-gray-500 hover:text-[#1c1c1e] transition-colors">
              Iniciar sesión
            </a>
          )}
          
          <a 
            href="#menu"
            className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Ordenar ahora
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden ml-auto text-[#1c1c1e] p-1"
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="text-xl" />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-1 bg-white">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-gray-500 border-b border-gray-100">
              {l.label}
            </a>
          ))}
          <a href="/login" onClick={() => setMenuOpen(false)}
            className="py-3 text-sm text-gray-500 border-b border-gray-100">
            Iniciar sesión
          </a>
          <a href="#menu" onClick={() => setMenuOpen(false)}
            className="mt-3 flex justify-center bg-[#2d6a4f] text-white text-sm font-medium px-4 py-3 rounded-lg">
            Ordenar ahora
          </a>
        </div>
      )}
    </nav>
  );
}