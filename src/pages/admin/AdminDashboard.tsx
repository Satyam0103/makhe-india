import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Package,
  Clock,
  AlertTriangle,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  CreditCard,
  User,
  MapPin,
  Calendar,
  IndianRupee,
  FileText,
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import {
  AdminOrder,
  getAdminUser,
  clearAdminSession,
  isAdminAuthenticated,
  fetchAdminOrdersApi,
  updateAdminOrderStatusApi,
  updateAdminOrderPaymentStatusApi,
} from '../../services/adminAuthService';
import { PageRoute } from '../../types';

interface AdminDashboardProps {
  onNavigate: (route: PageRoute) => void;
  selectedOrderId?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, selectedOrderId }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active Order Detail Modal
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Safety Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'mark_paid' | 'cancel_order' | null;
    orderId: string | null;
    title: string;
    message: string;
    confirmButtonText: string;
    confirmButtonClass: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    type: null,
    orderId: null,
    title: '',
    message: '',
    confirmButtonText: '',
    confirmButtonClass: '',
    action: async () => {},
  });

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const adminUser = getAdminUser();

  // Authentication Guard
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      clearAdminSession();
      onNavigate('/admin/login');
    }
  }, [onNavigate]);

  // Load Orders
  const loadOrders = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    const res = await fetchAdminOrdersApi();

    if (res.success) {
      setOrders(res.orders || []);
      // If an active order is selected, sync its updated data
      if (activeOrder) {
        const found = (res.orders || []).find(
          (o) => o._id === activeOrder._id || o.orderNumber === activeOrder.orderNumber
        );
        if (found) setActiveOrder(found);
      }
    } else {
      setFetchError(res.message || 'Unable to load orders. Please try again.');
      if (!isAdminAuthenticated()) {
        onNavigate('/admin/login');
      }
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, [activeOrder, onNavigate]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selectedOrderId prop if deep-linked
  useEffect(() => {
    if (selectedOrderId && orders.length > 0) {
      const found = orders.find(
        (o) => o._id === selectedOrderId || o.orderNumber === selectedOrderId
      );
      if (found) {
        setActiveOrder(found);
      }
    }
  }, [selectedOrderId, orders]);

  // Handle Logout
  const handleLogout = () => {
    clearAdminSession();
    onNavigate('/admin/login');
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = orders.length;
    const confirmedOrNew = orders.filter(
      (o) => o.orderStatus === 'confirmed' || o.orderStatus === 'pending'
    ).length;
    const upiVerificationPending = orders.filter(
      (o) => o.paymentMethod === 'upi' && (o.paymentStatus === 'verification_pending' || o.paymentStatus === 'pending')
    ).length;
    const shipped = orders.filter((o) => o.orderStatus === 'shipped').length;
    const delivered = orders.filter((o) => o.orderStatus === 'delivered').length;

    return {
      total,
      confirmedOrNew,
      upiVerificationPending,
      shipped,
      delivered,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'cod' && order.paymentMethod !== 'cod') return false;
        if (paymentFilter === 'upi' && order.paymentMethod !== 'upi') return false;
        if (paymentFilter === 'verification_pending') {
          if (order.paymentStatus !== 'verification_pending') return false;
        }
        if (paymentFilter === 'paid') {
          if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'verified') return false;
        }
      }

      // Search Query filter (Order Number, Customer Name, Phone)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const num = (order.orderNumber || '').toLowerCase();
        const name = (order.customer?.fullName || '').toLowerCase();
        const phone = (order.customer?.phone || '').toLowerCase();
        const utr = (order.upiTransactionId || '').toLowerCase();

        if (!num.includes(q) && !name.includes(q) && !phone.includes(q) && !utr.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  // Payment Status Color Badges
  const renderPaymentStatusBadge = (status: string, method: string) => {
    switch (status) {
      case 'paid':
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
            <CheckCircle2 size={12} />
            <span>Paid</span>
          </span>
        );
      case 'verification_pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF9E6] text-[#8C6D1F] border border-[#F0D58C] animate-pulse">
            <Clock size={12} />
            <span>Verification Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FDEDEC] text-[#922B21] border border-[#F5B7B1]">
            <XCircle size={12} />
            <span>Failed</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F4EFE6] text-[#596E5F] border border-[#DDD1BE]">
            <span>{method === 'cod' ? 'COD Pending' : 'Pending'}</span>
          </span>
        );
    }
  };

  // Order Status Color Badges
  const renderOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF5FB] text-[#1B4F72] border border-[#AED6F1]">
            <CheckCircle2 size={12} />
            <span>Confirmed</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F8F5] text-[#0E6251] border border-[#A3E4D7]">
            <Truck size={12} />
            <span>Shipped</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAFaf1] text-[#145A32] border border-[#A9DFBF]">
            <CheckCircle2 size={12} />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FDEDEC] text-[#78281F] border border-[#F5B7B1]">
            <XCircle size={12} />
            <span>Cancelled</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F4EFE6] text-[#596E5F] border border-[#DDD1BE]">
            <span>Pending</span>
          </span>
        );
    }
  };

  // Trigger Mark As Paid Confirmation Modal
  const requestMarkAsPaid = (order: AdminOrder) => {
    setActionErrorMsg(null);
    setActionSuccessMsg(null);
    setConfirmDialog({
      isOpen: true,
      type: 'mark_paid',
      orderId: order._id,
      title: 'Confirm Payment Verification',
      message: 'Have you manually verified this payment in the merchant\'s bank/UPI account? This will mark the order as Paid.',
      confirmButtonText: 'YES, MARK AS PAID',
      confirmButtonClass: 'bg-[#1B5E20] hover:bg-[#2E7D32] text-white',
      action: async () => {
        setIsUpdatingPayment(true);
        const res = await updateAdminOrderPaymentStatusApi(order._id, 'paid');
        setIsUpdatingPayment(false);

        if (res.success && res.order) {
          setActionSuccessMsg('Payment successfully verified and marked as Paid in MongoDB.');
          // Update order locally & in list
          setActiveOrder(res.order);
          setOrders((prev) => prev.map((o) => (o._id === res.order!._id ? res.order! : o)));
        } else {
          setActionErrorMsg(res.message || 'Failed to update payment status.');
        }
      },
    });
  };

  // Trigger Cancel Order Confirmation Modal
  const requestCancelOrder = (order: AdminOrder) => {
    setActionErrorMsg(null);
    setActionSuccessMsg(null);
    setConfirmDialog({
      isOpen: true,
      type: 'cancel_order',
      orderId: order._id,
      title: 'Cancel Order Confirmation',
      message: `Are you sure you want to cancel order #${order.orderNumber}? This will mark the order as Cancelled in MongoDB.`,
      confirmButtonText: 'YES, CANCEL ORDER',
      confirmButtonClass: 'bg-[#C0392B] hover:bg-[#962D22] text-white',
      action: async () => {
        setIsUpdatingStatus(true);
        const res = await updateAdminOrderStatusApi(order._id, 'cancelled');
        setIsUpdatingStatus(false);

        if (res.success && res.order) {
          setActionSuccessMsg('Order successfully cancelled in MongoDB.');
          setActiveOrder(res.order);
          setOrders((prev) => prev.map((o) => (o._id === res.order!._id ? res.order! : o)));
        } else {
          setActionErrorMsg(res.message || 'Failed to cancel order.');
        }
      },
    });
  };

  // Change Order Status Directly
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      const order = orders.find((o) => o._id === orderId) || activeOrder;
      if (order) {
        requestCancelOrder(order);
        return;
      }
    }

    setIsUpdatingStatus(true);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);

    const res = await updateAdminOrderStatusApi(orderId, newStatus);
    setIsUpdatingStatus(false);

    if (res.success && res.order) {
      setActionSuccessMsg(`Order status updated to '${newStatus}' in MongoDB.`);
      setActiveOrder(res.order);
      setOrders((prev) => prev.map((o) => (o._id === res.order!._id ? res.order! : o)));
    } else {
      setActionErrorMsg(res.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#142B1A] font-sans-brand selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      {/* ====================================================================
          ADMIN BACK-OFFICE TOPBAR
      ==================================================================== */}
      <header className="bg-[#142B1A] text-[#FAF7F2] border-b border-[#234A30] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#234A30] border border-[#3E6B4E] flex items-center justify-center text-[#E5C778]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-brand font-bold text-lg sm:text-xl text-[#FAF7F2] leading-none">
                  Makhé India
                </span>
                <span className="bg-[#E5C778] text-[#142B1A] text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-[#A3B3A6] hidden sm:inline block leading-tight">
                Operations &amp; Fulfillment Portal
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin identity */}
            {adminUser?.email && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#234A30] border border-[#3E6B4E] text-xs text-[#FAF7F2]">
                <User size={13} className="text-[#E5C778]" />
                <span className="font-mono">{adminUser.email}</span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={isRefreshing || isLoading}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#234A30] text-[#FAF7F2] hover:bg-[#346342] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh order data from MongoDB"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#E5C778]' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-[#78281F] text-[#FAF7F2] hover:bg-[#922B21] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Sign out of Admin Dashboard"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN DASHBOARD CONTAINER
      ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Title & Hostinger Environment Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#DDD1BE]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-brand font-bold text-[#142B1A]">
              Admin Dashboard
            </h1>
            <p className="text-xs text-[#596E5F] mt-0.5">
              Live order management, payment verification, and dispatch operations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#7B8F80] font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></span>
            <span>MongoDB Atlas Connected</span>
            <span className="text-[#C5B79D]">|</span>
            <span>Hostinger Deploy Ready</span>
          </div>
        </div>

        {/* ====================================================================
            METRIC SUMMARY CARDS
        ==================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Orders */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DDD1BE] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#7B8F80]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
              <Package size={16} className="text-[#142B1A]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-brand text-[#142B1A]">
                {isLoading ? '...' : metrics.total}
              </span>
              <span className="text-[10px] text-[#7B8F80] block mt-0.5">Lifetime orders in database</span>
            </div>
          </div>

          {/* New / Confirmed Orders */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DDD1BE] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#1B4F72]">
              <span className="text-[11px] font-bold uppercase tracking-wider">New / Confirmed</span>
              <CheckCircle2 size={16} className="text-[#1B4F72]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-brand text-[#1B4F72]">
                {isLoading ? '...' : metrics.confirmedOrNew}
              </span>
              <span className="text-[10px] text-[#596E5F] block mt-0.5">Ready for processing</span>
            </div>
          </div>

          {/* UPI Verification Pending */}
          <div className="p-4 rounded-2xl bg-[#FFF9E6] border border-[#F0D58C] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8C6D1F]">
              <span className="text-[11px] font-bold uppercase tracking-wider">UPI Pending</span>
              <AlertTriangle size={16} className="text-[#8C6D1F]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-brand text-[#8C6D1F]">
                {isLoading ? '...' : metrics.upiVerificationPending}
              </span>
              <span className="text-[10px] text-[#8C6D1F] font-semibold block mt-0.5">
                Manual UTR checks needed
              </span>
            </div>
          </div>

          {/* Shipped Orders */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DDD1BE] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#0E6251]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Shipped Orders</span>
              <Truck size={16} className="text-[#0E6251]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-brand text-[#0E6251]">
                {isLoading ? '...' : metrics.shipped}
              </span>
              <span className="text-[10px] text-[#596E5F] block mt-0.5">In transit to customers</span>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DDD1BE] shadow-xs col-span-2 sm:col-span-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#145A32]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
              <CheckCircle2 size={16} className="text-[#145A32]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-brand text-[#145A32]">
                {isLoading ? '...' : metrics.delivered}
              </span>
              <span className="text-[10px] text-[#596E5F] block mt-0.5">Fulfilled successfully</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            ERROR BANNER
        ==================================================================== */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-[#FDEDEC] border border-[#F5B7B1] text-[#922B21] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-[#C0392B]" />
              <div>
                <p className="text-sm font-bold font-sans-brand">Unable to load orders. Please try again.</p>
                <p className="text-xs text-[#922B21] mt-0.5">{fetchError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadOrders(true)}
              className="px-4 py-2 rounded-xl bg-[#C0392B] text-white text-xs font-bold hover:bg-[#922B21] cursor-pointer shrink-0 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ====================================================================
            FILTERS & SEARCH BAR
        ==================================================================== */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#DDD1BE] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7B8F80]">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order #, Customer Name, Phone, or UTR..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CBB3] bg-white text-xs text-[#142B1A] placeholder:text-[#A3B3A6] focus:outline-none focus:border-[#142B1A] focus:ring-1 focus:ring-[#142B1A] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B8F80] hover:text-[#142B1A]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Order Status Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#D9CBB3]">
                <SlidersHorizontal size={13} className="text-[#7B8F80]" />
                <span className="text-[11px] font-bold text-[#596E5F]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#142B1A] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#D9CBB3]">
                <CreditCard size={13} className="text-[#7B8F80]" />
                <span className="text-[11px] font-bold text-[#596E5F]">Payment:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#142B1A] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Payments</option>
                  <option value="cod">COD</option>
                  <option value="upi">UPI</option>
                  <option value="verification_pending">Verification Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(statusFilter !== 'all' || paymentFilter !== 'all' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setPaymentFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-[#78281F] hover:bg-[#FDEDEC] transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Count Summary */}
          <div className="text-[11px] text-[#7B8F80] flex items-center justify-between border-t border-[#EAE1D3] pt-2">
            <span>
              Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
            </span>
            {searchQuery && (
              <span>
                Filtered by keyword: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
        </div>

        {/* ====================================================================
            ORDERS LIST / TABLE
        ==================================================================== */}
        <div className="bg-[#FAF7F2] rounded-3xl border border-[#DDD1BE] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DDD1BE] flex items-center justify-between bg-[#F8F4EC]">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#142B1A] font-sans-brand">
                Orders List
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#142B1A] text-[#FAF7F2] text-[10px] font-bold font-mono">
                {filteredOrders.length}
              </span>
            </div>
            <span className="text-xs text-[#7B8F80] hidden sm:inline">
              Newest orders first
            </span>
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw size={24} className="animate-spin text-[#8C6D1F] mx-auto" />
              <p className="text-sm font-semibold text-[#596E5F]">Loading orders from MongoDB...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center space-y-2">
              <Package size={36} className="text-[#C5B79D] mx-auto" />
              <p className="text-base font-bold text-[#142B1A]">No orders yet.</p>
              <p className="text-xs text-[#7B8F80] max-w-sm mx-auto">
                {orders.length === 0
                  ? 'No orders have been submitted to the database yet. When customers check out via COD or UPI, they will appear here instantly.'
                  : 'No orders matched your current search and filter criteria.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (Hidden on mobile) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4EFE6] border-b border-[#DDD1BE] text-[11px] font-bold uppercase tracking-wider text-[#596E5F]">
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE1D3] text-xs">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id || order.orderNumber}
                        className="hover:bg-[#F4EFE6]/70 transition-colors"
                      >
                        {/* Order Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#142B1A] whitespace-nowrap">
                          {order.orderNumber}
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 font-medium text-[#142B1A] whitespace-nowrap">
                          {order.customer?.fullName || 'N/A'}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-[#596E5F] whitespace-nowrap">
                          {order.customer?.phone || 'N/A'}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-[#7B8F80] whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4 text-[#596E5F] max-w-[150px] truncate" title={(order.items || []).map((i) => `${i.name} (${i.weight}) x${i.quantity}`).join(', ')}>
                          {(order.items || []).reduce((acc, i) => acc + i.quantity, 0)} pcs
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 font-bold font-serif-brand text-sm text-[#142B1A] whitespace-nowrap">
                          ₹{order.total}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 uppercase text-[11px] font-bold text-[#142B1A] whitespace-nowrap">
                          {order.paymentMethod === 'upi' ? (
                            <span className="inline-flex items-center gap-1 text-[#8C6D1F]">
                              <CreditCard size={12} />
                              <span>UPI</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#142B1A]">
                              <IndianRupee size={12} />
                              <span>COD</span>
                            </span>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderPaymentStatusBadge(order.paymentStatus, order.paymentMethod)}
                        </td>

                        {/* Order Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderOrderStatusBadge(order.orderStatus)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setActionErrorMsg(null);
                              setActionSuccessMsg(null);
                              setActiveOrder(order);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#142B1A] text-[#FAF7F2] hover:bg-[#234A30] text-xs font-bold font-sans-brand inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <Eye size={12} />
                            <span>VIEW</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Responsive Cards View (Shown on screen < 1024px) */}
              <div className="block lg:hidden divide-y divide-[#EAE1D3]">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id || order.orderNumber}
                    className="p-4 sm:p-5 space-y-3 hover:bg-[#F4EFE6]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-sm text-[#142B1A] block">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-[#7B8F80]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActionErrorMsg(null);
                          setActionSuccessMsg(null);
                          setActiveOrder(order);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#142B1A] text-[#FAF7F2] text-xs font-bold hover:bg-[#234A30] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Eye size={12} />
                        <span>VIEW</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#EAE1D3]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#7B8F80] block">Customer</span>
                        <span className="font-semibold text-[#142B1A] block truncate">{order.customer?.fullName || 'N/A'}</span>
                        <span className="text-[11px] font-mono text-[#596E5F]">{order.customer?.phone || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#7B8F80] block">Payable Total</span>
                        <span className="font-serif-brand font-bold text-base text-[#142B1A]">₹{order.total}</span>
                        <span className="text-[10px] uppercase font-bold text-[#8C6D1F] block">
                          {order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#7B8F80]">Pay:</span>
                        {renderPaymentStatusBadge(order.paymentStatus, order.paymentMethod)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#7B8F80]">Status:</span>
                        {renderOrderStatusBadge(order.orderStatus)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ====================================================================
          ORDER DETAILS MODAL / DRAWER
      ==================================================================== */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#FAF7F2] border border-[#DDD1BE] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#DDD1BE] bg-[#F4EFE6] flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold font-serif-brand text-[#142B1A]">
                    Order #{activeOrder.orderNumber}
                  </h3>
                  {renderOrderStatusBadge(activeOrder.orderStatus)}
                  {renderPaymentStatusBadge(activeOrder.paymentStatus, activeOrder.paymentMethod)}
                </div>
                <p className="text-xs text-[#7B8F80] flex items-center gap-1.5 font-sans-brand">
                  <Calendar size={13} />
                  <span>
                    Placed on {new Date(activeOrder.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="w-9 h-9 rounded-full bg-white border border-[#D9CBB3] flex items-center justify-center text-[#596E5F] hover:text-[#142B1A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Alert Feedback Messages */}
              {actionSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] flex items-center gap-2.5 text-xs font-semibold">
                  <CheckCircle2 size={16} className="shrink-0 text-[#2E7D32]" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}
              {actionErrorMsg && (
                <div className="p-3.5 rounded-xl bg-[#FDEDEC] border border-[#F5B7B1] text-[#922B21] flex items-center gap-2.5 text-xs font-semibold">
                  <AlertCircle size={16} className="shrink-0 text-[#C0392B]" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* ============================================================
                  SECTION 8: PROMINENT UPI PAYMENT VERIFICATION REQUIRED
              ============================================================ */}
              {activeOrder.paymentMethod === 'upi' && activeOrder.paymentStatus === 'verification_pending' && (
                <div className="p-5 rounded-2xl bg-[#FFF9E6] border-2 border-[#E5C778] space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#8C6D1F]">
                    <AlertTriangle size={20} className="shrink-0 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider font-sans-brand">
                        PAYMENT VERIFICATION REQUIRED
                      </h4>
                      <p className="text-xs text-[#594411] mt-0.5">
                        Verify credit in the merchant bank/UPI account before marking as paid.
                      </p>
                    </div>
                  </div>

                  {/* Submitted UTR Display */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E5DAC6] space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#7B8F80] font-bold block">
                      Submitted UPI Transaction ID / UTR:
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-[#142B1A] select-all block">
                      {activeOrder.upiTransactionId || 'No UTR submitted'}
                    </span>
                  </div>

                  {/* Mark as Paid Action Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-[#8C6D1F] leading-tight">
                      * Only mark as paid after checking your merchant statement or bank SMS.
                    </p>
                    <button
                      type="button"
                      disabled={isUpdatingPayment}
                      onClick={() => requestMarkAsPaid(activeOrder)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1B5E20] text-white hover:bg-[#2E7D32] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isUpdatingPayment ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      <span>MARK AS PAID</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 9: COD PAYMENT PAID BUTTON */}
              {activeOrder.paymentMethod === 'cod' && activeOrder.paymentStatus !== 'paid' && (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DDD1BE] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#142B1A] block">
                      Payment Method: Cash on Delivery
                    </span>
                    <span className="text-xs text-[#596E5F]">
                      Current Payment Status: Pending cash collection at delivery.
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isUpdatingPayment}
                    onClick={() => requestMarkAsPaid(activeOrder)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#142B1A] text-[#FAF7F2] hover:bg-[#234A30] text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>MARK COD AS PAID</span>
                  </button>
                </div>
              )}

              {/* ============================================================
                  SECTION 10: ORDER STATUS CONTROL
              ============================================================ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DDD1BE] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#142B1A] block">
                      Update Order Fulfillment Status
                    </span>
                    <span className="text-[11px] text-[#596E5F]">
                      Changes are persisted directly to MongoDB Atlas.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={activeOrder.orderStatus}
                      disabled={isUpdatingStatus}
                      onChange={(e) => handleStatusChange(activeOrder._id, e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#D9CBB3] bg-[#FAF7F2] text-xs font-bold text-[#142B1A] focus:outline-none focus:border-[#142B1A] cursor-pointer disabled:opacity-50"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {isUpdatingStatus && <RefreshCw size={14} className="animate-spin text-[#8C6D1F]" />}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="p-4 rounded-2xl bg-white border border-[#DDD1BE] space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D1F]">
                    <User size={14} />
                    <span>Customer Details</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#142B1A] text-sm">{activeOrder.customer?.fullName || 'N/A'}</p>
                    <p className="text-[#596E5F] flex items-center gap-1.5">
                      <Phone size={12} className="text-[#7B8F80]" />
                      <a href={`tel:${activeOrder.customer?.phone}`} className="hover:underline font-mono">
                        {activeOrder.customer?.phone || 'N/A'}
                      </a>
                    </p>
                    <p className="text-[#596E5F] flex items-center gap-1.5">
                      <Mail size={12} className="text-[#7B8F80]" />
                      <a href={`mailto:${activeOrder.customer?.email}`} className="hover:underline">
                        {activeOrder.customer?.email || 'N/A'}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-4 rounded-2xl bg-white border border-[#DDD1BE] space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D1F]">
                    <MapPin size={14} />
                    <span>Shipping Address</span>
                  </div>
                  <div className="space-y-0.5 text-xs text-[#142B1A]">
                    <p className="font-semibold">{activeOrder.shippingAddress?.addressLine1}</p>
                    {activeOrder.shippingAddress?.addressLine2 && (
                      <p>{activeOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state} -{' '}
                      <span className="font-mono font-bold">{activeOrder.shippingAddress?.pincode}</span>
                    </p>
                    <p className="text-[#596E5F]">{activeOrder.shippingAddress?.country || 'India'}</p>
                  </div>
                </div>
              </div>

              {/* Products Itemized Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D1F] flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Ordered Products ({activeOrder.items?.length || 0})</span>
                  </span>
                </div>

                <div className="rounded-2xl border border-[#DDD1BE] bg-white overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F4EFE6] border-b border-[#DDD1BE] text-[10px] font-bold uppercase tracking-wider text-[#596E5F]">
                        <th className="py-2.5 px-3.5">Product</th>
                        <th className="py-2.5 px-3.5">Pack</th>
                        <th className="py-2.5 px-3.5 text-center">Qty</th>
                        <th className="py-2.5 px-3.5 text-right">Price</th>
                        <th className="py-2.5 px-3.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE1D3]">
                      {(activeOrder.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF7F2]">
                          <td className="py-3 px-3.5 font-bold text-[#142B1A]">
                            {item.name}
                          </td>
                          <td className="py-3 px-3.5 text-[#596E5F]">
                            {item.weight}
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono font-semibold">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3.5 text-right text-[#596E5F]">
                            ₹{item.price}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold font-serif-brand text-[#142B1A]">
                            ₹{item.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Financials Summary */}
              <div className="p-4 rounded-2xl bg-white border border-[#DDD1BE] flex flex-col items-end space-y-1.5 text-xs">
                <div className="flex items-center justify-between w-full max-w-xs text-[#596E5F]">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{activeOrder.subtotal}</span>
                </div>
                <div className="flex items-center justify-between w-full max-w-xs text-[#596E5F]">
                  <span>Shipping:</span>
                  <span className="font-mono font-semibold text-[#1B5E20]">
                    {activeOrder.shippingAmount === 0 ? 'FREE' : `₹${activeOrder.shippingAmount}`}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full max-w-xs pt-2 border-t border-[#DDD1BE] text-base font-bold text-[#142B1A]">
                  <span>Total Amount:</span>
                  <span className="font-serif-brand text-lg text-[#142B1A]">₹{activeOrder.total}</span>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#7B8F80] block">
                    Payment Method
                  </span>
                  <span className="font-bold text-sm text-[#142B1A] uppercase">
                    {activeOrder.paymentMethod === 'upi' ? 'UPI Online Transfer' : 'Cash On Delivery (COD)'}
                  </span>
                  {activeOrder.upiTransactionId && (
                    <span className="text-[11px] font-mono text-[#8C6D1F] block mt-0.5">
                      UTR: {activeOrder.upiTransactionId}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#7B8F80] block text-right sm:text-left">
                    Current Payment Status
                  </span>
                  {renderPaymentStatusBadge(activeOrder.paymentStatus, activeOrder.paymentMethod)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DDD1BE] bg-[#F4EFE6] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#D9CBB3] text-xs font-bold text-[#142B1A] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SECTION 11: SAFETY CONFIRMATION DIALOG
      ==================================================================== */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#FAF7F2] border border-[#DDD1BE] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#142B1A]">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] border border-[#F0D58C] flex items-center justify-center text-[#8C6D1F]">
                <AlertTriangle size={20} />
              </div>
              <h4 className="text-base font-bold font-serif-brand">
                {confirmDialog.title}
              </h4>
            </div>

            <p className="text-xs text-[#596E5F] leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-[#D9CBB3] bg-white text-xs font-bold text-[#142B1A] hover:bg-[#F4EFE6] cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={async () => {
                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                  await confirmDialog.action();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${confirmDialog.confirmButtonClass}`}
              >
                {confirmDialog.confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
