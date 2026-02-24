interface StatusIndicatorProps {
  status: "operational" | "warning" | "offline";
  label?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  operational: {
    color: "hsl(142, 76%, 50%)",
    label: "ONLINE",
    pulse: true,
  },
  warning: {
    color: "hsl(45, 100%, 60%)",
    label: "WARNING",
    pulse: true,
  },
  offline: {
    color: "hsl(0, 84%, 50%)",
    label: "OFFLINE",
    pulse: false,
  },
};

const sizeMap = { sm: 8, md: 12, lg: 16 };

const StatusIndicator = ({ status, label, size = "md" }: StatusIndicatorProps) => {
  const config = statusConfig[status];
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: s, height: s }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: config.color,
            boxShadow: `0 0 ${s}px ${config.color}, 0 0 ${s * 2}px ${config.color}`,
          }}
        />
        {config.pulse && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: config.color,
              opacity: 0.4,
            }}
          />
        )}
      </div>
      <span
        className="font-mono text-xs uppercase tracking-wider"
        style={{ color: config.color, textShadow: `0 0 8px ${config.color}` }}
      >
        {label || config.label}
      </span>
    </div>
  );
};

export default StatusIndicator;
