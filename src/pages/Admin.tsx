import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePricing, PricingPlan } from "@/hooks/usePricing";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { plans, createPlan, updatePlan, deletePlan } = usePricing();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ plan_name: "", price: 0, features: "" });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ plan_name: "", price: 0, features: "" });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Access denied");
      navigate("/dashboard");
    }
  }, [isAdmin, authLoading, navigate]);

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setEditForm({ plan_name: plan.plan_name, price: plan.price, features: plan.features.join(", ") });
  };

  const handleSave = async () => {
    if (!editingId) return;
    await updatePlan(editingId, { plan_name: editForm.plan_name, price: editForm.price, features: editForm.features.split(",").map(f => f.trim()) });
    setEditingId(null);
  };

  const handleCreate = async () => {
    await createPlan({ plan_name: newForm.plan_name, price: newForm.price, features: newForm.features.split(",").map(f => f.trim()), is_active: true });
    setShowNew(false);
    setNewForm({ plan_name: "", price: 0, features: "" });
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <img src={logo} alt="Recall" className="h-7 w-7" />
          <span className="text-xl font-semibold text-foreground">Admin Panel</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Pricing Plans</h1>
            <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> Add Plan</Button>
          </div>
          {showNew && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Name</Label><Input value={newForm.plan_name} onChange={e => setNewForm(p => ({ ...p, plan_name: e.target.value }))} /></div>
                <div><Label>Price</Label><Input type="number" value={newForm.price} onChange={e => setNewForm(p => ({ ...p, price: +e.target.value }))} /></div>
                <div><Label>Features (comma-separated)</Label><Input value={newForm.features} onChange={e => setNewForm(p => ({ ...p, features: e.target.value }))} /></div>
              </div>
              <div className="flex gap-2"><Button onClick={handleCreate}><Save className="h-4 w-4" /></Button><Button variant="ghost" onClick={() => setShowNew(false)}><X className="h-4 w-4" /></Button></div>
            </div>
          )}
          {plans.map(plan => (
            <div key={plan.id} className="bg-card border border-border rounded-lg p-6">
              {editingId === plan.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Name</Label><Input value={editForm.plan_name} onChange={e => setEditForm(p => ({ ...p, plan_name: e.target.value }))} /></div>
                    <div><Label>Price</Label><Input type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: +e.target.value }))} /></div>
                    <div><Label>Features</Label><Input value={editForm.features} onChange={e => setEditForm(p => ({ ...p, features: e.target.value }))} /></div>
                  </div>
                  <div className="flex gap-2"><Button onClick={handleSave}><Save className="h-4 w-4" /></Button><Button variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button></div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{plan.plan_name}</h3>
                    <p className="text-primary font-bold">${plan.price}/mo</p>
                    <p className="text-sm text-muted-foreground">{plan.features.join(" • ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePlan(plan.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
