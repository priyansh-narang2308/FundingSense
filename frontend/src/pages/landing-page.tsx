/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  CheckCircle,
  Globe,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { getStats } from "../services/api";
import { supabase } from "../utils/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const features = [
  {
    icon: CheckCircle,
    title: "Evidence-Backed Decisions",
    description:
      "Every recommendation is backed by real funding data, policy documents, and market intelligence.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Full support for Indic languages, making funding intelligence accessible to founders across India.",
  },
  {
    icon: Lightbulb,
    title: "Explainable AI Insights",
    description:
      "Understand exactly why a funding outcome is predicted. No black boxes, complete transparency.",
  },
];

const benefits = [
  {
    icon: BarChart3,
    title: "Investor Matching",
    description:
      "Find investors whose portfolio and thesis align with your startup.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Understand potential rejection reasons before you pitch.",
  },
  {
    icon: Zap,
    title: "Fast Insights",
    description: "Get actionable funding intelligence in minutes, not weeks.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total_analyses: "24",
    total_investors: "156",
    avg_score: "87%",
  });

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    getStats()
      .then((data) => {
        if (data.total_analyses > 0) {
          setStats({
            total_analyses: data.total_analyses.toString(),
            total_investors: data.total_investors.toString(),
            avg_score: data.avg_score,
          });
        }
      })
      .catch(() => console.log("Stats fetch failed, using defaults"));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              FundingSense
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hidden sm:block">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full border border-border hover:bg-muted p-0"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.email}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-display">
                          {user.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Account
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="default">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              Evidence-Backed Funding Decision Engine
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight text-balance">
              Make Confident{" "}
              <span className="text-primary">Funding Decisions</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Evidence-backed AI insights from real startup funding data.
              Understand what works, what doesn't, and why—before you pitch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to={user ? "/analyze" : "/signup"}>
                <Button variant="hero" size="xl">
                  Analyze Funding Fit
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="hero-outline" size="xl">
                  {user ? "Go to Dashboard" : "View Demo Dashboard"}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 gradient-hero rounded-3xl" />
            <div className="relative bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      label: "Avg. Funding Fit Score",
                      value: stats.avg_score,
                      color: "text-success",
                    },
                    {
                      label: "Matched Investors",
                      value: stats.total_investors,
                      color: "text-primary",
                    },
                    {
                      label: "Analyses Performed",
                      value: stats.total_analyses,
                      color: "text-info",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-background/50 rounded-xl p-6 text-center"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div
                        className={`text-4xl font-display font-bold ${stat.color}`}
                      >
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">
              Why FundingSense?
            </h2>
            <p className="text-muted-foreground mt-2">
              Built for founders who want clarity, not confusion.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-elevated p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-foreground">
                Everything You Need to Pitch with Confidence
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Stop guessing which investors to approach. Get data-driven
                insights that help you understand your funding landscape before
                you make your move.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-hero rounded-3xl transform rotate-3" />
              <div className="relative card-elevated p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium text-foreground">
                      Sequoia Capital
                    </span>
                    <span className="text-sm font-semibold text-success">
                      92% Fit
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium text-foreground">
                      Accel Partners
                    </span>
                    <span className="text-sm font-semibold text-success">
                      87% Fit
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium text-foreground">
                      Tiger Global
                    </span>
                    <span className="text-sm font-semibold text-warning">
                      65% Fit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="card-elevated gradient-hero p-12 text-center">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Ready to Understand Your Funding Fit?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join hundreds of founders who use FundingSense to make smarter
              funding decisions.
            </p>
            <Link to={user ? "/analyze" : "/signup"}>
              <Button variant="hero" size="xl">
                {user ? "Start New Analysis" : "Start Free Analysis"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">
                FundingSense
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link
                to="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 FundingSense. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
