import { useState } from "react";
import { campusesApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import StatusMessage from "./StatusMessage";
import AddressSearchInput from "./AddressSearchInput";

export default function AdminCampusRow({ campus, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(campus.name);
  const [address, setAddress] = useState(campus.address);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await campusesApi.update(campus.id, { name, address });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not update campus."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${campus.name}"? This also deletes all its venues and their accessibility data.`)) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await campusesApi.remove(campus.id);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not delete campus."));
      setSubmitting(false);
    }
  }

  if (editing) {
    return (
      <li className="admin-row admin-row-editing">
        <form className="admin-inline-form" onSubmit={handleSave}>
          <label htmlFor={`campus-name-${campus.id}`}>Campus name</label>
          <input
            id={`campus-name-${campus.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor={`campus-address-${campus.id}`}>Address (optional)</label>
          <AddressSearchInput
            id={`campus-address-${campus.id}`}
            value={address}
            onChange={setAddress}
            placeholder="e.g. University Dr, Irvine, CA 92697"
          />

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary btn-small" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => {
                setEditing(false);
                setName(campus.name);
                setAddress(campus.address);
              }}
            >
              Cancel
            </button>
          </div>
          <StatusMessage tone="error">{error}</StatusMessage>
        </form>
      </li>
    );
  }

  return (
    <li className="admin-row">
      <div>
        <span>{campus.name}</span>
        {campus.address && <div className="admin-row-meta">{campus.address}</div>}
      </div>
      <div className="admin-row-actions">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          disabled={submitting}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
      <StatusMessage tone="error">{error}</StatusMessage>
    </li>
  );
}
