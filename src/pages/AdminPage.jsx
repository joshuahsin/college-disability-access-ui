import { useEffect, useState } from "react";
import { campusesApi, venuesApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import StatusMessage from "../components/StatusMessage";
import AdminCampusRow from "../components/AdminCampusRow";
import AdminVenueRow from "../components/AdminVenueRow";
import AdminVenueForm from "../components/AdminVenueForm";

export default function AdminPage() {
  const [campuses, setCampuses] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCampusName, setNewCampusName] = useState("");
  const [creatingCampus, setCreatingCampus] = useState(false);
  const [campusError, setCampusError] = useState("");

  function loadAll() {
    setLoading(true);
    setError("");
    return Promise.all([campusesApi.list(), venuesApi.list()])
      .then(([campusData, venueData]) => {
        setCampuses(campusData);
        setVenues(venueData);
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load admin data.")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateCampus(event) {
    event.preventDefault();
    setCreatingCampus(true);
    setCampusError("");
    try {
      await campusesApi.create({ name: newCampusName });
      setNewCampusName("");
      await loadAll();
    } catch (err) {
      setCampusError(extractErrorMessage(err, "Could not create campus."));
    } finally {
      setCreatingCampus(false);
    }
  }

  const campusNameById = new Map(campuses.map((c) => [c.id, c.name]));

  if (loading) return <p>Loading admin data…</p>;

  return (
    <div className="admin-page">
      <h1>Admin</h1>
      <p className="page-intro">Manage campuses and venues.</p>

      <StatusMessage tone="error">{error}</StatusMessage>

      <section className="admin-section">
        <h2>Campuses</h2>
        {campuses.length === 0 ? (
          <p>No campuses yet.</p>
        ) : (
          <ul className="admin-list">
            {campuses.map((campus) => (
              <AdminCampusRow key={campus.id} campus={campus} onChanged={loadAll} />
            ))}
          </ul>
        )}

        <form className="admin-inline-form" onSubmit={handleCreateCampus}>
          <label htmlFor="new-campus-name">New campus name</label>
          <input
            id="new-campus-name"
            value={newCampusName}
            onChange={(e) => setNewCampusName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-small" disabled={creatingCampus}>
            {creatingCampus ? "Adding…" : "Add campus"}
          </button>
        </form>
        <StatusMessage tone="error">{campusError}</StatusMessage>
      </section>

      <section className="admin-section">
        <h2>Venues</h2>
        {venues.length === 0 ? (
          <p>No venues yet.</p>
        ) : (
          <ul className="admin-list">
            {venues.map((venue) => (
              <AdminVenueRow
                key={venue.id}
                venue={venue}
                campuses={campuses}
                campusName={campusNameById.get(venue.campus) ?? "Unknown campus"}
                onChanged={loadAll}
              />
            ))}
          </ul>
        )}

        <h3>Add a venue</h3>
        {campuses.length === 0 ? (
          <p className="field-hint">Add a campus first.</p>
        ) : (
          <AdminVenueForm campuses={campuses} onSaved={loadAll} />
        )}
      </section>
    </div>
  );
}
