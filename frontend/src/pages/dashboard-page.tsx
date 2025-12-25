/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  ArrowRight,
  TrendingUp,
  Search,
  FileText,
  Users,
  BarChart3,
  Clock,
} from "lucide-react";
import { getStats, getHistory } from "../services/api";
import type { AnalysisResponse } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";

import { formatRelativeTime } from "../lib/utils";

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState([
    { label: t("analyses_run"), value: "0", icon: Search },
    { label: t("investors_matched"), value: "0", icon: Users },
    { label: t("evidence_points"), value: "0", icon: FileText },
    { label: t("avg_fit_score"), value: "0%", icon: BarChart3 },
  ]);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const [statsData, historyData] = await Promise.all([
          getStats(userId),
          getHistory(userId),
        ]);

        setStats([
          { label: t("analyses_run"), value: statsData.total_analyses.toString(), icon: Search },
          { label: t("investors_matched"), value: statsData.total_investors.toString(), icon: Users },
          { label: t("evidence_points"), value: statsData.total_evidence.toString(), icon: FileText },
          { label: t("avg_fit_score"), value: statsData.avg_score, icon: BarChart3 },
        ]);

        setRecentAnalyses(historyData.slice(-5).reverse());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]); 

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("dashboard")}
            </h1>
            <p className="text-muted-foreground">
              {t("welcome")}! {t("how_it_works_desc").substring(0, 50)}...
            </p>
          </div>
          <Link to="/analyze">
            <Button variant="hero">
              {t("new_analysis")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="card-elevated p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {loading ? "..." : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>


        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/analyze" className="block">
            <div className="card-interactive p-6 h-full gradient-hero">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shrink-0">
                  <Search className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                    {t("analyze")} {t("funding_fit")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("how_it_works_desc").substring(0, 60)}...
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/evidence" className="block">
            <div className="card-interactive p-6 h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-info" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                    {t("evidence")} & {t("sources_used").split(" ")[0]} 
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("report_desc")}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>


        <div className="card-elevated">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-foreground">
                {t("recent_analysis")}
              </h2>
              
            </div>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">{t("loading_analyses")}</div>
            ) : recentAnalyses.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">{t("no_analyses")}</div>
            ) : (
              recentAnalyses.map((analysis) => (
                <Link
                  key={analysis.analysis_id}
                  to={`/results/${analysis.analysis_id}`}
                  className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {analysis.startup_summary.length > 40 ? analysis.startup_summary.substring(0, 40) + "..." : analysis.startup_summary}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                         {analysis.confidence_indicator} {t("confidence")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <Badge
                        variant={
                          analysis.confidence_indicator === "high"
                            ? "confidence-high"
                            : analysis.confidence_indicator === "medium"
                            ? "confidence-medium"
                            : "confidence-low"
                        }
                      >
                        {analysis.overall_score}% {t("fit_score").split(" ")[0]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatRelativeTime(analysis.created_at)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
