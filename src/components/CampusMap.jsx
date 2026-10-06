import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { categoryLabel } from "../constants";

// Leaflet's default marker icons are referenced by relative path, which
// breaks under a bundler -- point them at the copies Vite bundles instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

function buildPopupContent(venue) {
  const container = document.createElement("div");
  container.className = "map-popup";

  const title = document.createElement("strong");
  title.textContent = venue.name;

  const meta = document.createElement("span");
  meta.className = "map-popup-category";
  meta.textContent = categoryLabel(venue.category);

  // Opens in a new tab rather than routing in-place: navigating away here
  // would lose the map/campus selection state, which is worth keeping.
  const link = document.createElement("a");
  link.href = `/venues/${venue.id}`;
  link.textContent = "View details";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  container.append(title, meta, link);
  return container;
}

export default function CampusMap({ campusName, venues, onClose }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const map = L.map(containerRef.current, { scrollWheelZoom: false });
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    map.setView([0, 0], 2);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const located = venues.filter(
      (v) => Number.isFinite(v.latitude) && Number.isFinite(v.longitude)
    );
    const markers = located.map((venue) => {
      const marker = L.marker([venue.latitude, venue.longitude]).addTo(map);
      marker.bindPopup(buildPopupContent(venue));
      return marker;
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 16 });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [venues]);

  return (
    <div className="campus-map-popup" role="dialog" aria-label={`Map of ${campusName}`}>
      <div className="campus-map-popup-header">
        <h2>{campusName}</h2>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={onClose}
          aria-label="Close map"
        >
          Close
        </button>
      </div>
      <div className="campus-map-canvas-wrap">
        <div ref={containerRef} className="campus-map-canvas" />
        {venues.length === 0 && (
          <p className="campus-map-empty">No venues to show on the map yet.</p>
        )}
      </div>
    </div>
  );
}
