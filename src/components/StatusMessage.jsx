export default function StatusMessage({ tone = "info", children }) {
  if (!children) return null;
  return (
    <p className={`status-message status-${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
