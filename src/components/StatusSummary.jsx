import { SUBMISSION_STATUS } from "../constants";

// Resolved statuses read as more useful information than "pending", so
// lead with those.
const ORDER = ["confirmed_accessible", "confirmed_inaccessible", "disputed", "pending"];

export default function StatusSummary({ summary }) {
  if (!summary) return null;

  const entries = ORDER.map((key) => ({ key, count: summary[key] ?? 0, meta: SUBMISSION_STATUS[key] })).filter(
    (entry) => entry.count > 0
  );

  if (entries.length === 0) return null;

  return (
    <ul className="status-summary">
      {entries.map(({ key, count, meta }) => (
        <li key={key} className={`status-summary-item tone-${meta.tone}`}>
          <span className="status-summary-dot" aria-hidden="true" />
          {count} {meta.label}
        </li>
      ))}
    </ul>
  );
}
