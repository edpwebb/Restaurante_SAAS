'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { supabaseAuth } from '@/lib/supabase-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faSpinner, faArrowsRotate,
  faRightFromBracket, faCircleCheck, faCircleXmark, faFire,
} from '@fortawesome/free-solid-svg-icons';

type OrderItem = { nombre_plato: string; cantidad: number; precio: number };
type Order = {
  id: string;
  cliente_nombre: string;
  cliente_email: string;
  mesa: number;
  estado: string;
  nota: string | null;
  created_at: string;
  order_items: OrderItem[];
};

const ESTADO_STYLES: Record<string, string> = {
  Pendiente: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'En preparación': 'bg-blue-50 text-blue-600 border-blue-200',
  Listo: 'bg-green-50 text-green-600 border-green-200',
  Cancelado: 'bg-red-50 text-red-500 border-red-200',
};

export default function Admin() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [filtro, setFiltro] = useState('Pendiente');

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabaseAuth.auth.getSession();
      if (!data.session) { router.push('/login-admin'); return; }
      setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(nombre_plato, cantidad, precio)')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authChecked) fetchOrders();
  }, [authChecked]);

  // Realtime
  useEffect(() => {
    if (!authChecked) return;
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authChecked]);

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from('orders').update({ estado }).eq('id', id);
    fetchOrders();
  };

  const handleLogout = async () => {
    await supabaseAuth.auth.signOut();
    router.push('/login-admin');
  };

  const ordensFiltradas = filtro === 'Todos'
    ? orders
    : orders.filter((o) => o.estado === filtro);

  const counts = {
    pendientes: orders.filter((o) => o.estado === 'Pendiente').length,
    preparando: orders.filter((o) => o.estado === 'En preparación').length,
    listos: orders.filter((o) => o.estado === 'Listo').length,
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-[#1c1c1e]">
            <FontAwesomeIcon icon={faUtensils} className="text-[#2d6a4f]" />
            La Bandera — Cocina
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchOrders}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2d6a4f] transition-colors">
              <FontAwesomeIcon icon={faArrowsRotate} />
              Actualizar
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition-colors">
              <FontAwesomeIcon icon={faRightFromBracket} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
            <p className="text-xs text-yellow-600 mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{counts.pendientes}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            <p className="text-xs text-blue-600 mb-1">En preparación</p>
            <p className="text-2xl font-bold text-blue-600">{counts.preparando}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <p className="text-xs text-green-600 mb-1">Listos</p>
            <p className="text-2xl font-bold text-green-600">{counts.listos}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['Todos', 'Pendiente', 'En preparación', 'Listo', 'Cancelado'].map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                filtro === f
                  ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#2d6a4f]'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24 text-gray-300">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
          </div>
        ) : ordensFiltradas.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm">No hay pedidos.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ordensFiltradas.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#1c1c1e]">Mesa {order.mesa}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.cliente_nombre}</p>
                    <p className="text-xs text-gray-300">{new Date(order.created_at).toLocaleTimeString('es-DO')}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${ESTADO_STYLES[order.estado] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {order.estado}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.cantidad}x {item.nombre_plato}</span>
                      <span className="text-gray-400">RD$ {item.precio * item.cantidad}</span>
                    </div>
                  ))}
                  {order.nota && (
                    <p className="text-xs text-gray-400 italic mt-1 bg-gray-50 rounded px-2 py-1">"{order.nota}"</p>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap border-t border-gray-100 pt-3">
                  {order.estado === 'Pendiente' && (
                    <button onClick={() => updateEstado(order.id, 'En preparación')}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium border border-blue-200 bg-blue-50 rounded-lg py-2">
                      <FontAwesomeIcon icon={faFire} /> Preparando
                    </button>
                  )}
                  {order.estado === 'En preparación' && (
                    <button onClick={() => updateEstado(order.id, 'Listo')}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-green-600 font-medium border border-green-200 bg-green-50 rounded-lg py-2">
                      <FontAwesomeIcon icon={faCircleCheck} /> Listo
                    </button>
                  )}
                  {order.estado !== 'Cancelado' && order.estado !== 'Listo' && (
                    <button onClick={() => updateEstado(order.id, 'Cancelado')}
                      className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-medium border border-red-200 bg-red-50 rounded-lg py-2 px-3">
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}