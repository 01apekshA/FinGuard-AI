import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading…", size = 28 }) {
  return (
    <div
      data-testid="loader"
      className="flex flex-col items-center justify-center gap-3 py-12 text-ink-500"
    >
      <Loader2 className="animate-spin text-brand-600" style={{ width: size, height: size }} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
