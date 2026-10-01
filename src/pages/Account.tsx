import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, MapPin, Award, Search, CheckCircle2, AlertCircle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';
import { api } from '../services/api';

interface AccountProps {
  onNavigate: (page: PageRoute) => void;
}

interface StoredOrder {
  orderNumber: string;
  date: string;
  total: number;
  itemsCount: number;
  status: string;
  recipientName?: string;
}

export const Account: React.FC<AccountProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'rewards'>('orders');
  const [recentOrders, setRecentOrders] = useState<StoredOrder[]>([]);
  
  // Real-time Track by Order Number state
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Address book state
  const [addresses, setAddresses] = useState<Array<{ id: string; label: string; name: string; address: string; city: string; state: string; pincode: string; isDefault: boolean }>>(() => {
    try {
      const stored = localStorage.getItem('makhe_saved_addresses');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'addr-default',
        label: 'Default Delivery Address',
        name: 'Patna Regional Office / Residence',
        address: 'House No. 12, Lotus Grove Residency, Bailey Road',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001',
        isDefault: true,
      },
    ];
  });

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load recent orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('makhe_recent_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentOrders(parsed);
          return;
        }
      }
    } catch {
      // fallback
    }
    // Default sample historical order if none stored
    setRecentOrders([
      {
        orderNumber: 'MKH-2026-92CBC4',
        date: '26 Sep 2026',
        total: 798,
        itemsCount: 2,
        status: 'Dispatched from Bihar Hub',
        recipientName: 'Valued Makhé Snacker',
      },
    ]);
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackOrderNumber.trim();
    if (!query) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedOrder(null);

    try {
      // 1. Check live backend API
      const res = await api.getOrder(query);
      if (res.success && res.data) {
        setTrackedOrder(res.data);
        setTrackingLoading(false);
        return;
      }
    } catch {
      // Network fallback
    }

    // 2. Check localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem('makhe_recent_orders') || '[]');
      const found = Array.isArray(stored) ? stored.find((o: any) => o.orderNumber.toLowerCase() === query.toLowerCase()) : null;
      if (found) {
        setTrackedOrder(found);
        setTrackingLoading(false);
        return;
      }
    } catch {
      // fallback
    }

    // 3. Check default recent orders in state
    const matchingRecent = recentOrders.find((o) => o.orderNumber.toLowerCase() === query.toLowerCase());
    if (matchingRecent) {
      setTrackedOrder({
        orderNumber: matchingRecent.orderNumber,
        orderStatus: matchingRecent.status,
        total: matchingRecent.total,
        paymentStatus: 'Paid',
        shippingAddress: { city: 'Patna', state: 'Bihar' },
      });
      setTrackingLoading(false);
      return;
    }

    setTrackingLoading(false);
    setTrackingError('Order could not be located on server or local history. Please verify your order number.');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.address.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.pincode.trim()) {
      return;
    }
    const created = {
      id: `addr-${Date.now()}`,
      label: newAddress.label.trim() || 'Secondary Address',
      name: newAddress.name.trim() || 'Delivery Contact',
      address: newAddress.address.trim(),
      city: newAddress.city.trim(),
      state: newAddress.state.trim(),
      pincode: newAddress.pincode.trim(),
      isDefault: false,
    };
    const updated = [...addresses, created];
    setAddresses(updated);
    try {
      localStorage.setItem('makhe_saved_addresses', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setShowAddAddress(false);
    setNewAddress({ label: '', name: '', address: '', city: '', state: '', pincode: '' });
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    try {
      localStorage.setItem('makhe_saved_addresses', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-12 lg:py-16 selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Back */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6D1F] font-bold hover:text-[#142B1A] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-[#DFD3BF] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#142B1A] text-[#E5C778] flex items-center justify-center font-bold text-xl font-serif-brand shadow-sm">
              MI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif-brand font-bold text-[#142B1A]">
                  Makhé Member Portal
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8F3EB] text-[#1E7335] px-2 py-0.5 rounded">
                  Purity Club
                </span>
              </div>
              <p className="text-xs text-[#637667] mt-0.5">
                Member since 2026 · 100% Bihar Jumbo Origin Snacker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#526455] bg-[#FAF7F2] px-4 py-2.5 rounded-xl border border-[#E0D5BF]">
            <Award size={18} className="text-[#C59B27]" />
            <span className="font-semibold text-[#142B1A]">240 Harvest Points Earned</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E0D5BF] gap-8 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'orders'
                ? 'text-[#142B1A] font-extrabold border-b-2 border-[#142B1A]'
                : 'text-[#6C8070] hover:text-[#142B1A]'
            }`}
          >
            <Package size={16} />
            <span>My Orders &amp; Live Tracking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'addresses'
                ? 'text-[#142B1A] font-extrabold border-b-2 border-[#142B1A]'
                : 'text-[#6C8070] hover:text-[#142B1A]'
            }`}
          >
            <MapPin size={16} />
            <span>Saved Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`pb-3 flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === 'rewards'
                ? 'text-[#142B1A] font-extrabold border-b-2 border-[#142B1A]'
                : 'text-[#6C8070] hover:text-[#142B1A]'
            }`}
          >
            <Award size={16} />
            <span>Harvest Club Rewards</span>
          </button>
        </div>

        {/* Tab 1: Orders & Live Tracking */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Live Order Tracker Bar */}
            <div className="bg-white rounded-2xl border border-[#DFD3BF] p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-serif-brand font-bold text-[#142B1A]">
                  Track Any Makhé Order
                </h3>
                <p className="text-xs text-[#5D6F61] mt-0.5">
                  Enter your order reference code (e.g. MKH-2026-92CBC4) to check live status from the Bihar harvest dispatch center.
                </p>
              </div>

              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter order reference, e.g. MKH-2026-92CBC4"
                    value={trackOrderNumber}
                    onChange={(e) => setTrackOrderNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9CBB3] bg-[#FAF7F2] text-xs font-mono font-bold text-[#142B1A] placeholder:text-[#99A69D] focus:outline-none focus:border-[#142B1A]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={trackingLoading || !trackOrderNumber.trim()}
                  className="px-6 py-3 bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#234A30] transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0"
                >
                  {trackingLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={14} />
                      <span>Track Order</span>
                    </>
                  )}
                </button>
              </form>

              {/* Tracking Result */}
              {trackedOrder && (
                <div className="mt-4 p-5 rounded-xl bg-[#F4EFE6] border border-[#DDD1BE] space-y-3 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DDD1BE]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#1E7535]" />
                      <span className="font-mono font-bold text-sm text-[#142B1A]">{trackedOrder.orderNumber}</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#EBF7EE] text-[#1E7535] px-2.5 py-1 rounded">
                      Status: {trackedOrder.orderStatus || 'Confirmed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[#4E6152]">
                    <div>
                      <span className="text-[#7B8F80] block text-[11px]">Total Amount</span>
                      <span className="font-bold text-[#142B1A] text-sm">₹{trackedOrder.total}</span>
                    </div>
                    <div>
                      <span className="text-[#7B8F80] block text-[11px]">Payment</span>
                      <span className="font-semibold text-[#8C6D1F] uppercase">{trackedOrder.paymentStatus || 'Pending'}</span>
                    </div>
                    <div>
                      <span className="text-[#7B8F80] block text-[11px]">Destination</span>
                      <span className="font-semibold text-[#142B1A]">
                        {trackedOrder.shippingAddress?.city}, {trackedOrder.shippingAddress?.state}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/order-confirmation/${trackedOrder.orderNumber}`)}
                      className="text-xs font-bold text-[#8C6D1F] hover:text-[#142B1A] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Order Invoice &amp; Timeline</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {trackingError && (
                <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F5C2C7] text-xs text-[#C0392B] flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{trackingError}</span>
                </div>
              )}
            </div>

            {/* List of Orders */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#142B1A]">
                Recent Orders ({recentOrders.length})
              </h3>

              {recentOrders.map((ord, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-[#DFD3BF] p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#F0E8DA] pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#142B1A]">
                        ORDER #{ord.orderNumber}
                      </span>
                      <p className="text-[11px] text-[#637667]">Placed on {ord.date}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1E7335] bg-[#EBF7EE] px-2.5 py-1 rounded">
                      {ord.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-16 bg-[#F4EFE6] rounded-xl p-1.5 flex items-center justify-center border border-[#E0D5BF]">
                        <img src="/images/products/250g.webp" alt="Makhé Pack" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-serif-brand font-bold text-sm text-[#142B1A]">
                          Apna Makhana — Whole Jumbo Bihar Harvest
                        </h4>
                        <span className="text-xs text-[#637667]">
                          {ord.itemsCount} {ord.itemsCount === 1 ? 'pack' : 'packs'} · ₹{ord.total}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/order-confirmation/${ord.orderNumber}`)}
                        className="px-4 py-2 bg-[#F4EFE6] hover:bg-[#EBE2D2] text-[#142B1A] font-bold text-xs uppercase tracking-wider rounded-lg border border-[#DDD1BE] transition-colors cursor-pointer"
                      >
                        View Order
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs text-[#5D6F61] border-t border-[#F0E8DA]">
                    <span>Delivered to {ord.recipientName || 'Registered Address'}</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('/')}
                      className="font-bold text-[#8C6D1F] hover:text-[#142B1A] cursor-pointer"
                    >
                      Buy Again →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Wholesale CTA strip */}
            <div className="p-6 bg-[#F4EFE6] rounded-2xl border border-[#DDD1BE] text-center space-y-2">
              <p className="text-xs text-[#526555]">
                Looking for B2B consignments, institution gifting, or commercial bulk orders?
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/wholesale')}
                className="text-xs font-bold text-[#8C6D1F] hover:text-[#142B1A] uppercase tracking-wider cursor-pointer"
              >
                Go to Wholesale Bulk Desk →
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand font-bold text-xl text-[#142B1A]">
                  Saved Delivery Addresses
                </h3>
                <p className="text-xs text-[#637667] mt-0.5">
                  Manage your delivery destinations for instant checkout.
                </p>
              </div>

              {!showAddAddress && (
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="px-4 py-2 bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#234A30] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleSaveAddress} className="bg-white rounded-2xl border border-[#DFD3BF] p-6 space-y-4 shadow-sm animate-fadeIn">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#142B1A]">
                  New Delivery Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#142B1A] mb-1">Address Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Home, Office, Farmhouse"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CBB3] bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#142B1A] mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CBB3] bg-[#FAF7F2]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#142B1A] mb-1">Address Line</label>
                    <input
                      type="text"
                      placeholder="House / Flat / Street"
                      required
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CBB3] bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#142B1A] mb-1">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CBB3] bg-[#FAF7F2]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-[#142B1A] mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CBB3] bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#142B1A] mb-1">PIN Code</label>
                      <input
                        type="text"
                        placeholder="6-digit PIN"
                        required
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CBB3] bg-[#FAF7F2]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 border border-[#D9CBB3] text-[#526455] text-xs font-bold uppercase rounded-lg hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#142B1A] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#234A30] cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-2xl border border-[#DFD3BF] p-6 space-y-3 shadow-xs relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D1F]">
                      {addr.label}
                    </span>
                    {addr.isDefault ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8F3EB] text-[#1E7335] px-2 py-0.5 rounded">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-[#C0392B] hover:text-[#962D22] p-1 cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-[#4F6253] space-y-1">
                    <span className="font-bold text-[#142B1A] block">{addr.name}</span>
                    <p>{addr.address}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p>India</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Rewards */}
        {activeTab === 'rewards' && (
          <div className="bg-white rounded-2xl border border-[#DFD3BF] p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="font-serif-brand font-bold text-2xl text-[#142B1A]">
                Makhé Harvest Club Rewards
              </h3>
              <p className="text-xs text-[#5D6F61] leading-relaxed mt-1">
                Earn 10 Harvest Points for every ₹100 spent on Makhé India products. Redeemable for exclusive powerpack discounts, zero-cost shipping, and trial samples directly from Bihar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#142B1A] text-[#FAF7F2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#E5C778] uppercase tracking-widest font-bold block mb-1">
                  CURRENT POINT BALANCE
                </span>
                <span className="font-serif-brand text-3xl font-extrabold text-[#FAF7F2]">
                  240 Points
                </span>
              </div>
              <div className="bg-[#234A30] px-4 py-2.5 rounded-xl border border-[#E5C778]/30">
                <span className="text-[#E5C778] font-bold text-xs uppercase tracking-wider block">
                  Redeem Value: ₹120 Off
                </span>
                <span className="text-[11px] text-[#C0D9C6]">Auto-applied at checkout</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E0D5BF] space-y-1 text-xs">
                <span className="font-bold text-[#142B1A] block">100% Bihar Sourced</span>
                <p className="text-[#637667]">Every purchase directly supports traditional pond lotus cultivators.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E0D5BF] space-y-1 text-xs">
                <span className="font-bold text-[#142B1A] block">Milestone Rewards</span>
                <p className="text-[#637667]">Hit 500 points for a complimentary 250g Jumbo Powerpack consignment.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E0D5BF] space-y-1 text-xs">
                <span className="font-bold text-[#142B1A] block">Priority Dispatch</span>
                <p className="text-[#637667]">Purity Club members receive same-day dispatch on Bihar consignments.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
