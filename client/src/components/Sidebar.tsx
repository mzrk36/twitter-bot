import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-chart-line" },
  { name: "Bot Control", href: "/bot", icon: "fas fa-robot" },
  { name: "Scheduled Tweets", href: "/scheduled", icon: "fas fa-calendar-alt" },
  { name: "Content Generator", href: "/content", icon: "fas fa-brain" },
  { name: "Analytics", href: "/analytics", icon: "fas fa-chart-bar" },
  { name: "Tweet History", href: "/history", icon: "fas fa-history" },
  { name: "Settings", href: "/settings", icon: "fas fa-cog" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fab fa-twitter text-white text-sm"></i>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-white">MotivateBot</h1>
              <p className="text-xs text-slate-400">v2.1</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
                onClick={onClose}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Bot Status */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Bot Status</span>
            </div>
            <span className="text-xs font-medium text-green-400">ACTIVE</span>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => window.location.href = '/api/logout'}
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
