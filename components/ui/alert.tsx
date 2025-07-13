import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
  className?: string;
}

const Alert = ({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) => {
  const variants = {
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: CheckCircle,
      iconColor: "text-green-500",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: XCircle,
      iconColor: "text-red-500",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info,
      iconColor: "text-blue-500",
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start space-x-3 rounded-lg border p-4",
        config.container,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1">
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};

export { Alert, type AlertProps };
