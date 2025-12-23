
import React, { useState, useEffect } from 'react';

interface PaymentGatewayProps {
  amount: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onPaymentSuccess, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('card');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate API delay
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-shield-halved text-teal-600 text-xl"></i>
            <span className="font-bold text-slate-700">Secure Checkout</span>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-slate-500 text-sm mb-1">Amount to Pay</p>
            <h2 className="text-4xl font-extrabold text-slate-900">₹{amount}</h2>
          </div>

          <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-xl">
            {(['card', 'upi', 'netbanking'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  method === m ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500'
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            {method === 'card' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Card Number</label>
                  <input
                    required
                    disabled={processing}
                    type="text"
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry</label>
                    <input
                      required
                      disabled={processing}
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">CVV</label>
                    <input
                      required
                      disabled={processing}
                      type="password"
                      placeholder="***"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">UPI ID</label>
                  <input
                    required
                    disabled={processing}
                    type="text"
                    placeholder="username@upi"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="flex justify-center py-4">
                  <div className="p-2 border-2 border-slate-100 rounded-xl">
                    <i className="fas fa-qrcode text-6xl text-slate-300"></i>
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Bank</label>
                  <select
                    disabled={processing}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none appearance-none"
                  >
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-80"
            >
              {processing ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  Processing...
                </>
              ) : (
                <>Pay ₹{amount}</>
              )}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 mt-6 flex items-center justify-center gap-1 uppercase tracking-widest">
            <i className="fas fa-lock"></i> 256-bit SSL Encrypted Payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
