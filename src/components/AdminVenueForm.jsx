import { useState } from "react";
import { venuesApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import { VENUE_CATEGORIES } from "../constants";
import StatusMessage from "./StatusMessage";
import LocationPicker from "./LocationPicker";
import { geocodeAddress } from "../api/geocode";

// "" (an empty field) must read as "no location yet", not as 0 -- Number("")
// is 0, not NaN, so it needs its own check before falling through to Number().
function toFiniteNumber(value) {
  if (value === "" || value === null || value === undefined) return NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

const blankVenue = {
  campus: "",
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  category: VENUE_CATEGORIES[0].value,
};

export default function AdminVenueForm({ campuses, venue = null, onSaved, onCancel }) {
  const [values, setValues] = useState(
    venue
      ? {
          campus: venue.campus,
          name: venue.name,
          address: venue.address,
          latitude: venue.latitude,
          longitude: venue.longitude,
          category: venue.category,
        }
      : blankVenue
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handlePick(lat, lng) {
    setValues((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }

  async function handleCampusChange(campusId) {
    update("campus", campusId);
    // Jump the map to the campus's address as a starting point -- just a
    // default, not authoritative, so a lookup failure here is silent; the
    // admin can still search or click-to-pick the exact spot themselves.
    const campus = campuses.find((c) => c.id === campusId);
    if (!campus?.address) return;
    try {
      const result = await geocodeAddress(campus.address);
      if (result) handlePick(result.lat, result.lon);
    } catch {
      // Ignore -- see comment above.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      ...values,
      latitude: parseFloat(values.latitude),
      longitude: parseFloat(values.longitude),
    };
    try {
      if (venue) {
        await venuesApi.update(venue.id, payload);
      } else {
        await venuesApi.create(payload);
        setValues(blankVenue);
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not save venue."));
    } finally {
      setSubmitting(false);
    }
  }

  const idPrefix = venue ? `venue-${venue.id}` : "venue-new";

  return (
    <form className="admin-venue-form" onSubmit={handleSubmit}>
      <div className="location-picker-field">
        <span className="location-picker-label">
          Location (search an address, or click the map/drag the pin, to set it)
        </span>
        <LocationPicker
          latitude={toFiniteNumber(values.latitude)}
          longitude={toFiniteNumber(values.longitude)}
          onPick={handlePick}
          initialQuery={values.address}
        />
      </div>

      <div className="admin-form-grid">
        <label htmlFor={`${idPrefix}-campus`}>
          Campus
          <select
            id={`${idPrefix}-campus`}
            value={values.campus}
            onChange={(e) => handleCampusChange(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a campus
            </option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor={`${idPrefix}-name`}>
          Name
          <input
            id={`${idPrefix}-name`}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </label>

        <label htmlFor={`${idPrefix}-address`}>
          Address
          <input
            id={`${idPrefix}-address`}
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </label>

        <label htmlFor={`${idPrefix}-category`}>
          Category
          <select
            id={`${idPrefix}-category`}
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            required
          >
            {VENUE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor={`${idPrefix}-lat`}>
          Latitude
          <input
            id={`${idPrefix}-lat`}
            type="number"
            step="any"
            min="-90"
            max="90"
            value={values.latitude}
            onChange={(e) => update("latitude", e.target.value)}
            required
          />
        </label>

        <label htmlFor={`${idPrefix}-lng`}>
          Longitude
          <input
            id={`${idPrefix}-lng`}
            type="number"
            step="any"
            min="-180"
            max="180"
            value={values.longitude}
            onChange={(e) => update("longitude", e.target.value)}
            required
          />
        </label>
      </div>

      <StatusMessage tone="error">{error}</StatusMessage>

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary btn-small" disabled={submitting}>
          {submitting ? "Saving…" : venue ? "Save changes" : "Add venue"}
        </button>
        {venue && (
          <button type="button" className="btn btn-ghost btn-small" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
