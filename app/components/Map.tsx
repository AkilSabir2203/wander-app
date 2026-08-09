"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

if (typeof window !== "undefined") {
   // @ts-ignore
   delete L.Icon.Default.prototype._getIconUrl;
   L.Icon.Default.mergeOptions({
      iconUrl: markerIcon.src,
      iconRetinaUrl: markerIcon2x.src,
      shadowUrl: markerShadow.src,
   });
}

interface MapProps {
   center?: number[];
}

const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution =
   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const fallbackCenter: L.LatLngExpression = [20.5937, 78.9629];

const Map: React.FC<MapProps> = ({ center }) => {
   const hasValidCenter = Array.isArray(center) && center.length === 2 && Number.isFinite(center[0]) && Number.isFinite(center[1]);
   const mapCenter = hasValidCenter ? ([center[0], center[1]] as L.LatLngExpression) : fallbackCenter;

   return (
      <div className="h-[35vh] w-full rounded-lg overflow-hidden">
         <MapContainer
            center={mapCenter}
            zoom={hasValidCenter ? 8 : 5}
            scrollWheelZoom={false}
            className="h-full w-full"
         >
         <TileLayer url={url} attribution={attribution} />
            {hasValidCenter && <Marker position={mapCenter} />}
         </MapContainer>
      </div>
   );
};
export default Map;