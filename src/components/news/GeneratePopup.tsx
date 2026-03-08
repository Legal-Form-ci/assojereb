import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ImagePlus, FileText, Images, Wand2 } from 'lucide-react';

export type GenerateOption = 'text-image' | 'text-multi-images' | 'text-only';

interface GeneratePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (option: GenerateOption, keepCurrentImage: boolean) => void;
  hasExistingImage: boolean;
  isEditing: boolean;
}

const OPTIONS: { value: GenerateOption; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'text-image',
    label: 'Publication avec image IA',
    description: 'L\'IA génère le texte et une image unique ultra-réaliste',
    icon: <ImagePlus className="h-6 w-6" />,
  },
  {
    value: 'text-multi-images',
    label: 'Publication avec plusieurs images',
    description: 'L\'IA génère le texte et une galerie de 3 images thématiques',
    icon: <Images className="h-6 w-6" />,
  },
  {
    value: 'text-only',
    label: 'Publication texte uniquement',
    description: 'Génération textuelle pure, sans élément visuel',
    icon: <FileText className="h-6 w-6" />,
  },
];

export function GeneratePopup({ open, onOpenChange, onGenerate, hasExistingImage, isEditing }: GeneratePopupProps) {
  const [selected, setSelected] = useState<GenerateOption>('text-image');
  const [keepCurrentImage, setKeepCurrentImage] = useState(false);

  const handleGenerate = () => {
    onGenerate(selected, keepCurrentImage);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-secondary" />
            Choisir le format de publication
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {OPTIONS.map((opt) => (
            <Card
              key={opt.value}
              className={`cursor-pointer transition-all ${selected === opt.value ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-muted-foreground/30'}`}
              onClick={() => setSelected(opt.value)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <div className={`p-2 rounded-lg ${selected === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {hasExistingImage && isEditing && selected !== 'text-only' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            <Checkbox
              id="keepImage"
              checked={keepCurrentImage}
              onCheckedChange={(checked) => setKeepCurrentImage(checked === true)}
            />
            <Label htmlFor="keepImage" className="text-sm cursor-pointer">
              Garder l'image actuelle (ne pas régénérer)
            </Label>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button className="btn-primary-gradient gap-2" onClick={handleGenerate}>
            <Wand2 className="h-4 w-4" />
            Générer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
