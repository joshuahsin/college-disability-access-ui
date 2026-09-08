export default function CommentList({ comments, currentUsername, onDelete }) {
  if (comments.length === 0) {
    return <p className="comment-empty">No comments yet.</p>;
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li key={comment.id} className="comment-item">
          <div className="comment-meta">
            <span className="comment-author">{comment.user.username}</span>
            <time dateTime={comment.created_at}>
              {new Date(comment.created_at).toLocaleString()}
            </time>
          </div>
          <p className="comment-body">{comment.body}</p>
          {comment.user.username === currentUsername && (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => onDelete(comment.id)}
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
