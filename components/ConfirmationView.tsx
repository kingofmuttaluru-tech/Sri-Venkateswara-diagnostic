
import React, { useState } from 'react';
import { Booking, DiagnosticTest } from '../types';
import { TESTS } from '../constants';

interface ConfirmationViewProps {
  booking: Booking;
  onTrack: () => void;
  onHome: () => void;
}

const ConfirmationView: React.FC<ConfirmationViewProps> = ({ booking, onTrack, onHome }) => {
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const bookedTests = TESTS.filter(t => booking.testIds.includes(t.id));

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="bg-teal-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
            <i className="fas fa-check text-4xl"></i>
          </div>
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-teal-100">Thank you for choosing Sri Venkateswar Diagnostic Centre.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* WhatsApp Notification Opt-in */}
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
                <i className="fab fa-whatsapp text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-green-900">WhatsApp Notification</p>
                <p className="text-xs text-green-700">Receive reports & updates on WhatsApp</p>
              </div>
            </div>
            <button 
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${whatsappEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${whatsappEnabled ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
              <p className="text-xl font-bold text-slate-800">{booking.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-xl font-bold text-teal-600">₹{booking.totalAmount}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Patient Details Section */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <i className="fas fa-user text-teal-500"></i>
                Patient Details
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 text-lg">{booking.patientName}</p>
                <p className="text-slate-500">{booking.mobileNumber}</p>
              </div>
            </div>

            {/* Collection & Appointment Details Section */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <i className="fas fa-calendar-alt text-teal-500"></i>
                Sample Collection & Appointment
              </h4>
              <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-teal-600 uppercase mb-1">Date</p>
                    <p className="font-bold text-slate-800">{booking.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-600 uppercase mb-1">Time Slot</p>
                    <p className="font-bold text-slate-800">{booking.timeSlot}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-teal-100">
                  <p className="text-xs font-bold text-teal-600 uppercase mb-1">Collection Mode</p>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-teal-600 flex-shrink-0">
                      <i className={`fas ${booking.collectionType === 'Home' ? 'fa-home' : 'fa-building'}`}></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {booking.collectionType === 'Home' ? 'Home Collection Service' : 'Visit Diagnostic Centre'}
                      </p>
                      {booking.address ? (
                        <p className="text-sm text-slate-600 mt-1 italic">
                          <i className="fas fa-map-marker-alt mr-2"></i>
                          {booking.address}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 mt-1">Please visit our main branch at the scheduled time.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Tests Booked & Estimated Time</h4>
            <ul className="space-y-3">
              {bookedTests.map(test => (
                <li key={test.id} className="flex items-center justify-between text-slate-700 text-sm border-b border-slate-50 pb-2">
                  <div className="flex items-center">
                    <i className="fas fa-vial text-teal-500 mr-3"></i>
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase">
                      Report: {test.duration}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onTrack}
              className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-bold hover:bg-teal-700 transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fas fa-map-location-dot"></i>
              Track Status
            </button>
            <button 
              onClick={onHome}
              className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition active:scale-95"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-sm mt-8">
        A confirmation SMS and receipt has been sent to {booking.mobileNumber}
        {whatsappEnabled && " and WhatsApp."}
      </p>
    </div>
  );
};

export default ConfirmationView;
