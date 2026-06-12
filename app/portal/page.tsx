'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faSpinner, faRightFromBracket,
  faCirclePlus, faClock, faHashtag,
} from '@fortawesome/free-solid-svg-icons';

type Order = {
  id: string;
  mesa: number;
  estado: string;
  nota: string | null;
  created_at: string;
  order_items: { nombre_plato: string; cantidad: number; precio: number }[];
};

const ESTADO_STYLES: Record<string, string> = {
  Pendiente: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'En preparación': 'bg-blue-50 text-blue-600 border-blue-200',
  Listo: 'bg-green-50 text-green-600 border-green-200',
  Cancelado: 'bg-red-50 text-red-500 border-red-200',
};

export default function Portal() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabaseAuth.auth.getSession();
      if (!sessionData.session) { router.push('/login'); return; }

      const user = sessionData.session.user;
      setNombre(user.user_metadata?.nombre || user.email || '');

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(nombre_plato, cantidad, precio)')
        .eq('cliente_email', user.email)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabaseAuth.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-[#1c1c1e]">
            <FontAwesomeIcon icon={faUtensils} className="text-[#2d6a4f]" />
            La Bandera
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition-colors">
            <FontAwesomeIcon icon={faRightFromBracket} />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-[#1c1c1e] tracking-tight">
            Hola, <span className="font-semibold">{nombre}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Aquí están tus pedidos.</p>
        </div>

        <button onClick={() => router.push('/#menu')}
          className="inline-flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all mb-8">
          <FontAwesomeIcon icon={faCirclePlus} />
          Hacer nuevo pedido
        </button>

        {loading ? (
          <div className="flex justify-center py-24 text-gray-300">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm">No tienes pedidos aún.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faHashtag} className="text-[#2d6a4f] text-xs" />
                        Mesa {order.mesa}
                      </span>
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="text-[#2d6a4f] text-xs" />
                        {new Date(order.created_at).toLocaleString('es-DO')}
                      </span>
                    </div>
                    {order.nota && <p className="text-xs text-gray-400 italic">"{order.nota}"</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${ESTADO_STYLES[order.estado] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
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
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100 mt-1">
                    <span>Total</span>
                    <span className="text-[#2d6a4f]">
                      RD$ {order.order_items.reduce((a, b) => a + b.precio * b.cantidad, 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}