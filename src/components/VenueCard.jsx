import { Link } from "react-router-dom";
import { categoryLabel } from "../constants";

export default function VenueCard({ venue }) {
  return (
    <li className="venue-card">
      <Link to={`/venues/${venue.id}`} className="venue-card-link">
        <h3>{venue.name}</h3>
        <p className="venue-card-meta">
          <span className="badge badge-category">{categoryLabel(venue.category)}</span>
          {venue.address && <span className="venue-address">{venue.address}</span>}
        </p>
      </Link>
    </li>
  );
}
