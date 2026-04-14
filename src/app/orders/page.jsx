'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { FiSearch, FiChevronRight } from 'react-icons/fi';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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

  const filteredOrders = orders.filter(order => {
    let matches = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        order.order_number?.toLowerCase().includes(query) ||
        order.items?.some(item => item.product_name?.toLowerCase().includes(query))
      );
    }

    if (statusFilter) {
      matches = matches && order.status === statusFilter;
    }

    if (dateFilter) {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const days = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      if (dateFilter === '30') matches = matches && days <= 30;
      else if (dateFilter === '2024') matches = matches && orderDate.getFullYear() === 2024;
      else if (dateFilter === '2023') matches = matches && orderDate.getFullYear() === 2023;
      else if (dateFilter === 'older') matches = matches && orderDate.getFullYear() < 2023;
    }

    return matches;
  });

  if (!isAuthenticated) return null;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingTop: 12, paddingBottom: 12 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 8px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: '#878787', marginBottom: 16 }}>
          Home <span style={{ padding: '0 4px' }}>›</span> My Account <span style={{ padding: '0 4px' }}>›</span> <span style={{ color: '#212121' }}>My Orders</span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {/* Left Sidebar Filters */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.05)', borderRadius: 2 }}>
              <div style={{ padding: 16, borderBottom: '1px solid #e8e8e8' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#212121', margin: 0 }}>Filters</h3>
              </div>

              {/* Status Filter */}
              <div style={{ padding: 16, borderBottom: '1px solid #e8e8e8' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#212121', marginBottom: 12, margin: 0, marginBottom: 12 }}>ORDER STATUS</h4>
                {['On the way', 'Delivered', 'Cancelled', 'Returned'].map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, cursor: 'pointer', fontSize: 13, color: '#878787' }}>
                    <input
                      type="checkbox"
                      checked={statusFilter === status}
                      onChange={() => setStatusFilter(statusFilter === status ? '' : status)}
                      style={{ marginRight: 8, cursor: 'pointer', width: 16, height: 16 }}
                    />
                    {status}
                  </label>
                ))}
              </div>

              {/* Date Filter */}
              <div style={{ padding: 16 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#212121', marginBottom: 12, margin: 0, marginBottom: 12 }}>ORDER TIME</h4>
                {[
                  { label: 'Last 30 days', value: '30' },
                  { label: '2024', value: '2024' },
                  { label: '2023', value: '2023' },
                  { label: 'Older', value: 'older' },
                ].map(item => (
                  <label key={item.value} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, cursor: 'pointer', fontSize: 13, color: '#878787' }}>
                    <input
                      type="checkbox"
                      checked={dateFilter === item.value}
                      onChange={() => setDateFilter(dateFilter === item.value ? '' : item.value)}
                      style={{ marginRight: 8, cursor: 'pointer', width: 16, height: 16 }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            {/* Search Box */}
            <div style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.05)', borderRadius: 2, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 2, padding: '0 12px', border: '1px solid #e8e8e8' }}>
                  <input
                    type="text"
                    placeholder="Search your orders here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, padding: '10px 0' }}
                  />
                </div>
                <button style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: 2, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiSearch size={16} /> Search Orders
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.05)', borderRadius: 2 }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#878787' }}>Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#212121', marginBottom: 4 }}>No orders found</h3>
                  <p style={{ fontSize: 13, color: '#878787' }}>Looks like your filters didn't match any orders</p>
                </div>
              ) : (
                filteredOrders.map((order, idx) => (
                  <Link
                    key={order.id}
                    href={`/order-confirmation/${order.id}`}
                    style={{
                      display: 'block',
                      padding: 16,
                      borderBottom: idx < filteredOrders.length - 1 ? '1px solid #e8e8e8' : 'none',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafaf9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Header with Order Number and Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#212121', marginBottom: 2 }}>
                          Order #{order.order_number}
                        </div>
                        <div style={{ fontSize: 12, color: '#878787' }}>
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 12,
                            backgroundColor: getStatusColor(order.status) + '20',
                            color: getStatusColor(order.status),
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          ● {order.status}
                        </span>
                        <FiChevronRight size={16} style={{ color: '#878787' }} />
                      </div>
                    </div>

                    {/* Product Items */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #e8e8e8', paddingBottom: 12 }}>
                      {order.items?.slice(0, 4).map((item) => (
                        <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                          <img
                            src={item.product_image || item.product?.images?.[0] || 'https://via.placeholder.com/48'}
                            alt={item.product_name}
                            style={{ width: 48, height: 48, objectFit: 'contain', border: '1px solid #e8e8e8', borderRadius: 2 }}
                          />
                          <div>
                            <div style={{ fontSize: 12, color: '#212121', lineHeight: 1.4, maxWidth: 200, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.product_name}
                            </div>
                            <div style={{ fontSize: 11, color: '#878787' }}>Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <span style={{ fontSize: 11, color: '#878787' }}>+{order.items.length - 4} more</span>
                      )}
                    </div>

                    {/* Footer with Payment and Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: '#878787' }}>
                        {order.payment_method === 'COD' ? 'Cash on Delivery' : 'UPI'}
                      </span>
                      <span style={{ fontWeight: 700, color: '#212121' }}>{formatPrice(order.total_amount)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
