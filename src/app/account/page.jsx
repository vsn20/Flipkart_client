'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiStar, FiPackage, FiHeart, FiLogOut } from 'react-icons/fi';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="max-w-[900px] mx-auto px-2 sm:px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-sm shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#2874f0] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.plus_tier !== 'none' && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                <FiStar size={10} /> Plus {user.plus_tier} • {user.super_coins} SuperCoins
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { href: '/orders', icon: <FiPackage size={24} />, label: 'My Orders', count: user.total_orders || 0 },
          { href: '/wishlist', icon: <FiHeart size={24} />, label: 'Wishlist', count: null },
          { href: '/flipkart-plus', icon: <FiStar size={24} />, label: 'SuperCoins', count: user.super_coins || 0 },
          { href: '/cart', icon: '🛒', label: 'My Cart', count: null },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-sm shadow-sm p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-[#2874f0] flex justify-center mb-2 text-2xl">{item.icon}</div>
            <p className="text-sm font-medium text-gray-800">{item.label}</p>
            {item.count !== null && <p className="text-xs text-gray-500 mt-0.5">{item.count}</p>}
          </Link>
        ))}
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-sm shadow-sm p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
        <div className="space-y-4">
          {[
            { icon: <FiUser size={18} />, label: 'Name', value: user.name },
            { icon: <FiMail size={18} />, label: 'Email', value: user.email },
            { icon: <FiPhone size={18} />, label: 'Phone', value: user.phone || 'Not added' },
            { icon: <FiMapPin size={18} />, label: 'Address', value: user.address || 'Not added' },
          ].map((field) => (
            <div key={field.label} className="flex items-start gap-3 py-2 border-b border-gray-50">
              <span className="text-gray-400 mt-0.5">{field.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{field.label}</p>
                <p className="text-sm text-gray-800">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        className="w-full bg-white rounded-sm shadow-sm p-4 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 transition-colors"
        onClick={() => { logout(); router.push('/'); }}
      >
        <FiLogOut size={18} /> Logout
      </button>
    </div>
  );
}
