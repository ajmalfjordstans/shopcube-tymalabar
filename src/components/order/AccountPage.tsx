'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, MapPin, Loader2, LogOut, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/OrderAuthContext';
import { updateUserProfileApi } from '@/lib/order/api';
import toast from 'react-hot-toast';

interface StoredOrder {
  id: string;
  phone: string;
  total: number;
  orderType: string;
  createdAt: string;
}

const ADDR_KEY = (id: string) => `sc_address_${id}`;
const POST_KEY = (id: string) => `sc_postcode_${id}`;

export default function AccountPage() {
  const router = useRouter();
  const { session, isLoggedIn, login, logout } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [savedAddress, setSavedAddress] = useState(false);
  const [orderHistory, setOrderHistory] = useState<StoredOrder[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/order/login?next=/order/account');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!session) return;
    setName(session.user.name ?? '');
    setPhone(session.user.phone ?? '');
    setAddress(localStorage.getItem(ADDR_KEY(session.user.id)) ?? '');
    setPostcode(localStorage.getItem(POST_KEY(session.user.id)) ?? '');
    try {
      const raw = localStorage.getItem(`sc_orders_${session.user.id}`);
      setOrderHistory(raw ? JSON.parse(raw) : []);
    } catch { setOrderHistory([]); }
  }, [session]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required.'); return; }
    setSavingProfile(true);
    try {
      const result = await updateUserProfileApi({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      const updated = result?.data?.user ?? result?.user;
      if (updated && session) {
        login({ token: session.token, user: { ...session.user, name: updated.name, phone: updated.phone } });
      }
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    localStorage.setItem(ADDR_KEY(session.user.id), address.trim());
    localStorage.setItem(POST_KEY(session.user.id), postcode.trim().toUpperCase());
    setSavedAddress(true);
    toast.success('Delivery address saved.');
    setTimeout(() => setSavedAddress(false), 2500);
  }

  if (!isLoggedIn || !session) return null;

  const initials = session.user.name
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-lg mx-auto font-poppins">
      <Link
        href="/order"
        className="inline-flex items-center gap-1.5 text-sm text-[#601131]/60 hover:text-[#601131] mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to menu
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F0A429] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#601131] leading-tight">{session.user.name}</h1>
            <p className="text-sm text-[#601131]/50">{session.user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-[#601131]/50 hover:text-red-500 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      <section className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] p-5 mb-4 shadow-sm">
        <h2 className="font-bold text-[#601131] mb-4">Personal Details</h2>
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#601131]/50 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#601131]/40 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-[#D7CDA7] rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0A429]/40 bg-white text-[#601131]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#601131]/50 uppercase tracking-wide mb-1.5">
              Email <span className="normal-case font-normal text-[#601131]/40">(read-only)</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#601131]/30 pointer-events-none" />
              <input
                type="email"
                value={session.user.email}
                readOnly
                className="w-full border border-[#D7CDA7]/60 bg-[#F5F5DC] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#601131]/50 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#601131]/50 uppercase tracking-wide mb-1.5">
              Phone
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#601131]/40 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07700 900000"
                className="w-full border border-[#D7CDA7] rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0A429]/40 bg-white text-[#601131]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full bg-[#F0A429] hover:bg-[#e79b26] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1"
          >
            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </section>

      {orderHistory.length > 0 && (
        <section className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-[#F0A429]" />
            <h2 className="font-bold text-[#601131]">Recent Orders</h2>
          </div>
          <div className="space-y-2">
            {orderHistory.map(order => (
              <Link
                key={order.id}
                href={`/order/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-[#D7CDA7]/70 hover:border-[#D7CDA7] hover:bg-white transition-all group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#601131]/60 uppercase tracking-wide">
                      {order.orderType === 'DELIVERY' ? 'Delivery' : order.orderType === 'EAT_IN' ? 'Dine In' : 'Collection'}
                    </span>
                  </div>
                  <p className="text-xs text-[#601131]/40 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-[#601131]">£{order.total.toFixed(2)}</span>
                  <ChevronRight size={14} className="text-[#601131]/30 group-hover:text-[#601131]/60 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-[#F1EED0] rounded-2xl border border-[#D7CDA7] p-5 shadow-sm">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-bold text-[#601131]">Default Delivery Address</h2>
          <MapPin size={16} className="text-[#F0A429] mt-0.5" />
        </div>
        <p className="text-xs text-[#601131]/40 mb-4">
          Saved on this device. Pre-fills your delivery address at checkout.
        </p>
        <form onSubmit={handleSaveAddress} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#601131]/50 uppercase tracking-wide mb-1.5">
              Street Address
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={2}
              placeholder="8 Hendre Road, Pencoed"
              className="w-full border border-[#D7CDA7] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0A429]/40 resize-none bg-white text-[#601131]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#601131]/50 uppercase tracking-wide mb-1.5">
              Postcode
            </label>
            <input
              type="text"
              value={postcode}
              onChange={e => setPostcode(e.target.value.toUpperCase())}
              placeholder="CF35 5NW"
              maxLength={8}
              className="w-full border border-[#D7CDA7] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F0A429]/40 uppercase bg-white text-[#601131]"
            />
          </div>

          <button
            type="submit"
            className={`w-full font-semibold py-2.5 rounded-xl transition-colors ${
              savedAddress ? 'bg-green-500 text-white' : 'bg-[#601131] hover:bg-[#4a0d26] text-white'
            }`}
          >
            {savedAddress ? '✓ Address Saved' : 'Save Address'}
          </button>
        </form>
      </section>
    </div>
  );
}
