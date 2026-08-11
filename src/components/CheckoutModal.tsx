import React, { useState } from 'react';
import { CartItem, Order, User } from '../types';
import { api } from '../services/api';
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, AlertCircle, RefreshCw, Truck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: User | null;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onClearCart
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Address State
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [street, setStreet] = useState('100 Technology Way');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94105');
  const [country, setCountry] = useState('USA');

  // Card State
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isSubscription, setIsSubscription] = useState(false);

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !street || !city) return;
    setStep(2);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');
    setStep(3); // Security Processing Screen

    try {
      const res = await api.processPayment({
        userEmail,
        userName,
        items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        cardNumber,
        cardExpiry,
        cardCvc,
        shippingAddress: { street, city, state, zip, country },
        isSubscription,
        subscriptionPlan: isSubscription ? 'Enterprise Recurring Service Plan' : undefined
      });

      setCompletedOrder(res.order);
      onClearCart();
      setStep(4); // Receipt Step
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed');
      setStep(2); // return to card entry
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {step === 4 ? 'Order Confirmation' : 'Stripe Encrypted Checkout'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 4 && (
          <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-around text-xs font-semibold text-slate-500">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-indigo-600/10 flex items-center justify-center text-[10px]">1</span>
              <span>Shipping</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-indigo-600/10 flex items-center justify-center text-[10px]">2</span>
              <span>Payment</span>
            </div>
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-indigo-600/10 flex items-center justify-center text-[10px]">3</span>
              <span>Encryption</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <form onSubmit={handleNextToPayment} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-500" />
                <span>Shipping Address & Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">State / Prov</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Total: ${total.toFixed(2)}</span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Continue to Payment &rarr;
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: STRIPE CARD PAYMENT */}
          {step === 2 && (
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>Credit Card Details (Stripe API Proxy)</span>
              </h3>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-slate-500 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full p-2.5 pr-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Use card ending in <code className="text-indigo-500">0000</code> or CVC <code className="text-indigo-500">000</code> to test failed transaction alerts.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">CVC Code</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Option */}
              <label className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                  Enroll in Enterprise Maintenance Auto-Refill ($89/month)
                </span>
              </label>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:underline"
                >
                  &larr; Back to Shipping
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ${total.toFixed(2)} Now</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: TRANSACTION SECURITY PROCESSING */}
          {step === 3 && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-10 h-10 mx-auto text-indigo-600 animate-spin" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Encrypting Card Tokens & Processing Transaction...
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Communicating with Stripe Payment Proxy. Generating SHA-256 immutable audit log block.
              </p>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMATION */}
          {step === 4 && completedOrder && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Order #{completedOrder.id} Placed!
              </h3>

              <p className="text-slate-500 max-w-md mx-auto">
                A confirmation email has been dispatched to <strong className="text-slate-800 dark:text-slate-200">{completedOrder.userEmail}</strong>.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Tracking Code:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{completedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-slate-900 dark:text-slate-100">${completedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Payment Audit:</span>
                  <span className="text-emerald-500">AES-256 Verified (ID: {completedOrder.paymentId})</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Return to Storefront
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
