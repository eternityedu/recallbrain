import { motion } from "framer-motion";
import { Rocket, GraduationCap, Bot, Megaphone, Building2, ShoppingBag } from "lucide-react";

const useCases = [
  {
    icon: Rocket,
    title: "Startup Founders",
    description: "Get discovered when users ask AI about solutions in your space.",
    example: "\"What's the best project management tool for remote teams?\""
  },
  {
    icon: Bot,
    title: "AI Tools & Services",
    description: "Stand out in a crowded market. Be the tool AI recommends.",
    example: "\"Recommend an AI writing assistant for content creators.\""
  },
  {
    icon: GraduationCap,
    title: "EdTech Platforms",
    description: "Become the go-to recommendation for learners asking about courses.",
    example: "\"What's the best platform to learn data science?\""
  },
  {
    icon: Megaphone,
    title: "Marketing Teams",
    description: "Pioneer AI-first discovery strategies before competitors.",
    example: "\"Suggest marketing automation tools for small businesses.\""
  },
  {
    icon: Building2,
    title: "SaaS Companies",
    description: "Capture leads at the moment of intent with AI recommendations.",
    example: "\"Best CRM for B2B sales teams with pipeline management.\""
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Brands",
    description: "Get product recommendations in AI shopping assistants.",
    example: "\"Recommend sustainable fashion brands with good reviews.\""
  }
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Built for <span className="text-primary">Every Brand</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a startup or enterprise, Recall helps you become AI-memorable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <useCase.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg pt-2 text-foreground">{useCase.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-xs text-primary font-mono">{useCase.example}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
