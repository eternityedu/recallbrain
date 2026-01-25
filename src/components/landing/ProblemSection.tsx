import { motion } from "framer-motion";
import { Ban, TrendingDown, Eye, AlertTriangle } from "lucide-react";

const problems = [
  {
    icon: Ban,
    title: "Ad Blockers Everywhere",
    description: "Over 40% of users block traditional ads. Your message never reaches them."
  },
  {
    icon: TrendingDown,
    title: "Declining Trust",
    description: "Banner blindness is real. Users actively ignore sponsored content and paid placements."
  },
  {
    icon: Eye,
    title: "AI-First Discovery",
    description: "Users now ask AI for recommendations instead of searching. If you're not in AI memory, you don't exist."
  },
  {
    icon: AlertTriangle,
    title: "Missed Opportunities",
    description: "Every AI-generated answer without your brand is a customer lost to competitors."
  }
];

export function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Traditional Ads Are <span className="text-destructive">Broken</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            The advertising landscape has fundamentally changed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6 hover:border-destructive/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
                  <problem.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{problem.title}</h3>
                  <p className="text-muted-foreground text-sm">{problem.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
