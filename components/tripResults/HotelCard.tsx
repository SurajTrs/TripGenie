import React from 'react';
import { HotelData } from '../../types';

interface HotelCardProps {
  hotel: HotelData;
  onSelect: (hotel: HotelData) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://placehold.co/400x250/7c3aed/ffffff?text=Hotel`;
  };

  return (
    <div
      onClick={() => onSelect(hotel)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-300 mb-3"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(hotel)}
    >
      <div className="relative h-40">
        <img
          src={hotel.imageUrl || `https://placehold.co/400x250/7c3aed/ffffff?text=Hotel`}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow-sm">
          <span className="text-xs font-semibold text-gray-600">{hotel.category}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 text-base">{hotel.name}</h3>
          {hotel.rating && (
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
              {hotel.rating.toFixed(1)}
              <i className="ri-star-fill text-xs"></i>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <i className="ri-map-pin-line text-sm"></i>
          {hotel.address}
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-gray-900">₹{hotel.price?.toLocaleString() || 'N/A'}</p>
            <p className="text-xs text-gray-500">per night</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Select
          </button>
        </div>
      </div>
    </div>
  );
};
