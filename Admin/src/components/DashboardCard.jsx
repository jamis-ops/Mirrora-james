import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.jsx";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function DashboardCard({ title, value, description, icon, trend }) {
  // Ensure icon is valid before using it
  const Icon = icon ? icon : null;

  const trendIcon = trend?.isPositive ? (
    <ArrowUpRight className="w-4 h-4 text-green-500" />
  ) : (
    <ArrowDownRight className="w-4 h-4 text-red-500" />
  );

  return (
    <Card className="mb-2 bg-white rounded-xl shadow-md border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && <Icon size={20} className="text-gray-400" />}
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="text-2xl font-bold text-[#2C1810]">
          {value}
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          {trend && (
            <>
              {trendIcon}
              <span className={`font-semibold ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.value}
              </span>
            </>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}