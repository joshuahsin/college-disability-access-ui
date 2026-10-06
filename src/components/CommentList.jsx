import { useState } from "react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

function groupIntoThreads(comments) {
  const repliesByParentId = new Map();
  for (const comment of comments) {
    if (!comment.parent) continue;
    const replies = repliesByParentId.get(comment.parent) ?? [];
    replies.push(comment);
    repliesByParentId.set(comment.parent, replies);
  }

  return comments
    .filter((comment) => !comment.parent)
    .map((comment) => ({ comment, replies: repliesByParentId.get(comment.id) ?? [] }));
}

export default function CommentList({
  comments,
  currentUsername,
  submissionId,
  onDelete,
  onReplyAdded,
  myReactionByCommentId,
  onReactionChanged,
}) {
  const [replyingToId, setReplyingToId] = useState(null);

  if (comments.length === 0) {
    return <p className="comment-empty">No comments yet.</p>;
  }

  const threads = groupIntoThreads(comments);

  return (
    <ul className="comment-list">
      {threads.map(({ comment, replies }) => (
        <li key={comment.id} className="comment-thread">
          <CommentItem
            comment={comment}
            currentUsername={currentUsername}
            onDelete={onDelete}
            canReply
            isReplying={replyingToId === comment.id}
            onToggleReply={() =>
              setReplyingToId((current) => (current === comment.id ? null : comment.id))
            }
            myReaction={myReactionByCommentId[comment.id] ?? null}
            onReactionChanged={onReactionChanged}
          />

          {replies.length > 0 && (
            <ul className="comment-replies">
              {replies.map((reply) => (
                <li key={reply.id}>
                  <CommentItem
                    comment={reply}
                    currentUsername={currentUsername}
                    onDelete={onDelete}
                    myReaction={myReactionByCommentId[reply.id] ?? null}
                    onReactionChanged={onReactionChanged}
                  />
                </li>
              ))}
            </ul>
          )}

          {replyingToId === comment.id && (
            <div className="comment-reply-form">
              <CommentForm
                submissionId={submissionId}
                parentId={comment.id}
                autoFocus
                onAdded={() => {
                  setReplyingToId(null);
                  onReplyAdded();
                }}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
