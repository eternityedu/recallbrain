import { motion } from "framer-motion";
import { Brain, Zap, Target, Shield, Sparkles, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Memory Architecture",
    description: "Structure your brand knowledge so AI systems can understand, store, and recall your value proposition accurately."
  },
  {
    icon: Target,
    title: "Intent Matching",
    description: "Map your brand to specific user intents and queries, ensuring you're recommended at the right moment."
  },
  {
    icon: Zap,
    title: "Instant Optimization",
    description: "Get AI-readable summaries and recommendation triggers generated in seconds, not weeks."
  },
  {
    icon: Shield,
    title: "Trust Signals",
    description: "Build authority markers that AI systems recognize—reviews, awards, use cases, and social proof."
  },
  {
    icon: Sparkles,
    title: "Recommendation Simulator",
    description: "Test exactly how AI systems would recommend your brand for different user queries."
  },
  {
    icon: TrendingUp,
    title: "Recall Score",
    description: "Track your brand's AI visibility with a comprehensive score measuring relevance, clarity, and authority."
  }
];

export function SolutionSection() {
  return (
    <section id="features" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
            The <span className="glow-text">Recall</span> Solution
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Don't fight for attention. Earn AI recommendations through optimized brand memory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 group hover:border-primary/30 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
