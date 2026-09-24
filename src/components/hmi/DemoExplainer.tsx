import HMIPanel from "@/components/hmi/HMIPanel";

interface DemoExplainerProps {
  title: string;
  items: { title: string; body: string }[];
  className?: string;
}

/** Shared "What this demo shows" panel used across the demo pages. */
const DemoExplainer = ({ title, items, className }: DemoExplainerProps) => (
  <HMIPanel title={title} className={className}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <div key={i} className="space-y-1.5">
          <h3 className="font-mono text-xs uppercase tracking-wider text-primary">{item.title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{item.body}</p>
        </div>
      ))}
    </div>
  </HMIPanel>
);

export default DemoExplainer;
