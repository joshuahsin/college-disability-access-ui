export const VENUE_CATEGORIES = [
  { value: "dining", label: "Dining" },
  { value: "academic", label: "Academic" },
  { value: "dorm", label: "Dorm" },
  { value: "library", label: "Library" },
  { value: "rec", label: "Recreation" },
];

export const categoryLabel = (value) =>
  VENUE_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export const SUBMISSION_STATUS = {
  pending: { label: "Pending", tone: "unknown" },
  confirmed_accessible: { label: "Confirmed Accessible", tone: "positive" },
  confirmed_inaccessible: { label: "Confirmed Inaccessible", tone: "negative" },
  disputed: { label: "Disputed", tone: "disputed" },
};

export const VOTE = {
  ACCESSIBLE: "ACCESSIBLE",
  NOT_ACCESSIBLE: "NOT_ACCESSIBLE",
};

export const REACTION = {
  LIKE: "LIKE",
  DISLIKE: "DISLIKE",
};
