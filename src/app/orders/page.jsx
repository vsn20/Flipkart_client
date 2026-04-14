'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-[1000px] mx-auto px-2 sm:px-4 py-3">
      <div className="bg-white rounded-sm shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-lg font-medium">My Orders</h1>
        </div>

        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded p-4">
                <div className="h-4 skeleton w-1/4 mb-2" />
                <div className="h-3 skeleton w-1/2 mb-3" />
                <div className="flex gap-3">
                  <div className="w-20 h-20 skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-6">Looks like you haven&apos;t placed any orders</p>
            <Link
              href="/products"
              className="bg-[#2874f0] text-white px-10 py-3 rounded-sm text-sm font-semibold hover:bg-[#1a5dc8] inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order-confirmation/${order.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Order #{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={{
                        backgroundColor: getStatusColor(order.status) + '15',
                        color: getStatusColor(order.status),
                      }}
                    >
                      ● {order.status}
                    </span>
                    <FiChevronRight size={16} className="text-gray-400 group-hover:text-[#2874f0]" />
                  </div>
                </div>

                {/* Order Items */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                  {order.items?.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex gap-3 items-center shrink-0">
                      <img
                        src={item.product_image || item.product?.images?.[0] || 'https://via.placeholder.com/48'}
                        alt={item.product_name}
                        className="w-14 h-14 object-contain border rounded"
                      />
                      <div>
                        <p className="text-sm text-gray-700 line-clamp-1 max-w-[200px]">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <span className="text-xs text-gray-400 self-center">+{order.items.length - 4} more</span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {order.payment_method === 'COD' ? 'Cash on Delivery' : 'UPI'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total_amount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
