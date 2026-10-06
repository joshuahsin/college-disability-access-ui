import { useState } from "react";
import { commentsApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import StatusMessage from "./StatusMessage";

export default function CommentForm({ submissionId, parentId = null, onAdded, autoFocus = false }) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await commentsApi.create({ submission: submissionId, body, parent: parentId });
      setBody("");
      onAdded();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not post comment."));
    } finally {
      setSubmitting(false);
    }
  }

  const inputId = `comment-input-${parentId ?? "top"}-${submissionId}`;
  const labelId = `comment-label-${parentId ?? "top"}-${submissionId}`;
  const labelText = parentId ? "Write a reply" : "Add a comment";

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label id={labelId} htmlFor={inputId}>
        {labelText}
      </label>
      <textarea
        id={inputId}
        aria-labelledby={labelId}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={2}
        required
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
      />
      <StatusMessage tone="error">{error}</StatusMessage>
      <button type="submit" className="btn btn-secondary" disabled={submitting}>
        {submitting ? "Posting…" : parentId ? "Post reply" : "Post comment"}
      </button>
    </form>
  );
}
