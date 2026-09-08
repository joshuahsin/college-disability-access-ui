import { SUBMISSION_STATUS } from "../constants";

export default function StatusBadge({ submission }) {
  if (!submission) {
    return <span className="badge badge-unknown">No tracking data yet</span>;
  }

  const meta = SUBMISSION_STATUS[submission.status] ?? {
    label: submission.status,
    tone: "unknown",
  };

  return <span className={`badge badge-${meta.tone}`}>{meta.label}</span>;
}
