import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, GripVertical, CheckCircle } from "lucide-react";

interface BenefitsEditorProps {
  benefits: string[];
  onChange: (benefits: string[]) => void;
}

export default function BenefitsEditor({ benefits, onChange }: BenefitsEditorProps) {
  const addBenefit = () => onChange([...benefits, ""]);

  const removeBenefit = (index: number) => {
    onChange(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, value: string) => {
    const updated = [...benefits];
    updated[index] = value;
    onChange(updated);
  };

  const moveBenefit = (from: number, to: number) => {
    if (to < 0 || to >= benefits.length) return;
    const updated = [...benefits];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>Benefícios do Produto</Label>
      {benefits.length > 0 && (
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveBenefit(index, index - 1)}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors p-0.5"
                  title="Mover para cima"
                >
                  <GripVertical className="w-3.5 h-3.5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBenefit(index, index + 1)}
                  disabled={index === benefits.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors p-0.5"
                  title="Mover para baixo"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </button>
              </div>
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <Input
                value={benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                placeholder={`Benefício ${index + 1}`}
                className="bg-input border-border/50 flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBenefit(index)}
                className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addBenefit}
        className="gap-1.5 w-full border-dashed"
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar benefício
      </Button>
    </div>
  );
}
