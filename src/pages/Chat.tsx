import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import logo from "@/assets/logo.png";

export default function Chat() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { messages, sendMessage, adminUserId } = useChat();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(input);
      setInput("");
    } finally {
      setSending(false);
    }
  };

  const relevantMessages = isAdmin ? messages : messages.filter(m => m.sender_id === user?.id || m.receiver_id === user?.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <img src={logo} alt="Recall" className="h-7 w-7" />
          <span className="text-xl font-semibold text-foreground">{isAdmin ? "Support Messages" : "Chat with Support"}</span>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-4 max-w-2xl flex flex-col">
        <div className="flex-1 bg-card border border-border rounded-lg p-4 overflow-y-auto space-y-3 mb-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {relevantMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{isAdmin ? "No messages yet" : "Send a message to the admin"}</p>
          ) : (
            relevantMessages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-60 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type a message..." />
          <Button onClick={handleSend} disabled={sending || !input.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </main>
    </div>
  );
}
