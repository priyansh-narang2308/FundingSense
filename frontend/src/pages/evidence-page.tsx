import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Search,
  ExternalLink,
  Newspaper,
  FileText,
  Database,
  Filter,
} from "lucide-react";
import { getAllEvidence } from "../services/api";
import type { EvidenceUsed } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";

const typeIcons = {
  news: Newspaper,
  policy: FileText,
  dataset: Database,
  News: Newspaper,
  Policy: FileText,
  Dataset: Database,
};

export default function Evidence() {
  const { t } = useLanguage();
  const [evidenceData, setEvidenceData] = useState<EvidenceUsed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const data = await getAllEvidence(user?.id);
        setEvidenceData(data);
      } catch (error) {
        console.error("Failed to fetch evidence:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvidence = evidenceData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.usage_reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.source_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const typeCounts = {
    all: evidenceData.length,
    news: evidenceData.filter((e) => e.source_type.toLowerCase() === "news").length,
    policy: evidenceData.filter((e) => e.source_type.toLowerCase() === "policy").length,
    dataset: evidenceData.filter((e) => e.source_type.toLowerCase() === "dataset").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("evidence")} & {t("sources_used").split(" ").pop()}
          </h1>
          <p className="text-muted-foreground">
            {t("report_desc")} ({evidenceData.length} {t("total_sources")})
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t("search_sources")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-background">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              <SelectItem value="all">{t("all_types")} ({typeCounts.all})</SelectItem>
              <SelectItem value="news">{t("news")} ({typeCounts.news})</SelectItem>
              <SelectItem value="policy">
                {t("policy")} ({typeCounts.policy})
              </SelectItem>
              <SelectItem value="dataset">
                {t("dataset")} ({typeCounts.dataset})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { type: "news", label: t("news"), count: typeCounts.news, Icon: Newspaper },
            { type: "policy", label: t("policy"), count: typeCounts.policy, Icon: FileText },
            { type: "dataset", label: t("dataset"), count: typeCounts.dataset, Icon: Database },
          ].map(({ type, label, count, Icon }) => (
            <div
              key={type}
              className={`card-elevated p-4 cursor-pointer transition-all ${
                typeFilter === type ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {loading ? "..." : count}
                  </p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Evidence list */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">{t("loading_evidence")}</div>
          ) : filteredEvidence.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-2">
                No sources found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredEvidence.map((item, index) => {
              const Icon = typeIcons[item.source_type as keyof typeof typeIcons] || FileText;
              return (
                <div key={index} className="card-interactive p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="capitalize">{item.source_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {item.source_name}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm mt-2">
                            <span className="text-muted-foreground">
                              {item.year}
                            </span>
                            <span className="text-primary font-medium">
                              {t("used_for")}: {item.usage_reason}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => item.url && window.open(item.url, '_blank')}
                          disabled={!item.url}
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}