import { motion } from "framer-motion";
import { FileText, Cpu, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Submit Your Brand",
    description: "Enter your brand details, value proposition, target audience, and trust signals. Our system captures what makes you unique."
  },
  {
    icon: Cpu,
    number: "02",
    title: "AI Optimization",
    description: "Our engine analyzes your brand and generates AI-readable summaries, intent mappings, and recommendation triggers."
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Simulate & Score",
    description: "Test how AI would recommend you, get your Recall Score, and refine your brand memory for maximum visibility."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden bg-dark-surface">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
            How It <span className="glow-text">Works</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Three simple steps to make your brand AI-memorable.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-px">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary/50 to-transparent" />
                    <ArrowRight className="absolute right-1/4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                  </div>
                )}
                
                <div className="glass-card p-8 text-center h-full glow-border">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-sm font-mono text-primary mb-2">{step.number}</div>
                  <h3 className="font-display font-semibold text-xl mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
