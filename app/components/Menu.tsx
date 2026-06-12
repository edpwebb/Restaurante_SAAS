'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { supabaseAuth } from '@/lib/supabase-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMinus,
  faShoppingCart,
  faXmark,
  faSpinner,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

type MenuItem = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
};

type CartItem = MenuItem & { cantidad: number };

const CATEGORIAS = ['Entradas', 'Platos Principales', 'Bebidas', 'Postres'];

// Menú fijo dominicano
const MENU_FIJO: MenuItem[] = [
  // Entradas
  { id: '1', nombre: 'Tostones', descripcion: 'Plátano verde frito y aplastado, crujiente por fuera.', precio: 150, categoria: 'Entradas', disponible: true },
  { id: '2', nombre: 'Yuca Frita', descripcion: 'Yuca frita dorada con mojo de ajo.', precio: 120, categoria: 'Entradas', disponible: true },
  { id: '3', nombre: 'Chicharrón de Cerdo', descripcion: 'Cerdo frito crujiente, acompañado de tostones.', precio: 280, categoria: 'Entradas', disponible: true },
  { id: '4', nombre: 'Quipes', descripcion: 'Masa de trigo rellena de carne molida, tradición árabe-dominicana.', precio: 100, categoria: 'Entradas', disponible: true },

  // Platos Principales
  { id: '5', nombre: 'La Bandera Dominicana', descripcion: 'Arroz blanco, habichuelas rojas, pollo guisado y ensalada verde.', precio: 450, categoria: 'Platos Principales', disponible: true },
  { id: '6', nombre: 'Sancocho', descripcion: 'Guiso de carnes y vegetales, el plato más emblemático del país.', precio: 550, categoria: 'Platos Principales', disponible: true },
  { id: '7', nombre: 'Mangú con Los Tres Golpes', descripcion: 'Mangú de plátano con salami, huevo frito y queso blanco frito.', precio: 380, categoria: 'Platos Principales', disponible: true },
  { id: '8', nombre: 'Pollo Guisado', descripcion: 'Pollo en salsa criolla con arroz blanco y habichuelas.', precio: 420, categoria: 'Platos Principales', disponible: true },
  { id: '9', nombre: 'Pescado con Coco', descripcion: 'Filete de pescado en salsa de coco al estilo samaneño.', precio: 520, categoria: 'Platos Principales', disponible: true },
  { id: '10', nombre: 'Chivo Guisado', descripcion: 'Chivo en salsa de ají cubanela con arroz y tostones.', precio: 580, categoria: 'Platos Principales', disponible: true },

  // Bebidas
  { id: '11', nombre: 'Morir Soñando', descripcion: 'Jugo de naranja con leche evaporada y azúcar. Clásico dominicano.', precio: 120, categoria: 'Bebidas', disponible: true },
  { id: '12', nombre: 'Jugo de Chinola', descripcion: 'Jugo natural de maracuyá fresco.', precio: 100, categoria: 'Bebidas', disponible: true },
  { id: '13', nombre: 'Mamajuana', descripcion: 'Bebida tradicional dominicana con ron, vino y miel.', precio: 180, categoria: 'Bebidas', disponible: true },
  { id: '14', nombre: 'Agua de Coco', descripcion: 'Agua de coco natural servida en el coco.', precio: 150, categoria: 'Bebidas', disponible: true },

  // Postres
  { id: '15', nombre: 'Habichuelas con Dulce', descripcion: 'Postre tradicional de Semana Santa con habichuelas, leche y especias.', precio: 150, categoria: 'Postres', disponible: true },
  { id: '16', nombre: 'Bizcocho Dominicano', descripcion: 'Bizcocho esponjoso con merengue italiano y frutas.', precio: 180, categoria: 'Postres', disponible: true },
  { id: '17', nombre: 'Majarete', descripcion: 'Pudín de maíz tierno con leche de coco y canela.', precio: 130, categoria: 'Postres', disponible: true },
  { id: '18', nombre: 'Arroz con Leche', descripcion: 'Arroz cremoso cocido en leche con canela y azúcar.', precio: 120, categoria: 'Postres', disponible: true },
];

