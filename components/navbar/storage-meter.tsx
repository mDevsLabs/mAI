import { formatStorageBytes } from "@/lib/mai-api";

interface StorageMeterProps {
  used: number;
  limit: number;
  percent: number;
  variant: "desktop" | "mobile";
}

export function StorageMeter({ used, limit, percent, variant }: StorageMeterProps) {
  const labelsClassName =
    variant === "desktop"
      ? "text-slate-400"
      : "text-slate-500";

  return (
    <>
      <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percent >= 90
              ? "bg-red-500"
              : percent >= 70
                ? "bg-amber-500"
                : "bg-gradient-to-r from-purple-500 to-blue-500"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <div
        className={`flex items-center justify-between text-[10px] font-medium ${labelsClassName}`}
      >
        <span>{formatStorageBytes(used)}</span>
        <span>{formatStorageBytes(limit)}</span>
      </div>
    </>
  );
}
