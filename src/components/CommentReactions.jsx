import { useState } from "react";
import { commentReactionsApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import { REACTION } from "../constants";
import StatusMessage from "./StatusMessage";

export default function CommentReactions({ comment, myReaction, onChanged }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick(vote) {
    setPending(true);
    setError("");
    try {
      if (myReaction?.vote === vote) {
        // Clicking the reaction you already have undoes it -- there's no
        // "neutral" vote to switch to, so this is a delete, not an upsert.
        await commentReactionsApi.remove(myReaction.id);
      } else {
        await commentReactionsApi.react(comment.id, vote);
      }
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not record your reaction."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="comment-reactions">
      <button
        type="button"
        className={`btn btn-vote btn-small ${myReaction?.vote === REACTION.LIKE ? "btn-vote-active" : ""}`}
        disabled={pending}
        aria-pressed={myReaction?.vote === REACTION.LIKE}
        onClick={() => handleClick(REACTION.LIKE)}
      >
        Like ({comment.like_count})
      </button>
      <button
        type="button"
        className={`btn btn-vote btn-small ${myReaction?.vote === REACTION.DISLIKE ? "btn-vote-active" : ""}`}
        disabled={pending}
        aria-pressed={myReaction?.vote === REACTION.DISLIKE}
        onClick={() => handleClick(REACTION.DISLIKE)}
      >
        Dislike ({comment.dislike_count})
      </button>
      <StatusMessage tone="error">{error}</StatusMessage>
    </div>
  );
}
