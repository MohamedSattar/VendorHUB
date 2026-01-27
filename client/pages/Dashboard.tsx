import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import PieChart from "@/components/PieChart";
import LineChart from "@/components/LineChart";
import EngagementsList from "@/components/EngagementsList";
import { Clock, CheckCircle, Users, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const { t, isArabic } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      <DashboardHeader />

      {/* Main content */}
      <main className="flex-grow">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isArabic ? "text-right" : "text-left"}`}>
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">{t("dashboard.breadcrumb")}</p>
            <h1 className="text-3xl font-bold text-navy">{t("dashboard.title")}</h1>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Clock className="w-8 h-8" />}
              title="New Engagement"
              value="3"
              backgroundColor="bg-orange-500"
            />
            <StatCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="Active Engagement"
              value="15"
              backgroundColor="bg-green-500"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Total Engagement"
              value="35"
              backgroundColor="bg-amber-700"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              title="Total Employees"
              value="35"
              backgroundColor="bg-orange-400"
            />
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <PieChart />
            <div className="lg:col-span-2">
              <LineChart />
            </div>
          </div>

          {/* Engagements list */}
          <EngagementsList />
        </div>
      </main>

      <Footer />
    </div>
  );
}
