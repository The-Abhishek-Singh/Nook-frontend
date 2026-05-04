"use client";
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface MapComponentProps {
    location: { lat: number; lng: number };
}

// Dynamically import Leaflet only on client side
let L: any = null;
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;

export default function MapComponent({ location }: MapComponentProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Import Leaflet dynamically
        const loadLeaflet = async () => {
            try {
                const leaflet = await import('leaflet');
                L = leaflet.default;

                // Fix for default marker icons
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });

                // Import React Leaflet components
                const reactLeaflet = await import('react-leaflet');
                MapContainer = reactLeaflet.MapContainer;
                TileLayer = reactLeaflet.TileLayer;
                Marker = reactLeaflet.Marker;
                Popup = reactLeaflet.Popup;

                setMapReady(true);
            } catch (error) {
                console.error("Failed to load Leaflet:", error);
            }
        };

        loadLeaflet();
    }, []);

    if (!isMounted || !mapReady) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
        );
    }

    return (
        <MapContainer
            center={[location.lat, location.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '2rem' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[location.lat, location.lng]}>
                <Popup>
                    <div className="text-center">
                        <p className="font-bold">Location</p>
                        <p className="text-sm">Lat: {location.lat.toFixed(6)}</p>
                        <p className="text-sm">Lng: {location.lng.toFixed(6)}</p>
                        <a
                            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-xs hover:underline"
                        >
                            Open in Google Maps
                        </a>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}