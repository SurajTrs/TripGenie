'use client';

import { Filter, ArrowRight, Hotel } from 'lucide-react';

interface FlightResultsProps {
  flights: any[];
  onSelect: (flight: any) => void;
}

export default function FlightResults({ flights, onSelect }: FlightResultsProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* Sort Tabs */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Best</button>
        <button className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium">Cheapest</button>
        <button className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium">Fastest</button>
      </div>

      {/* Flight Cards */}
      <div className="space-y-3">
        {flights.map((flight, i) => (
          <div key={flight.id} className={`bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition ${i === 0 ? 'border-2 border-blue-200' : 'border border-gray-100'}`}>
            {i === 0 && <div className="text-xs text-blue-600 font-semibold mb-2">✨ BEST DEAL</div>}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center font-bold text-blue-600 border-2 border-blue-100">
                  {flight.airline?.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
                      <div className="text-sm text-gray-600">{flight.departureAirportIata}</div>
                    </div>
                    <div className="flex-1 text-center px-4">
                      <div className="text-sm text-gray-600 mb-1">{flight.duration}</div>
                      <div className="relative">
                        <div className="border-t-2 border-gray-300"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
                      <div className="text-sm text-gray-600">{flight.arrivalAirportIata}</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Low emissions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">₹{flight.price.toLocaleString()}</div>
                <button
                  onClick={() => onSelect(flight)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 shadow-sm"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
