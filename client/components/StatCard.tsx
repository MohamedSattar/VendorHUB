import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  backgroundColor: string;
  iconColor?: string;
}

export default function StatCard({
  icon,
  title,
  value,
  backgroundColor,
  iconColor = "white",
}: StatCardProps) {
  return (
    <div className={`${backgroundColor} rounded-lg p-6 text-white shadow-md`}>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
