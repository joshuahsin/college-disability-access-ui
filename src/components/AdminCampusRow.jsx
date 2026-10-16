import { useState } from "react";
import { campusesApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import StatusMessage from "./StatusMessage";

export default function AdminCampusRow({ campus, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(campus.name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await campusesApi.update(campus.id, { name });
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
      <li className="admin-row">
        <form className="admin-inline-form" onSubmit={handleSave}>
          <label htmlFor={`campus-name-${campus.id}`}>Campus name</label>
          <input
            id={`campus-name-${campus.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
      <span>{campus.name}</span>
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
