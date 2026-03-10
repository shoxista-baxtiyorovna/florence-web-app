"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet icon fix for Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface DeliveryMapProps {
    branchLat: number;
    branchLng: number;
    branchName: string;
}

function FlyToBranch({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 13);
    }, [lat, lng, map]);
    return null;
}

export default function DeliveryMap({ branchLat, branchLng, branchName }: DeliveryMapProps) {
    if (typeof window === "undefined") return null;

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border shadow-inner">
            <MapContainer
                center={[branchLat, branchLng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={[branchLat, branchLng]} icon={customIcon}>
                    <Popup className="font-bold">
                        {branchName}
                    </Popup>
                </Marker>
                <FlyToBranch lat={branchLat} lng={branchLng} />
            </MapContainer>
        </div>
    );
}
