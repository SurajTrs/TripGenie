// components/Globe.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-[500px] h-[500px] relative rounded-full shadow-[0_0_100px_rgba(59,130,246,0.5)] flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
      <div className="text-white text-lg font-semibold">Loading Globe...</div>
    </div>
  )
});

const locations = [
  { lat: 28.6139, lng: 77.2090, city: 'Delhi' },
  { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
  { lat: 40.7128, lng: -74.0060, city: 'New York' },
  { lat: 51.5074, lng: -0.1278, city: 'London' },
  { lat: 35.6762, lng: 139.6503, city: 'Tokyo' },
];

const GlobeComponent = () => {
  const globeRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!globeRef.current || !isClient) return;

    const globe = globeRef.current;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    globe.pointOfView({ altitude: 2 }, 0);
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="w-[500px] h-[500px] relative rounded-full shadow-[0_0_100px_rgba(59,130,246,0.5)] flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="text-white text-lg font-semibold">Loading Globe...</div>
      </div>
    );
  }

  return (
    <div className="w-[500px] h-[500px] relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full shadow-[0_0_100px_rgba(59,130,246,0.5)] animate-pulse pointer-events-none z-10"></div>
      
      {/* Location Label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full pointer-events-none">
        <p className="text-white font-semibold text-sm">{locations[currentIndex].city}</p>
      </div>
      
      {/* Globe with Circular Mask */}
      <div className="w-[500px] h-[500px] rounded-full overflow-hidden relative" style={{ zIndex: 0 }}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          width={500}
          height={500}
          atmosphereColor="rgba(59,130,246,0.3)"
          atmosphereAltitude={0.25}
          pointsData={locations}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => 'rgba(239, 68, 68, 0.8)'}
          pointAltitude={0.01}
          pointRadius={0.5}
        />
      </div>
      
      {/* Orbiting Plane Icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none" style={{ animation: 'spin 20s linear infinite', zIndex: 20 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default GlobeComponent;
