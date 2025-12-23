
import React from 'react';
import { Booking } from '../types';

interface TrackingViewProps {
  booking: Booking;
}

const TrackingView: React.FC<TrackingViewProps> = ({ booking }) => {
  const steps = [
    { label: 'Booked', icon: 'fa-calendar-check' },
    { label: 'Sample Collected', icon: 'fa-vial' },
    { label: 'In Lab', icon: 'fa-microscope' },
    { label: 'Report Ready', icon: 'fa-file-medical' }
  ];

  const currentStepIndex = steps.findIndex(s => s.label === booking.status);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Booking ID: {booking.id}</h3>
          <p className="text-slate-500 text-sm">Status: <span className="text-teal-600 font-semibold">{booking.status}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Scheduled for</p>
          <p className="font-medium text-slate-700">{booking.date} | {booking.timeSlot}</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-1000"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        <div className="relative z-10 flex justify-between">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex flex-col items-center group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                idx <= currentStepIndex ? 'bg-teal-500 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}>
                <i className={`fas ${step.icon}`}></i>
              </div>
              <span className={`mt-2 text-xs font-bold text-center w-20 ${
                idx <= currentStepIndex ? 'text-teal-700' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {booking.status === 'Report Ready' && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
          <button className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition flex items-center gap-2">
            <i className="fas fa-file-pdf"></i>
            Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackingView;
