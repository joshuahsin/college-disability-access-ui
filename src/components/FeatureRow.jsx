import { useEffect, useState } from "react";
import { confirmationsApi, commentsApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "./StatusBadge";
import VoteButtons from "./VoteButtons";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import StatusMessage from "./StatusMessage";

export default function FeatureRow({ feature, submission, onSubmissionChanged }) {
  const { username } = useAuth();
  const [confirmations, setConfirmations] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [error, setError] = useState("");

  const panelId = `comments-panel-${feature.id}`;

  function loadConfirmations() {
    if (!submission) return Promise.resolve();
    return confirmationsApi
      .listBySubmission(submission.id)
      .then(setConfirmations)
      .catch((err) => setError(extractErrorMessage(err, "Could not load votes.")));
  }

  function loadComments() {
    if (!submission) return Promise.resolve();
    return commentsApi
      .listBySubmission(submission.id)
      .then(setComments)
      .catch((err) => setError(extractErrorMessage(err, "Could not load comments.")));
  }

  useEffect(() => {
    loadConfirmations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.id]);

  useEffect(() => {
    if (commentsExpanded) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsExpanded, submission?.id]);

  async function handleDeleteComment(commentId) {
    try {
      await commentsApi.remove(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(extractErrorMessage(err, "Could not delete comment."));
    }
  }

  function handleVoted() {
    // A vote changes the submission's live status (PENDING /
    // CONFIRMED_ACCESSIBLE / CONFIRMED_INACCESSIBLE / DISPUTED), which is
    // computed server-side -- refresh both the vote list (for "my vote"
    // highlighting) and the parent's submission data (for the new status
    // and counts) so the row reflects it immediately.
    loadConfirmations();
    onSubmissionChanged();
  }

  const myVote = confirmations.find((c) => c.user.username === username)?.vote ?? null;

  return (
    <li className="feature-row">
      <div className="feature-row-header">
        <div>
          <h3>{feature.name}</h3>
          {feature.description && <p className="feature-description">{feature.description}</p>}
        </div>
        <StatusBadge submission={submission} />
      </div>

      <StatusMessage tone="error">{error}</StatusMessage>

      {submission && (
        <div className="feature-row-body">
          <VoteButtons submission={submission} myVote={myVote} onVoted={handleVoted} />

          <button
            type="button"
            className="btn btn-ghost btn-small"
            aria-expanded={commentsExpanded}
            aria-controls={panelId}
            onClick={() => setCommentsExpanded((v) => !v)}
          >
            {commentsExpanded ? "Hide comments" : "View comments"}
          </button>

          {commentsExpanded && (
            <div id={panelId} className="feature-panel">
              <CommentList
                comments={comments}
                currentUsername={username}
                onDelete={handleDeleteComment}
              />
              <CommentForm submissionId={submission.id} onAdded={loadComments} />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
