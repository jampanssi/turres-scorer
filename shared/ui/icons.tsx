import type { SVGProps } from "react";

/** Inline stroke icons (DESIGN.md §7). Decorative by default; give the parent button an aria-label. */

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ChevronLeftIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M15 5l-7 7 7 7" /></Icon>
);
export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M9 5l7 7-7 7" /></Icon>
);
export const StopwatchIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><circle cx="12" cy="14" r="7" /><path d="M12 14V10M9 3h6M18.5 6.5l1.5-1.5" /></Icon>
);
export const UndoIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></Icon>
);
export const MinusIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M5 12h14" /></Icon>
);
export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
);
export const WarningIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M12 3L2 21h20L12 3z" /><path d="M12 10v5M12 18h.01" /></Icon>
);
export const CircleXIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></Icon>
);
