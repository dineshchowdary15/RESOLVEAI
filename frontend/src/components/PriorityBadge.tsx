import type { TicketPriority } from "../types/ticket";

interface Props {
  priority: TicketPriority;
}

function PriorityBadge({ priority }: Props) {
  return (
    <span className={`badge priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

export default PriorityBadge;