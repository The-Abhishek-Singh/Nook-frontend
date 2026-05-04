"use client";

import React, { useState, useEffect } from 'react';

interface LiveMapProps {
    lat?: number;
    lng?: number;
}

const LiveMap = ({ lat, lng }: LiveMapProps) => {
    const [coords, setCoords] = useState({ lat: lat || 28.6139, lng: lng || 77.2090 });

    useEffect(() => {
        if (!lat && !lng && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.error("Error fetching location:", error)
            );
        }
    }, [lat, lng]);

    // Constructing the URL with minimal parameters
    // disableDefaultUI isn't fully supported in free embeds, so we crop instead.
    const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed&iwloc=near`;

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#f0f0f0] group">
            {/* THE CROP TECHNIQUE:
                We make the iframe 150% height and width and move it to hide 
                the headers, zoom buttons, and the Google logo footer.
            */}
            <div className="absolute inset-0 scale-[1.3] pointer-events-none">
                <iframe
                    title="Live Location"
                    src={mapUrl}
                    className="w-full h-full border-0 grayscale-[0.4] contrast-[1.1] transition-all duration-700 group-hover:grayscale-0"
                    allowFullScreen
                    loading="lazy"
                />
            </div>

            {/* Inner Shadow for depth (Authentic Bento UI) */}
            <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] border border-black/5 rounded-[2.5rem]" />

            {/* Transparent Drag Overlay */}
            <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing" />

            {/* Optional: Minimalist dot to show center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
        </div>
    );
};

export default LiveMap;