import { motion } from "framer-motion";
import { FileText, Cpu, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Submit Your Brand",
    description: "Enter your brand details, value proposition, and target audience. Our system captures what makes you unique."
  },
  {
    icon: Cpu,
    number: "02",
    title: "AI Optimization",
    description: "Our engine analyzes your brand and generates AI-readable summaries and recommendation triggers."
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Simulate & Score",
    description: "Test how AI would recommend you, get your Recall Score, and refine for maximum visibility."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
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
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-lg p-8 text-center h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 mb-6">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-sm font-mono text-primary mb-2">{step.number}</div>
                  <h3 className="font-semibold text-xl mb-3 text-foreground">{step.title}</h3>
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
