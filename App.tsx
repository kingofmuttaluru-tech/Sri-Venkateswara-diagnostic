
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TestCatalog from './components/TestCatalog';
import TrackingView from './components/TrackingView';
import ConfirmationView from './components/ConfirmationView';
import PaymentGateway from './components/PaymentGateway';
import { DiagnosticTest, Booking, User } from './types';
import { TIME_SLOTS, TESTS } from './constants';
import { getHealthAdvice } from './services/geminiService';

const STORAGE_KEYS = {
  USER: 'sv_diagnostic_user',
  BOOKING: 'sv_diagnostic_booking', // Current active booking
  HISTORY: 'sv_diagnostic_history', // Array of all past bookings
  FEEDBACK: 'sv_diagnostic_feedback',
  NEW_CUSTOMER: 'sv_diagnostic_new_cust',
  APP_INSTALLED: 'sv_diagnostic_app_installed'
};

const simulateSMSGateway = (mobile: string, message: string) => {
  console.log(`%c[SMS Gateway] To: ${mobile}\nMessage: ${message}`, "color: #0f766e; font-weight: bold; border: 1px solid #0f766e; padding: 4px; border-radius: 4px;");
};

const App: React.FC = () => {
  const [splash, setSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [cart, setCart] = useState<DiagnosticTest[]>([]);
  const [user, setUser] = useState<User>({ mobileNumber: '', isLoggedIn: false });
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [showSmsToast, setShowSmsToast] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Persistence: Hydration
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const savedBooking = localStorage.getItem(STORAGE_KEYS.BOOKING);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedFeedback = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    const savedNewCust = localStorage.getItem(STORAGE_KEYS.NEW_CUSTOMER);
    const savedInstalled = localStorage.getItem(STORAGE_KEYS.APP_INSTALLED);

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedBooking) setActiveBooking(JSON.parse(savedBooking));
    if (savedHistory) setBookingHistory(JSON.parse(savedHistory));
    if (savedFeedback) setFeedbackSubmitted(JSON.parse(savedFeedback));
    if (savedNewCust) setIsNewCustomer(JSON.parse(savedNewCust));
    if (savedInstalled) setShowInstallBanner(false);

    const timer = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Persistence: Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKING, JSON.stringify(activeBooking));
  }, [activeBooking]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(bookingHistory));
  }, [bookingHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackSubmitted));
  }, [feedbackSubmitted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NEW_CUSTOMER, JSON.stringify(isNewCustomer));
  }, [isNewCustomer]);

  const [reportFilter, setReportFilter] = useState<string>('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    mobile: '',
    address: '',
    collectionType: 'Home' as 'Home' | 'Centre',
    date: '',
    slot: TIME_SLOTS[0]
  });

  const handleAddToCart = (test: DiagnosticTest) => {
    setCart(prev => [...prev, test]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
  const discountAmount = isNewCustomer ? Math.round(subtotal * 0.4) : 0;
  const totalPrice = subtotal - discountAmount;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const finalizeBooking = () => {
    const bookingId = 'SV' + Math.floor(Math.random() * 90000 + 10000);
    const newBooking: Booking = {
      id: bookingId,
      testIds: cart.map(t => t.id),
      patientName: bookingDetails.name,
      mobileNumber: bookingDetails.mobile,
      date: bookingDetails.date,
      timeSlot: bookingDetails.slot,
      collectionType: bookingDetails.collectionType,
      address: bookingDetails.collectionType === 'Home' ? bookingDetails.address : undefined,
      status: 'Booked',
      paymentStatus: 'Paid',
      totalAmount: totalPrice
    };

    setActiveBooking(newBooking);
    setBookingHistory(prev => [newBooking, ...prev]);
    setUser({ mobileNumber: bookingDetails.mobile, isLoggedIn: true });
    
    const smsMessage = `Hi ${bookingDetails.name}, your booking ${bookingId} at Sri Venkateswara Diagnostic is confirmed for ${bookingDetails.date} (${bookingDetails.slot}). Total: ₹${totalPrice}. Thank you!`;
    simulateSMSGateway(bookingDetails.mobile, smsMessage);
    
    setShowSmsToast(true);
    setTimeout(() => setShowSmsToast(false), 5000);

    setCart([]);
    setShowPayment(false);
    setIsNewCustomer(false);
    setCurrentPage('confirmation');
  };

  const handleInstallApp = () => {
    setInstalling(true);
    setInstallProgress(0);
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setInstalling(false);
            setShowInstallBanner(false);
            localStorage.setItem(STORAGE_KEYS.APP_INSTALLED, 'true');
            alert("SV Diagnostic App installed successfully! You can now access it from your home screen.");
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setBookingDetails(prev => ({
          ...prev,
          address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)} (Location detected via GPS)`
        }));
      }, () => {
        alert("Unable to retrieve location. Please type your address manually.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const askAi = async () => {
    if (!symptoms.trim()) return;
    setLoadingAi(true);
    const advice = await getHealthAdvice(symptoms);
    setAiResponse(advice);
    setLoadingAi(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mobile = (e.target as any).mobile.value;
    if (mobile.length === 10) {
      setUser({ mobileNumber: mobile, isLoggedIn: true });
      setIsNewCustomer(false);
      
      // If no history exists, populate with mock data for demonstration
      if (bookingHistory.length === 0) {
        const mockHistory: Booking[] = [
          {
            id: 'SV88123',
            testIds: ['t1', 't5'],
            patientName: 'Self',
            mobileNumber: mobile,
            date: '2023-11-15',
            timeSlot: '08:00 AM - 09:00 AM',
            collectionType: 'Centre',
            status: 'Report Ready',
            paymentStatus: 'Paid',
            totalAmount: 1000
          },
          {
            id: 'SV72456',
            testIds: ['t2'],
            patientName: 'Self',
            mobileNumber: mobile,
            date: '2023-08-10',
            timeSlot: '07:00 AM - 08:00 AM',
            collectionType: 'Home',
            status: 'Report Ready',
            paymentStatus: 'Paid',
            totalAmount: 500
          }
        ];
        setBookingHistory(mockHistory);
      }
      setCurrentPage('reports');
    }
  };

  const handleLogout = () => {
    if(confirm("Are you sure you want to logout? All local data will be cleared.")) {
      setUser({ mobileNumber: '', isLoggedIn: false });
      setActiveBooking(null);
      setBookingHistory([]);
      setFeedbackSubmitted(false);
      localStorage.clear();
      setCurrentPage('home');
      setIsNewCustomer(true);
    }
  };

  const navigateTo = (page: string) => {
    setShowPayment(false);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const isReportInFilter = (reportDate: string) => {
    if (reportFilter === 'all') return true;
    const date = new Date(reportDate);
    const now = new Date();
    if (reportFilter === '7days') return (now.getTime() - date.getTime()) / (1000 * 3600 * 24) <= 7;
    if (reportFilter === '30days') return (now.getTime() - date.getTime()) / (1000 * 3600 * 24) <= 30;
    return true;
  };

  const getTestNames = (testIds: string[]) => {
    return TESTS.filter(t => testIds.includes(t.id)).map(t => t.name).join(', ');
  };

  if (splash) {
    return (
      <div className="fixed inset-0 bg-teal-800 z-[1000] flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
          <i className="fas fa-microscope text-5xl"></i>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sri Venkateswara Diagnostic</h1>
        <p className="text-teal-200 text-sm mt-2 font-medium">Precision in every report</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      {/* Installation Banner */}
      {showInstallBanner && currentPage === 'home' && (
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-16 z-40 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-microscope"></i>
            </div>
            <div>
              <p className="text-xs font-bold">Install SV Diagnostic App</p>
              <p className="text-[10px] opacity-70">For a faster, better experience</p>
            </div>
          </div>
          <button 
            onClick={handleInstallApp}
            className="bg-teal-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition"
          >
            Install
          </button>
        </div>
      )}

      {/* Installation Progress Overlay */}
      {installing && (
        <div className="fixed inset-0 bg-slate-900/90 z-[2000] flex flex-col items-center justify-center p-8 text-white">
          <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce">
            <i className="fas fa-download text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Downloading App</h2>
          <p className="text-slate-400 text-sm mb-8">Connecting to Play Store servers...</p>
          <div className="w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-500 transition-all duration-300" 
              style={{ width: `${installProgress}%` }}
            ></div>
          </div>
          <p className="mt-4 text-teal-400 font-bold">{installProgress}%</p>
        </div>
      )}

      {/* SMS Sent Toast Notification */}
      {showSmsToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10 duration-500">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-sms text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">Confirmation Sent</p>
            <p className="text-[11px] opacity-80">A booking confirmation SMS was sent to {activeBooking?.mobileNumber}.</p>
          </div>
          <button onClick={() => setShowSmsToast(false)} className="text-slate-500 hover:text-white transition">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <Navbar 
        onNavigate={navigateTo} 
        currentPage={currentPage} 
        isLoggedIn={user.isLoggedIn} 
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {showPayment && (
          <PaymentGateway 
            amount={totalPrice} 
            onPaymentSuccess={finalizeBooking}
            onCancel={() => setShowPayment(false)}
          />
        )}

        {currentPage === 'home' && (
          <div className="space-y-8">
            {/* Play Store Banner Hero */}
            <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-3xl p-6 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 md:max-w-xl">
                <span className="bg-teal-700/50 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-4 inline-block">Official Play Store App</span>
                <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">Quality Diagnostics <br/>at your Fingertips</h1>
                <p className="text-teal-100 text-sm md:text-lg mb-8 opacity-90">Download our mobile app to track reports live and get instant health alerts.</p>
                
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleInstallApp} className="bg-white text-slate-900 px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg hover:bg-slate-50 transition active:scale-95">
                    <i className="fab fa-google-play text-2xl text-teal-600"></i>
                    <div className="text-left">
                      <p className="text-[8px] uppercase font-bold text-slate-500">Get it on</p>
                      <p className="text-sm font-bold">Google Play</p>
                    </div>
                  </button>
                  <button onClick={handleInstallApp} className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg border border-slate-800 active:scale-95 transition">
                    <i className="fab fa-apple text-2xl"></i>
                    <div className="text-left">
                      <p className="text-[8px] uppercase font-bold text-slate-500">Download on</p>
                      <p className="text-sm font-bold">App Store</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div onClick={() => navigateTo('booking')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:border-teal-200 transition">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-plus-circle text-xl"></i>
                </div>
                <span className="text-xs font-bold text-slate-700">Book Test</span>
              </div>
              <div onClick={() => navigateTo('reports')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:border-teal-200 transition">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-medical text-xl"></i>
                </div>
                <span className="text-xs font-bold text-slate-700">My Reports</span>
              </div>
              <div onClick={() => navigateTo('tracking')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:border-teal-200 transition">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-truck text-xl"></i>
                </div>
                <span className="text-xs font-bold text-slate-700">Track Sample</span>
              </div>
              <div onClick={() => navigateTo('home')} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:border-teal-200 transition">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-robot text-xl"></i>
                </div>
                <span className="text-xs font-bold text-slate-700">AI Assistant</span>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">Popular Test Packages</h2>
              <TestCatalog onAddToCart={handleAddToCart} cart={cart} isFirstBooking={isNewCustomer} />
            </section>
          </div>
        )}

        {currentPage === 'booking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <i className="fas fa-user-circle text-teal-600"></i>
                  Patient Details
                </h2>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                      <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500" placeholder="John Doe" value={bookingDetails.name} onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                      <input required type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500" placeholder="10-digit mobile" value={bookingDetails.mobile} onChange={e => setBookingDetails({...bookingDetails, mobile: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Service Type</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setBookingDetails({...bookingDetails, collectionType: 'Home'})} className={`flex-1 py-3 rounded-2xl border font-bold text-sm transition ${bookingDetails.collectionType === 'Home' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><i className="fas fa-home mr-2"></i> Home Collection</button>
                      <button type="button" onClick={() => setBookingDetails({...bookingDetails, collectionType: 'Centre'})} className={`flex-1 py-3 rounded-2xl border font-bold text-sm transition ${bookingDetails.collectionType === 'Centre' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><i className="fas fa-building mr-2"></i> Visit Centre</button>
                    </div>
                  </div>

                  {bookingDetails.collectionType === 'Home' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                        <button type="button" onClick={detectLocation} className="text-[10px] font-bold text-teal-600 flex items-center gap-1"><i className="fas fa-location-crosshairs"></i> Detect Location</button>
                      </div>
                      <textarea required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500" placeholder="House No, Landmark, Area..." rows={3} value={bookingDetails.address} onChange={e => setBookingDetails({...bookingDetails, address: e.target.value})} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
                      <input required type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500" value={bookingDetails.date} onChange={e => setBookingDetails({...bookingDetails, date: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Slot</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 text-sm" value={bookingDetails.slot} onChange={e => setBookingDetails({...bookingDetails, slot: e.target.value})}>
                        {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={cart.length === 0} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg disabled:opacity-50">Proceed to Payment (₹{totalPrice})</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Cart Summary</h3>
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-slate-400 italic py-4 text-center text-sm">Your cart is empty.</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                          <p className="text-teal-600 font-semibold text-[10px]">₹{item.price}</p>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-2"><i className="fas fa-times"></i></button>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  {isNewCustomer && cart.length > 0 && <div className="flex justify-between text-rose-500 text-xs font-bold"><span>40% First Booking Off</span><span>-₹{discountAmount}</span></div>}
                  <div className="flex justify-between font-extrabold text-xl text-slate-900 pt-3 border-t mt-2"><span>Payable</span><span>₹{totalPrice}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'confirmation' && activeBooking && (
          <ConfirmationView booking={activeBooking} onTrack={() => navigateTo('tracking')} onHome={() => navigateTo('home')} />
        )}

        {currentPage === 'tracking' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 px-2">Live Sample Tracking</h2>
            {activeBooking ? (
              <TrackingView booking={activeBooking} />
            ) : (
              <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                <i className="fas fa-truck text-4xl text-slate-200 mb-4"></i>
                <p className="text-slate-500 text-sm font-medium">No active samples to track.</p>
              </div>
            )}
          </div>
        )}

        {currentPage === 'reports' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!user.isLoggedIn ? (
              <div className="max-w-md mx-auto py-12">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                  <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-lock text-2xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Patient Login</h2>
                  <p className="text-slate-500 text-sm mb-8">Access your diagnostic reports securely.</p>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <input name="mobile" required type="tel" className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none" placeholder="10-digit Mobile Number" pattern="[0-9]{10}" />
                    <button type="submit" className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition">View Reports</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-1 px-2">
                  <h2 className="text-2xl font-extrabold text-slate-800">Medical History & Reports</h2>
                  <p className="text-slate-400 text-xs">Records for {user.mobileNumber}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Filter:</span>
                  <select 
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none flex-1"
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                  >
                    <option value="all">All Records</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {bookingHistory.length > 0 ? (
                    bookingHistory
                      .filter(b => isReportInFilter(b.date))
                      .map((booking) => (
                        <div key={booking.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm transition hover:shadow-md">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{booking.id}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  booking.status === 'Report Ready' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <h3 className="text-md font-bold text-slate-800 mt-1">{getTestNames(booking.testIds)}</h3>
                              <div className="flex items-center gap-3 text-slate-400 text-[10px] mt-1">
                                <span><i className="far fa-calendar mr-1"></i> {booking.date}</span>
                                <span><i className="fas fa-indian-rupee-sign mr-1"></i> ₹{booking.totalAmount}</span>
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              booking.status === 'Report Ready' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-300'
                            }`}>
                              <i className={`fas ${booking.status === 'Report Ready' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                if (booking.status === 'Report Ready') {
                                  alert("Opening secure PDF viewer...");
                                } else {
                                  navigateTo('tracking');
                                  setActiveBooking(booking);
                                }
                              }}
                              className={`flex-1 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition ${
                                booking.status === 'Report Ready' 
                                  ? 'bg-teal-600 text-white hover:bg-teal-700' 
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              <i className={`fas ${booking.status === 'Report Ready' ? 'fa-file-pdf' : 'fa-truck-fast'}`}></i>
                              {booking.status === 'Report Ready' ? 'Download PDF' : 'Track Sample'}
                            </button>
                            <button className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-3 rounded-xl hover:bg-slate-200 transition">View Details</button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="bg-white p-12 rounded-3xl text-center border border-slate-100 text-slate-400 italic text-sm">No records found.</div>
                  )}
                </div>
                
                {!feedbackSubmitted && bookingHistory.length > 0 && (
                  <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-xl mt-8">
                    <h3 className="text-lg font-bold mb-1">Feedback</h3>
                    <p className="text-slate-400 text-[10px] mb-4">How was your experience today?</p>
                    <button onClick={() => setFeedbackSubmitted(true)} className="w-full bg-teal-500 text-white py-3 rounded-xl font-bold text-sm transition hover:bg-teal-600">Submit Review</button>
                    <i className="fas fa-heart absolute -right-4 -bottom-4 text-7xl text-slate-800 opacity-30"></i>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center md:hidden z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <button onClick={() => navigateTo('home')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'home' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <i className={`fas fa-home ${currentPage === 'home' ? 'text-lg' : 'text-md'}`}></i>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => navigateTo('booking')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'booking' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <i className={`fas fa-plus-square ${currentPage === 'booking' ? 'text-lg' : 'text-md'}`}></i>
          <span className="text-[10px] font-bold">Book</span>
        </button>
        <div className="relative -top-6">
           <button onClick={() => navigateTo('booking')} className="w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-200 border-4 border-white active:scale-90 transition">
              <i className="fas fa-vial text-xl"></i>
           </button>
        </div>
        <button onClick={() => navigateTo('reports')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'reports' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <i className={`fas fa-file-medical ${currentPage === 'reports' ? 'text-lg' : 'text-md'}`}></i>
          <span className="text-[10px] font-bold">Reports</span>
        </button>
        <button onClick={() => navigateTo('tracking')} className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'tracking' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <i className={`fas fa-truck-fast ${currentPage === 'tracking' ? 'text-lg' : 'text-md'}`}></i>
          <span className="text-[10px] font-bold">Track</span>
        </button>
      </div>

      <footer className="hidden md:block bg-slate-50 border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-6 text-teal-800 opacity-50">
            <i className="fas fa-microscope text-2xl mr-3"></i>
            <span className="text-xl font-bold uppercase tracking-widest">Sri Venkateswara Diagnostic</span>
          </div>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest">© 2024 Sri Venkateswara Diagnostic. Official Play Store Partner.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
