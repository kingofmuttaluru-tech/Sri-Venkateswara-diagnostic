
import React, { useState } from 'react';
import { DiagnosticTest } from '../types';
import { TESTS } from '../constants';

interface TestCatalogProps {
  onAddToCart: (test: DiagnosticTest) => void;
  cart: DiagnosticTest[];
  isFirstBooking?: boolean;
}

const TestCatalog: React.FC<TestCatalogProps> = ({ onAddToCart, cart, isFirstBooking = false }) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const categories = ['All', 'Blood', 'Imaging', 'Cardiac', 'General'];
  
  const filteredTests = TESTS.filter(test => {
    const matchesCategory = filter === 'All' || test.category === filter;
    const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isInCart = (id: string) => cart.some(item => item.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search for tests..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex overflow-x-auto w-full md:w-auto pb-2 space-x-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === cat ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map(test => {
          const discountedPrice = Math.round(test.price * 0.6);
          return (
            <div key={test.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
              {isFirstBooking && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                  40% OFF
                </div>
              )}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mr-10">{test.name}</h3>
                  <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-medium">{test.category}</span>
                </div>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                <div className="flex flex-col space-y-2 text-xs text-slate-500 mb-4">
                  <div className="flex items-center font-medium text-teal-700">
                    <i className="far fa-clock mr-2"></i>
                    <span>Reports within: {test.duration}</span>
                  </div>
                  {test.preparation && (
                    <div className="flex items-start">
                      <i className="fas fa-info-circle mr-2 mt-0.5"></i>
                      <span>{test.preparation}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  {isFirstBooking ? (
                    <>
                      <span className="text-slate-400 line-through text-xs font-semibold">₹{test.price}</span>
                      <span className="text-xl font-bold text-teal-700">₹{discountedPrice}</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-teal-700">₹{test.price}</span>
                  )}
                </div>
                <button 
                  onClick={() => onAddToCart(test)}
                  disabled={isInCart(test.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    isInCart(test.id) 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95'
                  }`}
                >
                  {isInCart(test.id) ? 'Added' : 'Book Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestCatalog;
