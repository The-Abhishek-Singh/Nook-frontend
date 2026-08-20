"use client";

import React, { useRef, useCallback, useEffect, useState } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/maplibre';

interface LiveMapProps {
    lat?: number;
    lng?: number;
    interactive?: boolean;
    onLocationChange?: (lat: number, lng: number) => void;
}

const MAP_STYLE = {
    version: 8 as const,
    sources: {
        'osm-tiles': {
            type: 'raster' as const,
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    layers: [
        {
            id: 'osm-tiles-layer',
            type: 'raster' as const,
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
        }
    ]
};

const LiveMap = ({ lat, lng, interactive = false, onLocationChange }: LiveMapProps) => {
    const mapRef = useRef<MapRef | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const hasValidCoords = typeof lat === 'number' && typeof lng === 'number';

    const initialLat = hasValidCoords ? lat! : 28.6139;
    const initialLng = hasValidCoords ? lng! : 77.2090;

    useEffect(() => {
        if (!hasValidCoords && interactive && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLat = position.coords.latitude;
                    const newLng = position.coords.longitude;
                    mapRef.current?.flyTo({ center: [newLng, newLat], duration: 800 });
                    onLocationChange?.(newLat, newLng);
                },
                (error) => console.error("Error fetching location:", error)
            );
        }
    }, [hasValidCoords, interactive]);

    useEffect(() => {
        if (hasValidCoords && mapRef.current) {
            mapRef.current.flyTo({ center: [lng!, lat!], duration: 800 });
        }
    }, [lat, lng]);

    const handleMapClick = useCallback((e: any) => {
        if (!interactive) return;
        const { lat: newLat, lng: newLng } = e.lngLat;
        onLocationChange?.(newLat, newLng);
    }, [interactive, onLocationChange]);

    const handleMarkerDragEnd = useCallback((e: any) => {
        const { lat: newLat, lng: newLng } = e.lngLat;
        onLocationChange?.(newLat, newLng);
    }, [onLocationChange]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#f0f0f0] rounded-[2.5rem]" style={{ isolation: 'isolate' }}>
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: initialLng,
                    latitude: initialLat,
                    zoom: 14
                }}
                mapStyle={MAP_STYLE}
                style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
                dragPan={interactive}
                scrollZoom={interactive}
                doubleClickZoom={interactive}
                touchZoomRotate={interactive}
                boxZoom={interactive}
                dragRotate={false}
                keyboard={interactive}
                attributionControl={{ compact: true }}
                onClick={handleMapClick}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                cursor={interactive ? (isDragging ? 'grabbing' : 'grab') : 'default'}
            >
                <Marker
                    longitude={hasValidCoords ? lng! : initialLng}
                    latitude={hasValidCoords ? lat! : initialLat}
                    draggable={interactive}
                    onDragEnd={handleMarkerDragEnd}
                    color="#3B82F6"
                />
            </Map>
            <div className="absolute inset-0 z-[999] pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] border border-black/5 rounded-[2.5rem]" />
        </div>
    );
};

export default LiveMap;