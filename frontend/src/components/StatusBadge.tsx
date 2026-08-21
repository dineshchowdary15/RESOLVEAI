import type { TicketStatus } from "../types/ticket";

interface Props {
  status: TicketStatus;
}

function StatusBadge({ status }: Props) {

  const label =
    status === "IN_PROGRESS"
      ? "IN PROGRESS"
      : status;

  return (
    <span className={`badge status-${status.toLowerCase()}`}>
      {label}
    </span>
  );
}

export default StatusBadge;