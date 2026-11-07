interface SectionHeaderProps {
  title: string;
  /** Optional count on the right: `**2 / 6** stages done`. */
  count?: { done: number; total: number; label: string };
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between px-4 pb-2 pt-4">
      <h2 className="font-display text-[22px] font-bold uppercase leading-none">{title}</h2>
      {count && (
        <p className="text-[13px] text-text-secondary">
          <strong className="font-bold text-text">
            {count.done} / {count.total}
          </strong>{" "}
          {count.label}
        </p>
      )}
    </div>
  );
}
