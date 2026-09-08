import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { featuresApi, submissionsApi, venuesApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import { categoryLabel } from "../constants";
import FeatureRow from "../components/FeatureRow";
import StatusMessage from "../components/StatusMessage";

function byFeature(submissions) {
  // Exactly one Submission topic per (venue, feature) pair now -- no need
  // to pick a "latest" among several.
  return new Map(submissions.map((submission) => [submission.feature, submission]));
}

export default function VenueDetailPage() {
  const { venueId } = useParams();
  const [venue, setVenue] = useState(null);
  const [features, setFeatures] = useState([]);
  const [submissionsByFeature, setSubmissionsByFeature] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(() => {
    return submissionsApi
      .listByVenue(venueId)
      .then((data) => setSubmissionsByFeature(byFeature(data)));
  }, [venueId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([venuesApi.get(venueId), featuresApi.list(), loadSubmissions()])
      .then(([venueData, featureData]) => {
        if (cancelled) return;
        setVenue(venueData);
        setFeatures(featureData);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, "Could not load this venue."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [venueId, loadSubmissions]);

  if (loading) return <p>Loading venue…</p>;

  return (
    <div className="venue-detail-page">
      <Link to="/venues" className="back-link">
        ← All venues
      </Link>

      <StatusMessage tone="error">{error}</StatusMessage>

      {venue && (
        <>
          <header className="venue-header">
            <h1>{venue.name}</h1>
            <p>
              <span className="badge badge-category">{categoryLabel(venue.category)}</span>
              {venue.address && <span className="venue-address"> · {venue.address}</span>}
            </p>
          </header>

          <h2>Accessibility features</h2>
          {features.length === 0 ? (
            <p>No accessibility features have been defined yet.</p>
          ) : (
            <ul className="feature-list">
              {features.map((feature) => (
                <FeatureRow
                  key={feature.id}
                  feature={feature}
                  submission={submissionsByFeature.get(feature.id) ?? null}
                  onSubmissionChanged={loadSubmissions}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
