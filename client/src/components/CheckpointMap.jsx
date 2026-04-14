import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon missing issue in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Icon xe tải dùng cho vị trí hiện tại
const currentIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2733/2733355.png", // Icon xe tải
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const defaultCenter = [16.0544, 108.2022]; // Đà Nẵng ở giữa VN

// Component để tự động zoom vào đường nét
// eslint-disable-next-line react/prop-types
const MapFitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView(defaultCenter, 5);
    }
  }, [positions, map]);
  return null;
};

// eslint-disable-next-line react/prop-types
const CheckpointMap = ({ trackingHistory = [] }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (trackingHistory && trackingHistory.length > 0) {
      const coords = trackingHistory.map(point => [point.lat, point.lng]);
      setPositions(coords);
    }
  }, [trackingHistory]);

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        scrollWheelZoom={false} 
        className="h-full w-full z-0"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {positions.length > 0 && (
           <Polyline 
              positions={positions} 
              pathOptions={{ color: '#2563eb', weight: 4, dashArray: '8, 8' }} 
           />
        )}

        {trackingHistory && trackingHistory.map((point, index) => {
          const isCurrent = index === trackingHistory.length - 1;
          const dt = new Date(point.timestamp).toLocaleString("vi-VN");
          return (
            <Marker 
              key={index} 
              position={[point.lat, point.lng]} 
              icon={isCurrent ? currentIcon : new L.Icon.Default()}
            >
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <h3 className="font-bold text-gray-800 text-sm">{point.locationName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{dt}</p>
                  {isCurrent && <p className="text-blue-600 font-bold text-xs mt-2 bg-blue-50 px-2 py-1 rounded inline-block">📍 Vị trí xe hiện tại</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapFitBounds positions={positions} />
      </MapContainer>
    </div>
  );
};

export default CheckpointMap;
