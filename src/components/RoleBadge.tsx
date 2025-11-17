import { Icons } from "./Icons";

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          color: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
          icon: Icons.Shield,
        };
      case "manager":
        return {
          label: "Manager", 
          color: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: Icons.ChartBar,
        };
      case "barista":
        return {
          label: "Barista",
          color: "from-green-500 to-green-600", 
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: Icons.Coffee,
        };
      case "customer":
      default:
        return {
          label: "Customer",
          color: "from-amber-500 to-orange-600",
          bgColor: "bg-amber-100", 
          textColor: "text-amber-800",
          icon: Icons.Users,
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm", 
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5", 
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bgColor} ${config.textColor} rounded-full font-medium border border-current/20 shadow-sm`}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
