import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color?: "default" | "success" | "info" | "warning" | "destructive";
  subtitle?: string;
  className?: string;
}

const colorMap = {
  default: "text-foreground",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  destructive: "text-destructive",
};

const bgMap = {
  default: "bg-secondary",
  success: "bg-success/10",
  info: "bg-info/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
};

export default function StatCard({ title, value, icon, color = "default", subtitle, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold", colorMap[color])}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("p-2.5 rounded-lg", bgMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
