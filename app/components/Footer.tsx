import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-[#1b4332] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 font-semibold">
          <FontAwesomeIcon icon={faUtensils} className="text-[#d4a017]" />
          La Bandera
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} La Bandera. Todos los derechos reservados.</p>
        <p className="text-xs text-white/30">
          Desarrollado por{' '}
          <a href="https://edpweb.vercel.app" target="_blank" rel="noopener noreferrer"
            className="text-white/60 font-medium hover:text-white transition-colors">
            EDP.web
          </a>
        </p>
      </div>
    </footer>
  );
}