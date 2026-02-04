import React from 'react';
import { FlightData } from '../../types';
import { Plane, Clock, ArrowRight } from 'lucide-react';

interface FlightCardProps {
  flight: FlightData;
  onSelect: (flight: FlightData) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(flight)}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <Plane className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{flight.airline}</p>
              <p className="text-xs text-gray-500">{flight.flightNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{flight.departureTime}</p>
              <p className="text-xs text-gray-500">{flight.departureAirportIata}</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
              <div className="w-full h-px bg-gray-300 relative">
                <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 bg-white" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{flight.arrivalTime}</p>
              <p className="text-xs text-gray-500">{flight.arrivalAirportIata}</p>
            </div>
          </div>
        </div>
        
        <div className="ml-6 text-right">
          <p className="text-2xl font-bold text-gray-900">₹{flight.price.toLocaleString()}</p>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Select
          </button>
        </div>
      </div>
    </div>
  );
};
