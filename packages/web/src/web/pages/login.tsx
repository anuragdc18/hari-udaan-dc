import * as React from "react";
import { useLocation } from "wouter";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { EVENT } from "@/lib/constants";
import { authService } from "@/services/authService";

export default function Login() {
  const [, navigate] = useLocation();
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("admin@haridc.com");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      localStorage.setItem("crm.currentUser", JSON.stringify(user));
      navigate(user.role === "Registration" ? "/registration" : user.role === "Certificate" ? "/certificate" : "/dashboard");
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="bg-navy-rich relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex xl:w-[55%]">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />

        <div className="relative flex items-center gap-3">
          <img src="/hari-udaan-mark.png" alt="" className="size-12 rounded-xl" />
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold text-white">HARI <span className="text-gold-gradient">UDAAN</span></p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">State Merit Excellence Awards</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative max-w-md">
          <img src="/hari-udaan-logo.png" alt="HARI UDAAN" className="mb-8 w-72 drop-shadow-2xl" />
          <h1 className="font-display text-4xl font-bold leading-tight text-white">
            Celebrating <span className="text-gold-gradient">merit</span>,<br />honouring excellence.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/65">
            The official management portal for {EVENT.name}. Register awardees, issue certificates and track the ceremony - all in one place.
          </p>
          <div className="mt-8 flex gap-6">
            {[
              { icon: Award, label: "Awardee Records" },
              { icon: ShieldCheck, label: "Secure Desk" },
              { icon: Sparkles, label: "Live Insights" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-white/70">
                <f.icon className="size-4 text-gold" />
                <span className="text-[13px] font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-[12px] text-white/40">2026 {EVENT.org}</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/hari-udaan-mark.png" alt="" className="size-11 rounded-xl" />
            <p className="font-display text-lg font-extrabold">HARI <span className="text-gold-gradient">UDAAN</span></p>
          </div>

          <h2 className="font-display text-2xl font-bold">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to the awards management portal.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label>Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" type="email" placeholder="you@hariudaan.org" />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" type={show ? "text" : "password"} placeholder="Enter password" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : <>Sign in <ArrowRight className="size-4" /></>}
            </Button>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
