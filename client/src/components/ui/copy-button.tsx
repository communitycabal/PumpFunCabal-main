import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  value: string;
  className?: string;
  testId?: string;
  label?: string;
}

export function CopyButton({ value, className, testId, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <button
      aria-label="Copy to clipboard"
      onClick={onCopy}
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md transition-all",
        copied ? "bg-green-500/20 text-green-500 scale-105" : "hover:bg-muted/40",
        className,
      )}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span className="text-xs">{copied ? "Copied" : label}</span>
    </button>
  );
}


