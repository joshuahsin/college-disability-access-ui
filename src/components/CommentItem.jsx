import CommentReactions from "./CommentReactions";

export default function CommentItem({
  comment,
  currentUsername,
  onDelete,
  canReply = false,
  isReplying = false,
  onToggleReply,
  myReaction = null,
  onReactionChanged,
}) {
  const isOwn = comment.user.username === currentUsername;

  return (
    <div className="comment-item">
      <div className="comment-meta">
        <span className="comment-author">{comment.user.username}</span>
        <time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleString()}</time>
      </div>
      <p className="comment-body">{comment.body}</p>
      <CommentReactions comment={comment} myReaction={myReaction} onChanged={onReactionChanged} />
      {(canReply || isOwn) && (
        <div className="comment-actions">
          {canReply && (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              aria-expanded={isReplying}
              onClick={onToggleReply}
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
          )}
          {isOwn && (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => onDelete(comment.id)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
