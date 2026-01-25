import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 md:pt-16 px-4">
      <div className="container mx-auto relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary text-sm text-muted-foreground mb-8"
          >
            AI-First Brand Optimization
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground"
          >
            SEO for{" "}
            <span className="text-primary">AI</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto"
          >
            We don't place ads. We build AI memory.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-base text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Recall optimizes your brand knowledge so AI systems can remember, trust, and recommend you naturally.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="xl"
              onClick={() => navigate('/auth?mode=signup')}
              className="group"
            >
              Optimize My Brand
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline"
              size="xl"
              onClick={() => navigate('/simulator')}
              className="group"
            >
              <Play className="h-5 w-5" />
              See AI Demo
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-4">Trusted by forward-thinking brands</p>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
              {["TechStart", "AIFlow", "LearnHub", "DataSync", "CloudPeak"].map((brand) => (
                <span key={brand} className="text-lg font-medium">
                  {brand}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
