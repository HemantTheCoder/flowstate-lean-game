import { GameState } from "@shared/schema";
import { Smile, Zap, Heart, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface ResourceBarProps {
  resources: NonNullable<GameState["resources"]>;
}

export function ResourceBar({ resources }: ResourceBarProps) {
  const items = [
    { label: "Morale", value: resources.morale, icon: Smile, color: "text-pink-500", bg: "bg-pink-100" },
    { label: "Trust", value: resources.trust, icon: Heart, color: "text-red-500", bg: "bg-red-100" },
    { label: "Productivity", value: resources.productivity, icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" },
    { label: "Quality", value: resources.quality, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "Budget", value: resources.budget, icon: DollarSign, color: "text-green-600", bg: "bg-green-100", format: (v: number) => `$${v.toLocaleString()}` },
  ];

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none"
    >
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50 px-6 py-2 flex flex-wrap justify-between items-center gap-4 pointer-events-auto">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${item.bg}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">{item.label}</span>
              <span className="font-display font-bold text-sm text-gray-800">
                {item.format ? item.format(item.value) : `${Math.round(item.value)}%`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
