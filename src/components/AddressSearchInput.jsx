import { useState } from "react";
import { geocodeAddress } from "../api/geocode";
import StatusMessage from "./StatusMessage";

/**
 * A plain address text field plus a "Verify" button: looks the typed text
 * up via Nominatim just to confirm a real place matches, showing its
 * canonical formatted name in the status line. Deliberately does NOT
 * overwrite the field with that canonical string -- Nominatim's own
 * `display_name` output isn't guaranteed to be valid input back into its
 * own search (long, heavily-punctuated formatted addresses can fail to
 * re-geocode), and this address gets re-geocoded later whenever a venue's
 * campus-select jumps the map to it (see AdminVenueForm.handleCampusChange).
 * Keeping whatever the admin actually typed is more likely to stay
 * re-searchable than the "prettier" canonical form would be.
 */
export default function AddressSearchInput({ id, value, onChange, placeholder }) {
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleVerify() {
    if (!value.trim()) return;
    setSearching(true);
    setStatus(null);
    try {
      const result = await geocodeAddress(value);
      if (!result) {
        setStatus({ tone: "error", text: "No matching address found." });
        return;
      }
      setStatus({ tone: "info", text: `Address verified: ${result.displayName}` });
    } catch {
      setStatus({ tone: "error", text: "Could not verify that address right now." });
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="address-search-field">
      <div className="address-search-row">
        <input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setStatus(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleVerify();
            }
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="btn btn-ghost btn-small"
          disabled={searching}
          onClick={handleVerify}
        >
          {searching ? "Checking…" : "Verify"}
        </button>
      </div>
      {status && <StatusMessage tone={status.tone}>{status.text}</StatusMessage>}
    </div>
  );
}
