import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const beneficios = [
  'Guarda tus pedidos favoritos',
  'Historial de órdenes',
  'Notificaciones de tu pedido',
];

export default function Registro() {
  return (
    <section id="registro" className="bg-[#1b4332] py-24 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="block text-[#d4a017] text-xs font-semibold tracking-widest uppercase mb-3">
            Portal del cliente
          </span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-4 leading-snug">
            Crea tu cuenta y ordena más rápido
          </h2>
          <p className="text-white/60 mb-7 leading-relaxed text-sm">
            Regístrate para hacer tus pedidos directamente desde la mesa y seguir el estado en tiempo real.
          </p>
          <ul className="flex flex-col gap-3">
            {beneficios.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-white/60">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[#d4a017] flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <a href="/registro"
            className="flex justify-center bg-[#d4a017] hover:bg-[#b8860b] text-white font-medium px-6 py-4 rounded-xl text-sm transition-all">
            Crear cuenta gratis
          </a>
          <a href="/login"
            className="flex justify-center border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium px-6 py-4 rounded-xl text-sm transition-all">
            Ya tengo cuenta — Iniciar sesión
          </a>
        </div>
      </div>
    </section>
  );
}