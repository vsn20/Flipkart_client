'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { addressAPI } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, summary, loading, updateQuantity, removeFromCart, fetchCart } = useCart();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [pincode, setPincode] = useState('');

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  useEffect(() => { fetchCart(); }, []);

  const openAddressModal = async () => {
    setShowAddressModal(true);
    setLoadingAddresses(true);
    try {
      const res = await addressAPI.getAll();
      const addrs = res.data.addresses || [];
      setAddresses(addrs);
      const def = addrs.find(a => a.is_default) || addrs[0];
      if (def && !selectedAddress) setSelectedAddress(def.id);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  if (!isAuthenticated) return null;

  const items = cart?.items || [];
  const currentAddr = addresses.find(a => a.id === selectedAddress);

  if (!loading && items.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ background: '#fff', padding: '60px 20px', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: '#212121', marginBottom: 8 }}>Your cart is empty!</h2>
          <p style={{ fontSize: 14, color: '#878787', marginBottom: 24 }}>Add items to it now.</p>
          <Link href="/products" style={{ background: '#2874f0', color: '#fff', padding: '12px 48px', borderRadius: 2, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const mrp = parseFloat(summary?.totalMRP) || 0;
  const discount = parseFloat(summary?.totalDiscount) || 0;
  const delivery = parseFloat(summary?.deliveryCharges) || 0;
  const total = parseFloat(summary?.totalAmount) || 0;
  const savings = discount;

  return (
    <div style={{ background: '#f1f3f6', minHeight: '80vh', padding: '12px 0' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 12px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* ── Left: Cart Items (65%) ─────────────────── */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: '65%' }}>
          {/* Tabs */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
            <button style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, color: '#2874f0', background: 'none', border: 'none', borderBottom: '3px solid #2874f0', cursor: 'pointer' }}>
              Flipkart ({summary?.itemCount || 0})
            </button>
            <button style={{ padding: '14px 24px', fontSize: 14, color: '#878787', background: 'none', border: 'none', cursor: 'pointer' }}>
              Grocery
            </button>
          </div>

          {/* Deliver to */}
          <div style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: 8, boxShadow: '0 2px 4px rgba(0,0,0,.06)' }}>
            <span style={{ fontSize: 13, color: '#212121', marginRight: 4 }}>Deliver to:</span>
            <div style={{ flex: 1 }}>
              {currentAddr ? (
                <>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{currentAddr.name}, {currentAddr.pincode}</span>
                  <span style={{ marginLeft: 8, fontSize: 11, background: '#e8e8e8', color: '#212121', padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>{currentAddr.address_type?.toUpperCase() || 'HOME'}</span>
                  <p style={{ fontSize: 12, color: '#878787', marginTop: 2 }}>{currentAddr.address}, {currentAddr.locality}</p>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>Your Address</span>
                  <span style={{ marginLeft: 8, fontSize: 11, background: '#e8e8e8', color: '#212121', padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>HOME</span>
                  <p style={{ fontSize: 12, color: '#878787', marginTop: 2 }}>Add delivery address to continue</p>
                </>
              )}
            </div>
            <button onClick={openAddressModal}
              style={{ fontSize: 14, color: '#2874f0', fontWeight: 600, background: 'none', border: '1px solid #2874f0', borderRadius: 2, padding: '4px 12px', cursor: 'pointer', flexShrink: 0 }}>
              Change
            </button>
          </div>

          {/* Items */}
          <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
            {loading ? (
              <div style={{ padding: 20 }}>
                {[1,2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 100, height: 100, background: '#f0f0f0', borderRadius: 2 }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, background: '#f0f0f0', borderRadius: 2, marginBottom: 8, width: '70%' }}/>
                      <div style={{ height: 14, background: '#f0f0f0', borderRadius: 2, width: '40%' }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.map((item, idx) => (
              <CartItem key={item.id} item={item} isLast={idx === items.length - 1}
                onUpdateQty={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}

            {!loading && items.length > 0 && (
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
                <button
                  onClick={() => router.push('/checkout')}
                  style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '14px 56px', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,.2)', letterSpacing: 0.5 }}
                >
                  PLACE ORDER
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Price Details (35%) ─────────────── */}
        <div style={{ width: '35%', minWidth: 300, flexShrink: 0 }}>
          <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#878787', letterSpacing: 0.5, textTransform: 'uppercase' }}>Price Details</h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {[
                { label: `Price (${summary?.itemCount || 0} item${(summary?.itemCount || 0) !== 1 ? 's' : ''})`, value: formatPrice(mrp), style: {} },
                { label: 'Discount', value: `−${formatPrice(discount)}`, style: { color: '#388e3c' } },
                { label: 'Delivery Charges', value: delivery === 0 ? 'FREE' : formatPrice(delivery), style: delivery === 0 ? { color: '#388e3c' } : {} },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 15 }}>
                  <span style={{ color: '#212121' }}>{row.label}</span>
                  <span style={{ ...row.style }}>{row.value}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px dashed #e0e0e0', margin: '16px 0' }}/>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#212121', marginBottom: 14 }}>
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>

              {savings > 0 && (
                <div style={{ background: '#f0faf0', border: '1px solid #c8e6c9', borderRadius: 2, padding: '8px 14px', textAlign: 'center', fontSize: 14, color: '#388e3c', fontWeight: 600 }}>
                  🎉 You will save {formatPrice(savings)} on this order!
                </div>
              )}

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontSize: 12, color: '#878787' }}>Safe and secure payments. Easy returns. 100% Authentic products.</span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                style={{ width: '100%', background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8, letterSpacing: 0.5 }}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Address Selection Modal ─────────────── */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowAddressModal(false)}>
          <div style={{ background: '#fff', borderRadius: 4, width: 520, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#212121' }}>Select Delivery Address</h3>
              <button onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 24, color: '#878787', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            {/* Address List */}
            <div style={{ padding: '12px 20px' }}>
              {loadingAddresses ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#878787' }}>Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center' }}>
                  <p style={{ color: '#878787', marginBottom: 16 }}>No saved addresses found</p>
                  <button onClick={() => { setShowAddressModal(false); router.push('/account/addresses'); }}
                    style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: 2, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Add New Address
                  </button>
                </div>
              ) : (
                <>
                  {addresses.map(addr => (
                    <label key={addr.id} style={{
                      display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer', alignItems: 'flex-start',
                    }}>
                      <input type="radio" name="delivery-address" checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        style={{ accentColor: '#2874f0', width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>{addr.name}, {addr.pincode}</span>
                          <span style={{ fontSize: 10, background: '#e8e8e8', color: '#212121', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                            {addr.address_type?.toUpperCase() || 'HOME'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#878787', lineHeight: 1.5 }}>
                          {addr.address}, {addr.locality}, {addr.city}, {addr.state}
                        </p>
                      </div>
                    </label>
                  ))}

                  {/* Deliver Here button */}
                  <div style={{ padding: '16px 0' }}>
                    <button onClick={() => setShowAddressModal(false)}
                      style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '10px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>
                      DELIVER HERE
                    </button>
                    <button onClick={() => { setShowAddressModal(false); router.push('/account/addresses'); }}
                      style={{ background: 'none', color: '#2874f0', border: '1px solid #2874f0', borderRadius: 2, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Add New Address
                    </button>
                  </div>
                </>
              )}

              {/* Pincode check */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#212121', marginBottom: 8 }}>Use pincode to check delivery info</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Enter pincode" value={pincode} onChange={e => setPincode(e.target.value)}
                    style={{ flex: 1, border: '1px solid #c2c2c2', borderRadius: 2, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
                  <button style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: 2, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItem({ item, isLast, onUpdateQty, onRemove }) {
  const product = item.product || {};
  const discPct = product.discount_percent || Math.round(((parseFloat(product.mrp) - parseFloat(product.price)) / parseFloat(product.mrp)) * 100) || 0;
  const deliveryDays = 2;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
  const dateStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div style={{ padding: '16px 20px', borderBottom: isLast ? 'none' : '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href={`/product/${product.id}`} style={{ flexShrink: 0 }}>
          <div style={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={product.images?.[0] || 'https://placehold.co/96x96/f1f3f6/878787?text=•'} alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
          </div>
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 14, color: '#212121', marginBottom: 4, lineHeight: 1.4 }}>{product.name}</p>
          </Link>
          {product.brand && (
            <p style={{ fontSize: 12, color: '#878787', marginBottom: 6 }}>Seller: {product.brand}Store &nbsp;
              <span style={{ background: '#2874f0', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 2, fontWeight: 700 }}>Assured</span>
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: '#388e3c', fontWeight: 600 }}>↓{discPct}%</span>
            <span style={{ fontSize: 14, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#212121' }}>{formatPrice(product.price)}</span>
          </div>

          <p style={{ fontSize: 13, color: '#212121', marginBottom: 12 }}>
            Delivery by <strong>{dateStr}</strong>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #c2c2c2', borderRadius: 2, overflow: 'hidden', marginRight: 20 }}>
              <button onClick={() => onUpdateQty(Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1}
                style={{ width: 32, height: 32, background: '#f5f5f5', border: 'none', fontSize: 18, cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', color: item.quantity <= 1 ? '#ccc' : '#212121', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                −
              </button>
              <span style={{ minWidth: 44, textAlign: 'center', fontSize: 14, fontWeight: 600, padding: '0 8px', borderLeft: '1px solid #c2c2c2', borderRight: '1px solid #c2c2c2', lineHeight: '32px' }}>
                {item.quantity}
              </span>
              <button onClick={() => onUpdateQty(item.quantity + 1)} disabled={item.quantity >= (product.stock || 10)}
                style={{ width: 32, height: 32, background: '#f5f5f5', border: 'none', fontSize: 18, cursor: item.quantity >= (product.stock || 10) ? 'not-allowed' : 'pointer', color: item.quantity >= (product.stock || 10) ? '#ccc' : '#212121', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                +
              </button>
            </div>

            <button style={{ background: 'none', border: 'none', fontSize: 14, color: '#212121', cursor: 'pointer', padding: '6px 16px', fontWeight: 600, textTransform: 'uppercase' }}>
              Save for later
            </button>
            <button onClick={onRemove} style={{ background: 'none', border: 'none', fontSize: 14, color: '#212121', cursor: 'pointer', padding: '6px 16px', fontWeight: 600, textTransform: 'uppercase' }}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
