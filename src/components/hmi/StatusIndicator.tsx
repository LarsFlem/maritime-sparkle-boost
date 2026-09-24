interface StatusIndicatorProps {
  status: "operational" | "warning" | "offline";
  label?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  operational: {
    color: "hsl(180, 70%, 55%)",
    label: "ONLINE",
    pulse: true,
  },
  warning: {
    color: "hsl(38, 85%, 60%)",
    label: "WARNING",
    pulse: true,
  },
  offline: {
    color: "hsl(210, 15%, 45%)",
    label: "OFFLINE",
    pulse: false,
  },
};

const sizeMap = { sm: 8, md: 10, lg: 14 };

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
            boxShadow: `0 0 6px ${config.color}80`,
          }}
        />
        {config.pulse && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: config.color,
              opacity: 0.25,
            }}
          />
        )}
      </div>
      <span
        className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
      >
        {label || config.label}
      </span>
    </div>
  );
};

export default StatusIndicator;
