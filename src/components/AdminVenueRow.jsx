import { useState } from "react";
import { venuesApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import { categoryLabel } from "../constants";
import AdminVenueForm from "./AdminVenueForm";
import StatusMessage from "./StatusMessage";

export default function AdminVenueRow({ venue, campuses, campusName, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (
      !window.confirm(`Delete "${venue.name}"? This also deletes all its accessibility data.`)
    ) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await venuesApi.remove(venue.id);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not delete venue."));
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <li className="admin-row admin-row-editing">
        <AdminVenueForm
          campuses={campuses}
          venue={venue}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="admin-row">
      <div>
        <strong>{venue.name}</strong>
        <div className="admin-row-meta">
          {campusName} · {categoryLabel(venue.category)}
          {venue.address && ` · ${venue.address}`}
        </div>
      </div>
      <div className="admin-row-actions">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          disabled={deleting}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
      <StatusMessage tone="error">{error}</StatusMessage>
    </li>
  );
}
