import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faArrowDown } from '@fortawesome/free-solid-svg-icons';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16 px-6 bg-[#1b4332]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1b4332] opacity-90" />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <span className="inline-flex items-center gap-2 text-[#d4a017] text-xs font-semibold tracking-widest uppercase mb-6">
          <FontAwesomeIcon icon={faLeaf} />
          Cocina dominicana auténtica
        </span>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.08] tracking-tight text-white mb-5 max-w-2xl">
          El sabor de<br />
          <em className="not-italic font-semibold text-[#d4a017]">nuestra tierra.</em>
        </h1>

        <p className="text-lg text-white/60 mb-10 max-w-md leading-relaxed">
          Platos tradicionales dominicanos preparados con ingredientes frescos. Ordena desde tu mesa.
        </p>

        <div className="flex flex-wrap gap-3">
          <a href="#menu"
            className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#b8860b] text-white font-medium px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 text-sm">
            Ver menú completo
          </a>
          <a href="/registro"
            className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-xl border border-white/20 hover:border-white/50 transition-all text-sm">
            Crear cuenta
          </a>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full mt-16 flex gap-8">
        {[
          { num: '30+', label: 'Platos típicos' },
          { num: '100%', label: 'Ingredientes frescos' },
          { num: 'Lun–Dom', label: '11am – 10pm' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="text-xl font-bold text-white tracking-tight">{s.num}</span>
            <span className="text-xs text-white/40">{s.label}</span>
          </div>
        ))}
      </div>

      <a href="#menu" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors">
        <FontAwesomeIcon icon={faArrowDown} className="animate-bounce" />
      </a>
    </section>
  );
}