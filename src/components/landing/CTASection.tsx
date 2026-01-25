import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto bg-card border border-border rounded-lg p-8 md:p-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            Start Free Today
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Ready to Be <span className="text-primary">Remembered</span>?
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Join the brands building AI memory. Get your Recall Score and start earning recommendations today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="xl"
              onClick={() => navigate('/auth?mode=signup')}
              className="group"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline"
              size="xl"
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
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Coming Soon</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["AI Platform Integrations", "Enterprise API", "Team Workspaces", "Analytics Dashboard"].map((feature) => (
              <span 
                key={feature}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground"
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
