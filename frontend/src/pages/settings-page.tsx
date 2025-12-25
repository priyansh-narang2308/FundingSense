/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Globe, Bell, Shield, Save, User as UserIcon, LogOut } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

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

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
        setCompany(user.user_metadata?.company || "");
      }
      setIsLoading(false);
    }
    getProfile();
  }, []);

  const handleProfileSave = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, company: company }
    });

    if (error) {
       toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: t("save_prefs"),
        description: "Profile updated successfully.",
      });
    }
  };

  const handleNotificationsSave = () => {
    toast({
      title: t("save_prefs"),
      description: "Notification preferences updated.",
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Password updated successfully." });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) return <DashboardLayout><div className="p-12 text-center text-muted-foreground">Loading settings...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("settings")}
            </h1>
            <p className="text-muted-foreground">
              Manage your account preferences and security
            </p>
          </div>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 border border-border p-1 rounded-xl">
            <TabsTrigger value="profile" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t("language_settings").split(" ")[0]}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="card-elevated p-6 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20">
                    {name ? name[0] : (email ? email[0].toUpperCase() : "U")}
                 </div>
                 <div>
                    <h2 className="text-lg font-display font-semibold text-foreground">Personal Information</h2>
                    <p className="text-sm text-muted-foreground">{email}</p>
                 </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="company">Company / Startup Name</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="HealthTech AI"
                    className="bg-background/50"
                  />
                </div>
              </div>
              <Button onClick={handleProfileSave} variant="hero">
                <Save className="w-4 h-4" />
                {t("save_prefs")}
              </Button>
            </div>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="card-elevated p-6 space-y-6">
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">
                  {t("language_settings")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose your preferred language for the interface and reports
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ui-language">{t("interface_lang")}</Label>
                  <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                    <SelectTrigger id="ui-language" className="w-full sm:w-72 bg-background">
                      <SelectValue placeholder="Select language" />
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
                <div className="space-y-2">
                  <Label htmlFor="report-language">{t("report_lang")}</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="report-language" className="w-full sm:w-72 bg-background">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border">
                      {languages.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This determines the language of the generated AI reports.
                  </p>
                </div>
              </div>
              <Button onClick={() => toast({ title: t("save_prefs") })} variant="hero">
                <Save className="w-4 h-4" />
                {t("save_prefs")}
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="card-elevated p-6 space-y-6">
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Notification Preferences
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Control how and when you receive updates
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive analysis completion and important updates
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Summary of funding trends and new investor activity
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>
              </div>
              <Button onClick={handleNotificationsSave} variant="hero">
                <Save className="w-4 h-4" />
                {t("save_prefs")}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <form onSubmit={handlePasswordUpdate}>
              <div className="card-elevated p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-display font-semibold text-foreground">
                    Security Settings
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your account security and password
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" name="new-password" type="password" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" name="confirm-password" type="password" required className="bg-background/50" />
                  </div>
                </div>
                <Button type="submit" variant="hero">
                  <Shield className="w-4 h-4" />
                  Update Password
                </Button>
              </div>
            </form>

            <div className="card-elevated p-6 border-destructive/20 bg-destructive/5">
              <h3 className="font-display font-semibold text-destructive mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" className="bg-destructive hover:bg-destructive/90">Delete Account</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
