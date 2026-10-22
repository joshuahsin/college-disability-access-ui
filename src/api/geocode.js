// Nominatim (OpenStreetMap's own geocoder): free, keyless, same provider as
// the map tiles already in use. Meant for light, explicit (button-press)
// lookups only -- see their usage policy for rate limits.
export async function geocodeAddress(query) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(trimmed)}`
  );
  if (!response.ok) throw new Error("Geocoding request failed.");

  const results = await response.json();
  if (results.length === 0) return null;

  return {
    lat: parseFloat(results[0].lat),
    lon: parseFloat(results[0].lon),
    displayName: results[0].display_name,
  };
}
