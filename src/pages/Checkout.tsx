import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Package,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Banknote,
  Info,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { PageRoute } from "../types";
import { api, prepareOrderPayload } from "../services/api";

interface CheckoutProps {
  onNavigate: (page: PageRoute) => void;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

// ============================================================================
// OFFICIAL UPI CONFIGURATION
// Loads the permanent project asset at /images/upi/makhe-upi-qr.jpeg
// ============================================================================
const UPI_ID: string =
  (import.meta.env.VITE_UPI_ID as string) || "abhinayan.kumar@phonepe";
const UPI_QR_IMAGE: string = "/images/upi/makhe-upi-qr.jpeg";

interface PlacedOrderDetails {
  orderNumber: string;
  orderAccessToken?: string;
  total: number;
  subtotal: number;
  paymentMethod: "cod" | "upi";
  upiTransactionId?: string;
  recipientName: string;
  phone: string;
  itemsCount: number;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("upi");
  const [upiTransactionId, setUpiTransactionId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderDetails | null>(
    null,
  );

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    if (!UPI_ID) return;
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    });
  };

  // Comprehensive Client-side Form Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Full Name *
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full Name is required (minimum 2 characters)";
    }

    // 2. Phone Number * (10-digit Indian Mobile)
    const cleanedPhone = formData.phone.trim().replace(/[\s-]/g, "");
    if (!cleanedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleanedPhone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    // 3. Email Address (Optional, but if filled must be valid)
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    // 4. Address Line 1 *
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address Line 1 is required";
    }

    // 5. City *
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // 6. State *
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    // 7. PIN Code * (6 digits)
    const cleanedPin = formData.pincode.trim().replace(/\s/g, "");
    if (!cleanedPin) {
      newErrors.pincode = "PIN Code is required";
    } else if (!/^[1-9][0-9]{5}$/.test(cleanedPin)) {
      newErrors.pincode = "Please enter a valid 6-digit PIN code";
    }

    // 8. UPI Transaction ID / UTR * (Only if UPI is selected)
    if (paymentMethod === "upi") {
      const cleanUtr = upiTransactionId.trim();
      if (!cleanUtr) {
        newErrors.upiTransactionId =
          "UPI Transaction ID / UTR is required after completing payment";
      } else if (cleanUtr.length < 4) {
        newErrors.upiTransactionId =
          "Please enter a valid UPI reference / UTR number (at least 4 characters)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Order to Server
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate clicks or submissions on empty cart
    if (cart.length === 0 || isProcessing) {
      return;
    }

    if (!validate()) {
      return;
    }

    setServerError(null);
    setIsProcessing(true);
    setProcessingStatus("Saving order in database...");

    try {
      // Prepare canonical payload (server recalculates all prices)
      const payload = prepareOrderPayload(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        paymentMethod === "upi" ? upiTransactionId.trim() : undefined,
      );

      const orderResponse = await api.createOrder(payload);

      if (
        !orderResponse.success ||
        (!orderResponse.order && !orderResponse.data)
      ) {
        throw new Error(
          orderResponse.message ||
            "Database could not save order. Please try again.",
        );
      }

      const savedOrder = orderResponse.order || orderResponse.data;
      const orderNumber = savedOrder.orderNumber;
      const orderToken = savedOrder.orderAccessToken;

      // Persist snapshot to local recent orders for customer reference
      try {
        const stored = JSON.parse(
          localStorage.getItem("makhe_recent_orders") || "[]",
        );
        const snapshot = {
          orderNumber,
          orderToken,
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          subtotal: savedOrder.subtotal,
          shippingAmount: savedOrder.shippingAmount || 0,
          total: savedOrder.total,
          itemsCount: totalItems,
          orderStatus: savedOrder.orderStatus || "confirmed",
          paymentMethod,
          paymentStatus:
            savedOrder.paymentStatus ||
            (paymentMethod === "cod" ? "pending" : "verification_pending"),
          upiTransactionId: savedOrder.upiTransactionId || undefined,
          recipientName: formData.fullName,
          shippingAddress: {
            fullName: formData.fullName,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: formData.country,
          },
          items: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            weight: item.product.weight,
            quantity: item.quantity,
            unitPrice: item.product.price,
            lineTotal: item.product.price * item.quantity,
          })),
        };
        localStorage.setItem(
          "makhe_recent_orders",
          JSON.stringify([snapshot, ...stored].slice(0, 10)),
        );
      } catch {
        // Safe fallback
      }

      // CLEAR CART ONLY AFTER MONGODB CONFIRMS PERSISTENCE
      clearCart();

      // Show order placed successfully screen
      setPlacedOrder({
        orderNumber,
        orderAccessToken: orderToken,
        total: savedOrder.total,
        subtotal: savedOrder.subtotal,
        paymentMethod,
        upiTransactionId: savedOrder.upiTransactionId,
        recipientName: formData.fullName,
        phone: formData.phone,
        itemsCount: totalItems,
      });

      setIsProcessing(false);
      setProcessingStatus("");
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStatus("");
      setServerError(
        err.message ||
          "An error occurred while creating your order. Please check your details and retry.",
      );
    }
  };

  // ============================================================================
  // SUCCESS STATE — SHOWN ONLY AFTER MONGODB PERSISTENCE IS CONFIRMED
  // ============================================================================
  if (placedOrder) {
    return (
      <div className="checkout-page w-full bg-[#FAF7F2] min-h-screen py-16 lg:py-24 selection:bg-[#142B1A] selection:text-[#FAF7F2]">
        <div className="checkout-container max-w-2xl mx-auto px-4 sm:px-6">
          <div className="checkout-card bg-white rounded-3xl border border-[#DDD1BE] p-8 sm:p-12 shadow-xl text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-[#EBF7EE] border-2 border-[#1E7535] text-[#1E7535] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={44} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#8C6D1F] font-sans-brand">
                CONFIRMED BY MAKHÉ INDIA
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif-brand font-bold text-[#142B1A]">
                Order Placed Successfully
              </h1>
              <p className="text-sm text-[#4E6152] font-sans-brand max-w-md mx-auto">
                Thank you, <strong>{placedOrder.recipientName}</strong>. Your
                order has been registered and is being prepared for dispatch
                from Bihar.
              </p>
            </div>

            {/* Key Order Details Box */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E5DAC6] text-left space-y-3 font-sans-brand text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-[#E5DAC6]">
                <span className="text-[#6B8071] text-xs uppercase tracking-wider font-semibold">
                  Order Number
                </span>
                <span className="font-mono font-bold text-[#142B1A] text-base">
                  {placedOrder.orderNumber}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[#E5DAC6]">
                <span className="text-[#6B8071] text-xs uppercase tracking-wider font-semibold">
                  Order Total
                </span>
                <span className="font-serif-brand font-bold text-xl text-[#142B1A]">
                  ₹{placedOrder.total}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[#E5DAC6]">
                <span className="text-[#6B8071] text-xs uppercase tracking-wider font-semibold">
                  Payment Method
                </span>
                <span className="font-bold text-[#142B1A]">
                  {placedOrder.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "UPI Payment"}
                </span>
              </div>

              {placedOrder.paymentMethod === "cod" ? (
                <div className="pt-1 flex items-start gap-2 text-xs text-[#2A6E3B]">
                  <Banknote size={16} className="shrink-0 mt-0.5" />
                  <span>
                    Please keep exact cash of{" "}
                    <strong>₹{placedOrder.total}</strong> ready upon courier
                    delivery.
                  </span>
                </div>
              ) : (
                <div className="pt-1 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[#556958]">
                    <span>UPI Reference / UTR:</span>
                    <span className="font-mono font-bold text-[#142B1A]">
                      {placedOrder.upiTransactionId}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[#8C6D1F]">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Your payment verification is pending manual review by our
                      finance team before parcel dispatch.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const url = placedOrder.orderAccessToken
                    ? `/order-confirmation/${
                        placedOrder.orderNumber
                      }?token=${encodeURIComponent(
                        placedOrder.orderAccessToken,
                      )}`
                    : `/order-confirmation/${placedOrder.orderNumber}`;
                  onNavigate(url);
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#234A30] cursor-pointer inline-flex items-center justify-center gap-2 shadow-md"
              >
                <span>View Order Details</span>
                <ArrowRight size={15} className="text-[#E5C778]" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("/")}
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-[#142B1A] border border-[#D9CBB3] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#FAF7F2] cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EMPTY CART STATE
  // ============================================================================
  if (cart.length === 0) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-screen py-16 lg:py-24 selection:bg-[#142B1A] selection:text-[#FAF7F2]">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="text-center py-16 bg-white rounded-3xl border border-[#DDD1BE] p-8 space-y-4 shadow-sm">
            <Package size={44} className="text-[#8C6D1F] mx-auto" />
            <h2 className="text-2xl font-serif-brand font-bold text-[#142B1A]">
              Your Cart is Empty
            </h2>
            <p className="text-sm text-[#4E6152] font-sans-brand">
              Please select your favourite Makhé makhana pack before proceeding
              to checkout.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate("/")}
                className="px-7 py-3.5 bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#234A30] cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN CHECKOUT FORM & ORDER SUMMARY
  // ============================================================================
  return (
    <div className="checkout-page w-full bg-[#FAF7F2] min-h-screen py-12 lg:py-20 selection:bg-[#142B1A] selection:text-[#FAF7F2]">
      <div className="checkout-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Back Navigation */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => onNavigate("/cart")}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8C6D1F] hover:text-[#142B1A] font-bold font-sans-brand transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="pb-8 border-b border-[#E5DAC6] mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C59B27] font-sans-brand block mb-2">
              MAKHÉ INDIA DISPATCH
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif-brand font-bold text-[#142B1A]">
              Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#2A6E3B] font-bold font-sans-brand bg-[#EBF7EE] px-3.5 py-1.5 rounded-full border border-[#BCE1C6]">
            <ShieldCheck size={14} />
            <span>Direct Hub Dispatch • Free Shipping</span>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-8 p-5 rounded-2xl bg-[#FDF2F2] border border-[#F5C2C7] flex items-start gap-3.5 text-sm text-[#C0392B]">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">Submission Notice:</strong>
              <p className="font-sans-brand">{serverError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ================================================================
              LEFT: CHECKOUT FORM (7 cols on desktop)
          ================================================================ */}
          <div className="lg:col-span-7">
            <form onSubmit={handlePlaceOrder} noValidate className="space-y-8">
              {/* 1. CUSTOMER INFORMATION */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD1BE] shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#F2ECE1]">
                  <span className="w-6 h-6 rounded-full bg-[#142B1A] text-[#E5C778] flex items-center justify-center text-xs font-bold font-sans-brand">
                    1
                  </span>
                  <h2 className="text-xl font-serif-brand font-bold text-[#142B1A]">
                    CUSTOMER DETAILS
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name * */}
                  <div>
                    <label
                      htmlFor="checkout-fullname"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      FULL NAME <span className="text-[#C0392B]">*</span>
                    </label>
                    <input
                      id="checkout-fullname"
                      type="text"
                      disabled={isProcessing}
                      placeholder="e.g. Vikram Sharma"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName)
                          setErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.fullName
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A]"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone Number * */}
                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      PHONE NUMBER <span className="text-[#C0392B]">*</span>
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      disabled={isProcessing}
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.phone
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A]"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Address (Optional) */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="checkout-email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      EMAIL ADDRESS{" "}
                      <span className="text-xs normal-case text-[#7B8F80] font-normal">
                        (optional — for order confirmation receipt)
                      </span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      disabled={isProcessing}
                      placeholder="e.g. vikram@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.email
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A]"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. DELIVERY ADDRESS */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD1BE] shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#F2ECE1]">
                  <span className="w-6 h-6 rounded-full bg-[#142B1A] text-[#E5C778] flex items-center justify-center text-xs font-bold font-sans-brand">
                    2
                  </span>
                  <h2 className="text-xl font-serif-brand font-bold text-[#142B1A]">
                    DELIVERY ADDRESS
                  </h2>
                </div>

                {/* Address Line 1 * */}
                <div>
                  <label
                    htmlFor="checkout-address1"
                    className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                  >
                    ADDRESS <span className="text-[#C0392B]">*</span>
                  </label>
                  <input
                    id="checkout-address1"
                    type="text"
                    disabled={isProcessing}
                    placeholder="House / Flat / Street Name"
                    value={formData.addressLine1}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        addressLine1: e.target.value,
                      });
                      if (errors.addressLine1)
                        setErrors((prev) => ({ ...prev, addressLine1: "" }));
                    }}
                    className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                      errors.addressLine1
                        ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                        : "border-[#D9CBB3] focus:border-[#142B1A]"
                    }`}
                  />
                  {errors.addressLine1 && (
                    <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                {/* Address Line 2 */}
                <div>
                  <label
                    htmlFor="checkout-address2"
                    className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                  >
                    ADDRESS LINE 2{" "}
                    <span className="text-xs normal-case text-[#7B8F80] font-normal">
                      (optional landmark or area)
                    </span>
                  </label>
                  <input
                    id="checkout-address2"
                    type="text"
                    disabled={isProcessing}
                    placeholder="Area, Sector or Landmark"
                    value={formData.addressLine2}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine2: e.target.value })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-[#D9CBB3] bg-[#FAF7F2] text-sm text-[#142B1A] focus:outline-none focus:border-[#142B1A]"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="checkout-city"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      CITY <span className="text-[#C0392B]">*</span>
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      disabled={isProcessing}
                      placeholder="e.g. Patna / Mumbai / Delhi"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        if (errors.city)
                          setErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.city
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A]"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-state"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      STATE <span className="text-[#C0392B]">*</span>
                    </label>
                    <input
                      id="checkout-state"
                      type="text"
                      disabled={isProcessing}
                      placeholder="e.g. Bihar / Maharashtra"
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({ ...formData, state: e.target.value });
                        if (errors.state)
                          setErrors((prev) => ({ ...prev, state: "" }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.state
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A]"
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* PIN Code & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="checkout-pincode"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      PIN CODE <span className="text-[#C0392B]">*</span>
                    </label>
                    <input
                      id="checkout-pincode"
                      type="text"
                      disabled={isProcessing}
                      maxLength={6}
                      placeholder="e.g. 800001"
                      value={formData.pincode}
                      onChange={(e) => {
                        setFormData({ ...formData, pincode: e.target.value });
                        if (errors.pincode)
                          setErrors((prev) => ({ ...prev, pincode: "" }));
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] transition-colors focus:outline-none ${
                        errors.pincode
                          ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-[#D9CBB3] focus:border-[#142B1A]"
                      }`}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                        {errors.pincode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-country"
                      className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                    >
                      COUNTRY
                    </label>
                    <input
                      id="checkout-country"
                      type="text"
                      disabled
                      value="India"
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D9CBB3] bg-[#EAE0CD]/40 text-sm text-[#142B1A] font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* ================================================================
                  3. PAYMENT METHOD — UPI
              ================================================================ */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD1BE] shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#F2ECE1]">
                  <span className="w-6 h-6 rounded-full bg-[#142B1A] text-[#E5C778] flex items-center justify-center text-xs font-bold font-sans-brand">
                    3
                  </span>
                  <h2 className="text-xl font-serif-brand font-bold text-[#142B1A]">
                    SELECT PAYMENT METHOD
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="block p-5 rounded-2xl border-2 border-[#142B1A] bg-[#FAF7F2] shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-sm text-[#142B1A] block">
                          UPI Payment
                        </span>
                        <span className="text-xs text-[#596E5F]">
                          Pay via Google Pay, PhonePe, Paytm, BHIM, or any
                          banking UPI app.
                        </span>
                      </div>
                      <QrCode size={20} className="text-[#8C6D1F] shrink-0" />
                    </div>
                  </div>
                </div>

                {/* ================================================================
                    UPI PAYMENT BOX (Shown when UPI is selected)
                ================================================================ */}
                {paymentMethod === "upi" && (
                  <div className="mt-6 pt-6 border-t border-[#E5DAC6] space-y-6">
                    {/* Live Official UPI Payment Box */}
                    <div className="p-6 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] space-y-5">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Official QR Code Standee */}
                        <div className="w-56 sm:w-60 bg-black p-2 rounded-2xl border border-[#DDD1BE] shrink-0 shadow-md flex flex-col items-center justify-center">
                          <img
                            src={UPI_QR_IMAGE}
                            alt="Makhé India Official UPI QR Code"
                            className="w-full h-auto object-contain rounded-xl"
                            loading="eager"
                          />
                          <span className="text-[10px] text-[#A1A1AA] font-sans-brand mt-1.5 tracking-wide text-center">
                            Scan with PhonePe, GPay, Paytm or BHIM
                          </span>
                        </div>
                        <div className="space-y-4 flex-1 text-center sm:text-left">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D1F] block">
                              OFFICIAL MAKHÉ INDIA UPI PAYMENT
                            </span>
                            <p className="text-xs text-[#596E5F] mt-0.5">
                              Scan the QR code directly with any UPI application
                              or use the ID below.
                            </p>
                          </div>

                          <div className="space-y-1 bg-white/70 p-3.5 rounded-xl border border-[#E5DAC6]">
                            <span className="text-xs text-[#596E5F] block font-semibold">
                              Total Payable Amount:
                            </span>
                            <span className="text-3xl font-serif-brand font-bold text-[#142B1A]">
                              ₹{subtotal}
                            </span>
                          </div>

                          {/* UPI ID + Copy Button */}
                          <div className="space-y-1.5">
                            <span className="text-xs text-[#6B8071] font-semibold block">
                              Merchant VPA / UPI ID:
                            </span>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                              <div className="px-3.5 py-2 rounded-xl bg-white border border-[#D9CBB3] font-mono text-xs font-bold text-[#142B1A] select-all">
                                {UPI_ID}
                              </div>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="px-3.5 py-2 rounded-xl bg-[#142B1A] text-[#FAF7F2] text-xs font-bold font-sans-brand hover:bg-[#234A30] cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-xs"
                              >
                                {copiedUpi ? (
                                  <>
                                    <Check
                                      size={14}
                                      className="text-[#E5C778]"
                                    />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    <span>Copy UPI ID</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* UTR Input Section */}
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-semibold text-[#142B1A] font-sans-brand">
                        After completing the payment, enter your UPI Transaction
                        ID / UTR:
                      </p>
                      <div>
                        <label
                          htmlFor="checkout-utr"
                          className="block text-xs font-bold uppercase tracking-wider text-[#142B1A] mb-2 font-sans-brand"
                        >
                          UPI TRANSACTION ID / UTR{" "}
                          <span className="text-[#C0392B]">*</span>
                        </label>
                        <input
                          id="checkout-utr"
                          type="text"
                          disabled={isProcessing}
                          placeholder="e.g. 423456789012"
                          value={upiTransactionId}
                          onChange={(e) => {
                            setUpiTransactionId(e.target.value);
                            if (errors.upiTransactionId)
                              setErrors((prev) => ({
                                ...prev,
                                upiTransactionId: "",
                              }));
                          }}
                          className={`w-full px-4 py-3.5 rounded-xl border bg-[#FAF7F2] text-sm text-[#142B1A] font-mono transition-colors focus:outline-none ${
                            errors.upiTransactionId
                              ? "border-[#C0392B] ring-1 ring-[#C0392B]"
                              : "border-[#D9CBB3] focus:border-[#142B1A]"
                          }`}
                        />
                        {errors.upiTransactionId && (
                          <p className="text-xs text-[#C0392B] mt-1.5 font-medium font-sans-brand">
                            {errors.upiTransactionId}
                          </p>
                        )}
                        <p className="text-[11px] text-[#7B8F80] mt-1.5 font-sans-brand">
                          * Entering a UTR registers the order for manual admin
                          verification before parcel dispatch.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================
                  ACTION BUTTON WITH DUPLICATE CLICK PROTECTION
              ================================================================ */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-8 rounded-full bg-[#142B1A] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] font-sans-brand hover:bg-[#234A30] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin text-[#E5C778]"
                      />
                      <span>{processingStatus || "CONFIRMING ORDER..."}</span>
                    </>
                  ) : paymentMethod === "upi" ? (
                    <>
                      <span>I HAVE PAID — PLACE ORDER</span>
                      <ArrowRight size={16} className="text-[#E5C778]" />
                    </>
                  ) : (
                    <>
                      <span>PLACE ORDER</span>
                      <ArrowRight size={16} className="text-[#E5C778]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ================================================================
              RIGHT: ORDER SUMMARY (5 cols on desktop)
          ================================================================ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#DDD1BE] p-6 sm:p-8 shadow-md space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DAC6]">
                <h2 className="text-xl font-serif-brand font-bold text-[#142B1A]">
                  Order Summary
                </h2>
                <span className="text-xs uppercase tracking-wider font-bold text-[#8C6D1F]">
                  {totalItems} {totalItems === 1 ? "pack" : "packs"}
                </span>
              </div>

              {/* Item List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const lineTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-4 py-2 border-b border-[#F2ECE1] last:border-0"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-16 bg-[#F4EFE6] rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-[#E5DAC6]">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain drop-shadow-xs"
                          />
                        </div>
                        <div>
                          <h4 className="font-serif-brand font-bold text-sm text-[#142B1A]">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-[#8C6D1F] font-bold uppercase tracking-wider font-sans-brand">
                            {item.product.weight}
                          </p>
                          <p className="text-[11px] text-[#687C6C] font-sans-brand">
                            Qty: {item.quantity} × ₹{item.product.price}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#142B1A]">
                          ₹{lineTotal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 pt-4 border-t border-[#E5DAC6] text-xs font-sans-brand">
                <div className="flex justify-between items-baseline">
                  <span className="text-[#556958]">Items Subtotal</span>
                  <span className="text-base font-bold text-[#142B1A]">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-[#556958]">Shipping</span>
                  <span className="text-[#1E7535] font-bold uppercase">
                    FREE (Bihar Direct)
                  </span>
                </div>
              </div>

              {/* Final Payable Total */}
              <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#DDD1BE] flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-[#142B1A] block">
                    TOTAL PAYABLE
                  </span>
                  <span className="text-[11px] text-[#6B8071]">
                    Calculated on authoritative pricing
                  </span>
                </div>
                <span className="text-2xl font-serif-brand font-bold text-[#142B1A]">
                  ₹{subtotal}
                </span>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2 pt-2 text-[11px] text-[#556958]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#1E7535] shrink-0" />
                  <span>Hygienically Packed in Sealed Pouches</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#C59B27] shrink-0" />
                  <span>100% Whole Jumbo Harvest from Bihar Ponds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
