import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-gray-200 text-gray-600",
        secondary: "bg-gray-200 text-gray-600",
        destructive: "bg-destructive-soft text-destructive",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        outline: "border border-gray-300 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
