import { Link } from "wouter";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-navy-rich relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute -left-32 top-1/4 size-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 size-96 rounded-full bg-gold/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        <img src="/hari-udaan-mark.png" alt="HARI UDAAN" className="size-16 object-contain" />

        <div className="mt-8 font-display text-[120px] font-bold leading-none text-gold-gradient sm:text-[160px]">404</div>
        <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">Page not found</h1>
        <p className="mt-3 max-w-md text-white/60">
          The page you're looking for has moved or doesn't exist. Let's get you back to the HARI UDAAN 2026 control center.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="gold"><Home className="size-4" />Back to dashboard</Button>
          </Link>
          <Link href="/awardees">
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10"><ArrowLeft className="size-4" />Browse awardees</Button>
          </Link>
        </div>

        <p className="mt-10 text-[12px] uppercase tracking-[0.2em] text-white/30">HARI UDAAN 2026 · State Merit Excellence Awards</p>
      </motion.div>
    </div>
  );
}
