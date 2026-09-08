import { useState } from "react";
import { commentsApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import StatusMessage from "./StatusMessage";

export default function CommentForm({ submissionId, onAdded }) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await commentsApi.create({ submission: submissionId, body });
      setBody("");
      onAdded();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not post comment."));
    } finally {
      setSubmitting(false);
    }
  }

  const labelId = `comment-label-${submissionId}`;

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label id={labelId} htmlFor={`comment-input-${submissionId}`}>
        Add a comment
      </label>
      <textarea
        id={`comment-input-${submissionId}`}
        aria-labelledby={labelId}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={2}
        required
      />
      <StatusMessage tone="error">{error}</StatusMessage>
      <button type="submit" className="btn btn-secondary" disabled={submitting}>
        {submitting ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
