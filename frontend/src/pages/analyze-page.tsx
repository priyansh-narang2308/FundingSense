/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Sparkles, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { analyzeStartup } from "../services/api";
import { LoadingModal } from "../components/LoadingModal";
import { supabase } from "../utils/supabase";

const sectors = [
  "Healthcare & Life Sciences",
  "Financial Services & FinTech",
  "Education & EdTech",
  "E-Commerce & Retail",
  "Enterprise Software & SaaS",
  "Consumer Internet",
  "Deep Tech & AI",
  "Climate & Clean Energy",
  "Logistics & Supply Chain",
  "Media & Entertainment",
  "Other",
];

const stages = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Growth",
];

const geographies = [
  "India - Pan India",
  "India - Metro Cities",
  "India - Tier 2/3 Cities",
  "Southeast Asia",
  "Global",
  "North America",
  "Europe",
];

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "mr", label: "मराठी (Marathi)" },
  { value: "gu", label: "ગુજરાતી (Gujarati)" },
  { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
];

import { useLanguage } from "../contexts/LanguageContext";

export default function Analyze() {
  const { language: currentLanguage, t } = useLanguage();
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [geography, setGeography] = useState("");
  const [language, setLanguage] = useState(currentLanguage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !sector || !stage || !geography) {
      toast({
        title: t("missing_info") || "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const { data: { user } } = await supabase.auth.getUser();

    try {
      const result = await analyzeStartup({
        startup_description: description,
        sector: sector,
        funding_stage: stage,
        geography: geography,
        language: language,
        user_id: user?.id,
      });

      localStorage.setItem("latestAnalysis", JSON.stringify(result));
      localStorage.setItem(
        "latestStartup",
        JSON.stringify({
          sector,
          stage,
          geography,
        })
      );
      navigate(`/results/${result.analysis_id}`);
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description:
          error.message || "Unable to analyze right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <LoadingModal isOpen={isAnalyzing} />
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("analyze")} {t("funding_fit")}
          </h1>
          <p className="text-muted-foreground">
            {t("how_it_works_desc").substring(0, 70)}...
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-elevated p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                {t("startup_description")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("how_it_works_desc")}
              </p>
              <Textarea
                id="description"
                placeholder={t("startup_description") + "..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[160px]"
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length} characters
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sector">{t("sector")}</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger id="sector" className="bg-background">
                    <SelectValue placeholder={t("sector")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">{t("funding_stage")}</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger id="stage" className="bg-background">
                    <SelectValue placeholder={t("funding_stage")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {stages.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geography">{t("geography")}</Label>
                <Select value={geography} onValueChange={setGeography}>
                  <SelectTrigger id="geography" className="bg-background">
                    <SelectValue placeholder={t("geography")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {geographies.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t("report_lang")}</Label>
                <Select value={language} onValueChange={setLanguage as any}>
                  <SelectTrigger id="language" className="bg-background">
                    <SelectValue placeholder={t("report_lang")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-info/5 border border-info/20">
            <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                {t("how_it_works")}
              </p>
              <p>{t("how_it_works_desc")}</p>
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              t("analyzing")
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {t("analyze")} {t("funding_fit")}
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
