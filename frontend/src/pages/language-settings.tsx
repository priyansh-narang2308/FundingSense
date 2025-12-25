/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Globe, Check, Save } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../hooks/use-toast";

const languages = [
  { value: "en", label: "English", native: "English", flag: "🇺🇸" },
  { value: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { value: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { value: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { value: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { value: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { value: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { value: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
] as const;

export default function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage();
  const [uiLanguage, setUiLanguage] = useState(language);
  const [reportLanguage, setReportLanguage] = useState("en");
  const { toast } = useToast();

  const handleSave = () => {
    setLanguage(uiLanguage as any);
    toast({
      title: t("save_prefs"),
      description: "Your language settings have been updated.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("language_settings")}
            </h1>
            <p className="text-muted-foreground">
              {t("interface_lang_desc")}
            </p>
          </div>
        </div>

        {/* Interface Language */}
        <div className="card-elevated p-6 space-y-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">
              {t("interface_lang")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("interface_lang_desc")}
            </p>
          </div>

          <RadioGroup
            value={uiLanguage}
            onValueChange={setUiLanguage as any}
            className="grid sm:grid-cols-2 gap-3"
          >
            {languages.map((lang) => (
              <label
                key={lang.value}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  uiLanguage === lang.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={lang.value} className="sr-only" />
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{lang.label}</p>
                  <p className="text-sm text-muted-foreground">{lang.native}</p>
                </div>
                {uiLanguage === lang.value && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Report Language */}
        <div className="card-elevated p-6 space-y-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">
              {t("report_lang")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("report_lang_desc")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-lang">{t("report_lang")}</Label>
            <Select value={reportLanguage} onValueChange={setReportLanguage}>
              <SelectTrigger
                id="report-lang"
                className="w-full sm:w-72 bg-background"
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      <span className="text-muted-foreground">
                        ({lang.native})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info card */}
        <div className="p-4 rounded-xl bg-info/5 border border-info/20">
          <h3 className="font-medium text-foreground mb-1">
            {t("about_multilingual")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("about_multilingual_desc")}
          </p>
        </div>

        {/* Save button */}
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="w-4 h-4" />
          {t("save_prefs")}
        </Button>
      </div>
    </DashboardLayout>
  );
}
