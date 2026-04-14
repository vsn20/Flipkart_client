'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { FiCheck, FiPackage, FiStar } from 'react-icons/fi';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ordersAPI.getById(id);
        setOrder(res.data.order);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2874f0]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="text-xl font-medium text-gray-800">Order not found</h2>
        <Link href="/orders" className="text-[#2874f0] text-sm mt-2 inline-block">View all orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      {/* Success Animation */}
      <div className="bg-white rounded-sm shadow-sm p-8 text-center mb-4 animate-fade-in-up">
        <div className="w-20 h-20 bg-[#388e3c] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
          <FiCheck size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-sm text-gray-500">Thank you for shopping with us 🎉</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-sm shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b">
          <div>
            <p className="text-xs text-gray-500">Order Number</p>
            <p className="text-lg font-semibold text-gray-900">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Order Date</p>
            <p className="text-sm text-gray-800">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Items */}
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Items Ordered</h3>
        <div className="space-y-3 mb-6">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50">
              <img
                src={item.product_image || item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                alt={item.product_name}
                className="w-16 h-16 object-contain border rounded"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-800">{item.product_name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Delivery Address</h4>
          <p className="text-sm text-gray-600">
            {order.shipping_name}<br />
            {order.shipping_address}<br />
            {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br />
            Phone: {order.shipping_phone}
          </p>
        </div>

        {/* Payment & Total */}
        <div className="flex justify-between items-center flex-wrap gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">Payment Method</p>
            <p className="text-sm font-medium text-gray-800">{order.payment_method === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
          </div>
        </div>
      </div>

      {/* SuperCoins Earned */}
      {order.super_coins_earned > 0 && (
        <div className="bg-gradient-to-r from-[#ffd700] to-[#ff9f00] rounded-sm p-4 mb-4 text-white flex items-center gap-3 animate-slide-in">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🪙</div>
          <div>
            <p className="font-semibold">You earned {order.super_coins_earned} SuperCoins!</p>
            <p className="text-sm text-white/80">Use them on your next purchase for extra savings</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Link
          href="/orders"
          className="bg-white text-[#2874f0] border border-[#2874f0] px-6 py-2.5 rounded-sm text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="btn-flipkart"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
