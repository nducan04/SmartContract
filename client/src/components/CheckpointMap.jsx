import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon missing issue in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Icon xe tải dùng cho vị trí hiện tại
const currentIcon = L.divIcon({
  className: "truck-marker-icon",
  html: `<div style="background-color: white; border: 2px solid #2563eb; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 20px;">🚚</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
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

// Component để bắt sự kiện click Map
// eslint-disable-next-line react/prop-types
const MapEventHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick(e.latlng);
    },
  });
  return null;
};

// Component tự động fly tới marker mới
// eslint-disable-next-line react/prop-types
const MapPanTo = ({ latlng }) => {
  const map = useMap();
  useEffect(() => {
    if (latlng) {
      map.flyTo([latlng.lat, latlng.lng], 13);
    }
  }, [latlng, map]);
  return null;
};

// eslint-disable-next-line react/prop-types
const CheckpointMap = ({ trackingHistory = [], onMapClick, manualMarker }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (trackingHistory && trackingHistory.length > 0) {
      const coords = trackingHistory.map((point) => [point.lat, point.lng]);
      setPositions(coords);
    }
  }, [trackingHistory]);

  return (
    <div className="h-[500px] lg:h-[700px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={false}
        className={`h-full w-full z-0 ${onMapClick ? "cursor-crosshair" : ""}`}
        style={{ zIndex: 0 }}
      >
        <MapEventHandler onMapClick={onMapClick} />
        <MapPanTo latlng={manualMarker} />
        <TileLayer
          attribution="Dữ liệu bản đồ &copy; Google"
          url="https://mt1.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}"
          maxZoom={20}
        />

        {positions.length > 0 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: "#2563eb", weight: 4, dashArray: "8, 8" }}
          />
        )}

        {manualMarker && (
          <Marker
            position={[manualMarker.lat, manualMarker.lng]}
            icon={new L.Icon.Default()}
          >
            <Popup>
              <div className="font-bold text-blue-600 text-sm mb-1">
                📍 Tọa độ đang chọn
              </div>
              <div className="text-xs text-gray-500">
                Lat: {manualMarker.lat.toFixed(4)}
              </div>
              <div className="text-xs text-gray-500">
                Lng: {manualMarker.lng.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {trackingHistory &&
          trackingHistory.map((point, index) => {
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
                    <h3 className="font-bold text-gray-800 text-sm">
                      {point.locationName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{dt}</p>
                    {isCurrent && (
                      <p className="text-blue-600 font-bold text-xs mt-2 bg-blue-50 px-2 py-1 rounded inline-block">
                        📍 Vị trí xe hiện tại
                      </p>
                    )}
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
