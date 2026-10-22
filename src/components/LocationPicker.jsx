import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import StatusMessage from "./StatusMessage";
import { geocodeAddress } from "../api/geocode";

// Leaflet's default marker icons are referenced by relative path, which
// breaks under a bundler -- point them at the copies Vite bundles instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// Roughly the center of the continental US -- just a reasonable starting
// view before any location has been picked or searched for.
const DEFAULT_CENTER = [39.5, -98.35];
const DEFAULT_ZOOM = 4;

/**
 * A click-to-pick location map: fully controlled by `latitude`/`longitude`.
 * Clicking the map, dragging the marker, or searching an address all call
 * `onPick(lat, lng)` -- placement itself only ever happens in response to
 * those props changing, so there's one source of truth instead of the map
 * and the caller's form state drifting out of sync.
 *
 * The search box exists because click-to-pick alone assumes you can already
 * find the right spot on a world map -- it geocodes via Nominatim (OSM's
 * free, keyless geocoder, matching the tile source already in use) just to
 * pan/zoom there; the pin placement it drops is still only a starting point
 * the admin can drag to the exact spot.
 */
export default function LocationPicker({ latitude, longitude, onPick, initialQuery = "" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const [query, setQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const map = L.map(containerRef.current);
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    map.on("click", (e) => onPickRef.current(e.latlng.lat, e.latlng.lng));

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      markerRef.current?.remove();
      markerRef.current = null;
      return undefined;
    }

    // A pin just landed successfully, by whatever means (click, drag, the
    // search box, or an external auto-jump like the campus picker) -- any
    // stale "no match found" from an earlier failed search no longer
    // applies.
    setSearchError("");

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const { lat, lng } = markerRef.current.getLatLng();
        onPickRef.current(lat, lng);
      });
    }

    // setView (not panTo + setZoom) -- those are two separately-animated
    // transitions, and setZoom-with-no-args zooms around whatever the
    // center is *at the moment it's called*. Firing right after panTo
    // starts an animation, that's the old center, not the new one, so the
    // camera would drift from the (correctly-placed) marker. setView moves
    // center and zoom together as one atomic jump.
    const targetZoom = map.getZoom() < 14 ? 16 : map.getZoom();
    map.setView([latitude, longitude], targetZoom);
    return undefined;
  }, [latitude, longitude]);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const result = await geocodeAddress(query);
      if (!result) {
        setSearchError("No matching location found.");
        return;
      }
      onPickRef.current(result.lat, result.lon);
    } catch {
      setSearchError("Could not search for that location right now.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="location-picker">
      {/*
        A plain div, not a <form> -- this is nested inside the venue form in
        AdminVenueForm, and HTML doesn't allow nested forms (the browser
        silently mangles the DOM if you try). Enter-to-search is wired up
        by hand instead, with preventDefault so it doesn't also submit the
        outer form.
      */}
      <div className="location-picker-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Search an address or place to jump there…"
          aria-label="Search for a location"
        />
        <button
          type="button"
          className="btn btn-ghost btn-small"
          disabled={searching}
          onClick={handleSearch}
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </div>
      <StatusMessage tone="error">{searchError}</StatusMessage>
      <div ref={containerRef} className="location-picker-canvas" />
    </div>
  );
}
