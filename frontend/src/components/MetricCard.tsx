import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="metric-card">

      <div>

        <p className="metric-title">
          {title}
        </p>

        <h2 className="metric-value">
          {value}
        </h2>

      </div>

      <div className="metric-icon">
        <Icon size={24} />
      </div>

    </div>
  );
}

export default MetricCard;