export default function Menu() {
  const router = useRouter();
  const [categoriaActiva, setCategoriaActiva] = useState('Platos Principales');
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mesa, setMesa] = useState('');
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const platosFiltrados = MENU_FIJO.filter(
    (p) => p.categoria === categoriaActiva && p.disponible
  );

  const totalItems = carrito.reduce((a, b) => a + b.cantidad, 0);
  const totalPrecio = carrito.reduce((a, b) => a + b.precio * b.cantidad, 0);

  const agregarAlCarrito = (item: MenuItem) => {
    setCarrito((prev) => {
      const existe = prev.find((c) => c.id === item.id);
      if (existe) {
        return prev.map((c) => c.id === item.id ? { ...c, cantidad: c.cantidad + 1 } : c);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const reducirDelCarrito = (id: string) => {
    setCarrito((prev) => {
      const item = prev.find((c) => c.id === id);
      if (!item) return prev;
      if (item.cantidad === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, cantidad: c.cantidad - 1 } : c);
    });
  };

  const cantidadEnCarrito = (id: string) => {
    return carrito.find((c) => c.id === id)?.cantidad || 0;
  };

  const handleOrdenar = async () => {
    setError('');

    const { data: sessionData } = await supabaseAuth.auth.getSession();
    if (!sessionData.session) {
      router.push('/login');
      return;
    }

    if (!mesa) {
      setError('Por favor indica el número de mesa.');
      return;
    }

    if (carrito.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    setLoading(true);

    const user = sessionData.session.user;

    // Crear la orden
    const { data: orden, error: ordenError } = await supabase
      .from('orders')
      .insert([{
        cliente_email: user.email,
        cliente_nombre: user.user_metadata?.nombre || user.email,
        mesa: parseInt(mesa),
        estado: 'Pendiente',
        nota: nota || null,
      }])
      .select()
      .single();

    if (ordenError || !orden) {
      setError('Error al crear el pedido. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    // Insertar items
const items = carrito.map((c) => ({
  order_id: orden.id,
  nombre_plato: c.nombre,
  precio: c.precio,
  cantidad: c.cantidad,
}));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items);

    setLoading(false);

    if (itemsError) {
      setError('Error al guardar los platos. Intenta de nuevo.');
      return;
    }

    setDone(true);
    setCarrito([]);
    setMesa('');
    setNota('');
  };

  return (
    <section id="menu" className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="block text-[#2d6a4f] text-xs font-semibold tracking-widest uppercase mb-3">
              Nuestra carta
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#1c1c1e]">
              Menú del día
            </h2>
          </div>

          {/* Botón carrito */}
          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            Mi orden
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#d4a017] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                categoriaActiva === cat
                  ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#2d6a4f]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de platos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {platosFiltrados.map((plato) => {
            const cant = cantidadEnCarrito(plato.id);
            return (
              <div key={plato.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-semibold text-[#1c1c1e] mb-1">{plato.nombre}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{plato.descripcion}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-bold text-[#2d6a4f]">RD$ {plato.precio}</span>
                  {cant === 0 ? (
                    <button
                      onClick={() => agregarAlCarrito(plato)}
                      className="flex items-center gap-1.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                      Agregar
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => reducirDelCarrito(plato.id)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <FontAwesomeIcon icon={faMinus} className="text-xs text-gray-600" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{cant}</span>
                      <button
                        onClick={() => agregarAlCarrito(plato)}
                        className="w-7 h-7 rounded-lg bg-[#2d6a4f] hover:bg-[#1b4332] flex items-center justify-center transition-colors"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-xs text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel carrito */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCarritoAbierto(false)} />
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-[#1c1c1e]">Mi orden</h3>
              <button onClick={() => setCarritoAbierto(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="text-xl" />
              </button>
            </div>

            {done ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[#2d6a4f] text-5xl" />
                <h3 className="font-semibold text-lg">¡Pedido enviado!</h3>
                <p className="text-gray-400 text-sm">Tu orden está siendo preparada. Puedes ver el estado en tu portal.</p>
                <button
                  onClick={() => { setDone(false); setCarritoAbierto(false); }}
                  className="text-sm text-[#2d6a4f] hover:underline"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 px-6 py-4 flex flex-col gap-4">
                  {carrito.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-12">Tu carrito está vacío.</p>
                  ) : (
                    carrito.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1c1c1e]">{item.nombre}</p>
                          <p className="text-xs text-gray-400">RD$ {item.precio} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => reducirDelCarrito(item.id)}
                            className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                            <FontAwesomeIcon icon={faMinus} className="text-xs" />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{item.cantidad}</span>
                          <button onClick={() => agregarAlCarrito(item)}
                            className="w-6 h-6 rounded bg-[#2d6a4f] flex items-center justify-center">
                            <FontAwesomeIcon icon={faPlus} className="text-xs text-white" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-[#2d6a4f] w-16 text-right">
                          RD$ {item.precio * item.cantidad}
                        </span>
                      </div>
                    ))
                  )}

                  {/* Mesa y nota */}
                  {carrito.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500">Número de mesa *</label>
                        <input
                          type="number"
                          value={mesa}
                          onChange={(e) => setMesa(e.target.value)}
                          placeholder="Ej. 5"
                          min="1"
                          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500">Nota especial (opcional)</label>
                        <textarea
                          rows={2}
                          value={nota}
                          onChange={(e) => setNota(e.target.value)}
                          placeholder="Sin picante, sin cebolla..."
                          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2d6a4f] transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                      {error}
                    </p>
                  )}
                </div>

                {/* Total y botón */}
                {carrito.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-100">
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="font-bold text-[#1c1c1e]">RD$ {totalPrecio}</span>
                    </div>
                    <button
                      onClick={handleOrdenar}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-70 text-white font-medium py-3 rounded-xl text-sm transition-all"
                    >
                      {loading ? (
                        <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Enviando...</>
                      ) : (
                        'Confirmar pedido'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}