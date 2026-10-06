import { useEffect, useState } from "react";
import { campusesApi, venuesApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import { VENUE_CATEGORIES } from "../constants";
import VenueCard from "../components/VenueCard";
import StatusMessage from "../components/StatusMessage";
import CampusMap from "../components/CampusMap";

export default function VenuesPage() {
  const [campuses, setCampuses] = useState([]);
  const [venues, setVenues] = useState([]);
  const [campusId, setCampusId] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapDismissed, setMapDismissed] = useState(false);

  useEffect(() => {
    campusesApi.list().then(setCampuses).catch(() => {});
  }, []);

  useEffect(() => {
    setMapDismissed(false);
  }, [campusId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    venuesApi
      .list({ campus: campusId || undefined, category: category || undefined })
      .then((data) => {
        if (!cancelled) setVenues(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, "Could not load venues."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campusId, category]);

  return (
    <div className="venues-page">
      <h1>Venues</h1>
      <p className="page-intro">
        Browse campus venues and see what accessibility features have been reported.
      </p>

      <form className="filter-bar" role="search" aria-label="Filter venues">
        <div className="filter-field">
          <label htmlFor="campus-filter">Campus</label>
          <select id="campus-filter" value={campusId} onChange={(e) => setCampusId(e.target.value)}>
            <option value="">All campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {VENUE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {campusId && !mapDismissed && (
        <CampusMap
          campusName={campuses.find((c) => c.id === campusId)?.name ?? "Campus"}
          venues={venues}
          onClose={() => setMapDismissed(true)}
        />
      )}

      <StatusMessage tone="error">{error}</StatusMessage>

      {loading ? (
        <p>Loading venues…</p>
      ) : venues.length === 0 ? (
        <p>No venues match these filters.</p>
      ) : (
        <ul className="venue-list">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </ul>
      )}
    </div>
  );
}
