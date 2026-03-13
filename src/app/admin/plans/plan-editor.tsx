
"use client";

import { useState } from "react";
import { updatePlan } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string; // JSON
  isPromoted: boolean;
};

export function PlanEditor({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Parse features
  const initialFeatures = JSON.parse(plan.features) as string[];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const isPromoted = formData.get("isPromoted") === "on";
    const featuresStr = formData.get("features") as string;
    
    // Split features by newline and filter empty
    const features = featuresStr.split("\n").map(f => f.trim()).filter(Boolean);

    try {
      await updatePlan(plan.id, { price, description, isPromoted, features });
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>{plan.name}</span>
            {plan.isPromoted && <span className="text-xs bg-primary px-2 py-1 rounded text-white animate-pulse">PROMOCJA</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Cena (PLN)</Label>
                <Input name="price" type="number" step="0.01" defaultValue={Number(plan.price)} className="bg-black/20" />
            </div>

            <div className="space-y-2">
                <Label>Opis</Label>
                <Input name="description" defaultValue={plan.description || ""} className="bg-black/20" />
            </div>

            <div className="space-y-2">
                <Label>Cechy (jedna w linii)</Label>
                <Textarea 
                    name="features" 
                    defaultValue={initialFeatures.join("\n")} 
                    className="bg-black/20 min-h-[120px]" 
                />
            </div>

            <div className="flex items-center space-x-2 py-2">
                <Switch name="isPromoted" defaultChecked={plan.isPromoted} id={`promoted-${plan.id}`} />
                <Label htmlFor={`promoted-${plan.id}`}>Oznacz jako Promocja</Label>
            </div>

            {error && <p className="text-red-500 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {error}</p>}
            
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (success ? <Check className="w-4 h-4" /> : "Zapisz Zmiany")}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
