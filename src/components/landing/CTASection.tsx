import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card max-w-4xl mx-auto p-12 text-center glow-border"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Start Free Today</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Ready to Be <span className="glow-text">Remembered</span>?
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Join the brands building AI memory. Get your Recall Score and start earning recommendations today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              onClick={() => navigate('/auth?mode=signup')}
              className="group"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="heroOutline"
              onClick={() => navigate('/simulator')}
            >
              Try the Simulator
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free tier available
          </p>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Coming Soon</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["AI Platform Integrations", "Enterprise API", "Team Workspaces", "Analytics Dashboard"].map((feature) => (
              <span 
                key={feature}
                className="px-4 py-2 rounded-full border border-glass-border bg-glass-bg/30 text-sm text-muted-foreground"
              >
                {feature}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
