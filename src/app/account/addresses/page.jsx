'use client';
import { useState, useEffect } from 'react';
import { addressAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Chandigarh','Puducherry','Andaman & Nicobar Islands','Dadra & Nagar Haveli',
  'Lakshadweep',
];

const emptyForm = { name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', address_type: 'home' };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchAddresses = async () => {
    try {
      const res = await addressAPI.getAll();
      setAddresses(res.data.addresses || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.pincode || !form.address || !form.city || !form.state) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      if (editingId) {
        await addressAPI.update(editingId, form);
        toast.success('Address updated');
      } else {
        await addressAPI.add(form);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchAddresses();
    } catch { toast.error('Failed to save address'); }
  };

  const handleEdit = (addr) => {
    setForm({
      name: addr.name, phone: addr.phone, pincode: addr.pincode,
      locality: addr.locality || '', address: addr.address, city: addr.city,
      state: addr.state, landmark: addr.landmark || '', address_type: addr.address_type || 'home',
    });
    setEditingId(addr.id);
    setShowForm(true);
    setMenuOpen(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressAPI.remove(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch { toast.error('Failed to delete'); }
    setMenuOpen(null);
  };

  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', minHeight: 400 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#212121' }}>Manage Addresses</h2>
      </div>

      {/* Add New Address Button / Form */}
      <div style={{ padding: '0 24px' }}>
        {!showForm ? (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '16px 0',
              background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#2874f0', textTransform: 'uppercase',
            }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
            ADD A NEW ADDRESS
          </button>
        ) : (
          <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ background: '#f5faff', padding: '16px 20px', borderRadius: 2, border: '1px solid #2874f0' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#2874f0', marginBottom: 16, textTransform: 'uppercase' }}>
                {editingId ? 'EDIT ADDRESS' : 'ADD A NEW ADDRESS'}
              </p>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Input label="Name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} required />
                  <Input label="10-digit mobile number" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Input label="Pincode" value={form.pincode} onChange={v => setForm(p => ({ ...p, pincode: v }))} required />
                  <Input label="Locality" value={form.locality} onChange={v => setForm(p => ({ ...p, locality: v }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <textarea
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Address (Area and Street)"
                    rows={3}
                    required
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #c2c2c2', borderRadius: 2,
                      fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Input label="City/District/Town" value={form.city} onChange={v => setForm(p => ({ ...p, city: v }))} required />
                  <select
                    value={form.state}
                    onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                    required
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #c2c2c2', borderRadius: 2,
                      fontSize: 14, color: form.state ? '#212121' : '#878787', outline: 'none', background: '#fff',
                    }}
                  >
                    <option value="">--Select State--</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Input label="Landmark (Optional)" value={form.landmark} onChange={v => setForm(p => ({ ...p, landmark: v }))} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#212121', marginBottom: 8 }}>Address Type</p>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {['Home', 'Work'].map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                        <input type="radio" name="address_type" value={t.toLowerCase()}
                          checked={form.address_type === t.toLowerCase()}
                          onChange={e => setForm(p => ({ ...p, address_type: e.target.value }))}
                          style={{ accentColor: '#2874f0', width: 16, height: 16 }}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit"
                    style={{ background: '#2874f0', color: '#fff', padding: '12px 40px', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>
                    SAVE
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                    style={{ background: 'none', color: '#2874f0', padding: '12px 24px', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Address List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#878787' }}>Loading addresses...</div>
      ) : addresses.length === 0 && !showForm ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#878787', marginBottom: 8 }}>No saved addresses</p>
          <p style={{ fontSize: 13, color: '#c2c2c2' }}>Add an address for hassle-free delivery</p>
        </div>
      ) : (
        <div style={{ padding: '0 24px' }}>
          {addresses.map(addr => (
            <div key={addr.id} style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
              {/* Type Badge */}
              <span style={{
                display: 'inline-block', background: '#f0f0f0', color: '#878787', fontSize: 10, fontWeight: 700,
                padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
              }}>
                {addr.address_type || 'HOME'}
              </span>

              {/* Three-dot menu */}
              <div style={{ position: 'absolute', right: 0, top: 20 }}>
                <button onClick={() => setMenuOpen(menuOpen === addr.id ? null : addr.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#878787', padding: '4px 8px' }}>
                  ⋮
                </button>
                {menuOpen === addr.id && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,.15)', borderRadius: 2, zIndex: 10, minWidth: 120,
                  }}>
                    <button onClick={() => handleEdit(addr)}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#212121', textAlign: 'left' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(addr.id)}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#ff6161', textAlign: 'left' }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Address Content */}
              <div style={{ paddingRight: 40 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#212121', marginBottom: 4 }}>
                  {addr.name}
                  <span style={{ fontWeight: 400, color: '#212121', marginLeft: 16 }}>{addr.phone}</span>
                </p>
                <p style={{ fontSize: 13, color: '#212121', lineHeight: 1.6 }}>
                  {addr.address}
                  {addr.locality && `, ${addr.locality}`}
                  , {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={label}
      required={required}
      style={{
        width: '100%', padding: '10px 14px', border: '1px solid #c2c2c2', borderRadius: 2,
        fontSize: 14, color: '#212121', outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}
