export default function AvailableForWorkBadge() {
  return (
    <div
      role="status"
      aria-label="Availability status: available for work"
      className="flex items-center gap-2 rounded-full border border-border-light bg-white/95 px-3 py-2 text-sm font-semibold text-black shadow-[0_2px_12px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-bg-dark/95 dark:text-white dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
    >
      <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
        <span className="status-pulse-ring absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#10B981] opacity-70" />
        <span className="relative h-3 w-3 rounded-full bg-[#10B981]" />
      </span>
      <span className="hidden whitespace-nowrap sm:inline">Available for work</span>
    </div>
  );
}
