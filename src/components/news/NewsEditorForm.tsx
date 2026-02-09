import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2, Upload, X, Video, Wand2 } from 'lucide-react';
import { NEWS_CATEGORIES, NewsFormData } from '@/hooks/useNews';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface NewsEditorFormProps {
  formData: NewsFormData;
  onChange: (data: NewsFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  isEditing: boolean;
}

export function NewsEditorForm({ formData, onChange, onSubmit, onCancel, isPending, isEditing }: NewsEditorFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAutoGenerate = async () => {
    if (!formData.content.trim()) {
      toast.error('Veuillez saisir du contenu à enrichir');
      return;
    }

    setIsEnhancing(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'news-auto-generate',
          messages: [{ role: 'user', content: formData.content }],
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('AI request failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex;
        
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
            }
          } catch {}
        }
      }

      // Parse the AI response to extract structured data
      try {
        // Try to parse as JSON first
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          
          // Clean and format the title (uppercase, bold)
          const cleanTitle = (aiData.title || formData.title).toUpperCase();
          
          // Clean content - remove any markdown artifacts
          let cleanContent = aiData.content || formData.content;
          cleanContent = cleanContent
            .replace(/\*\*/g, '') // Remove markdown bold
            .replace(/##/g, '') // Remove markdown headers
            .replace(/###/g, '')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
          
          // Ensure content starts with proper HTML if not already
          if (!cleanContent.startsWith('<')) {
            cleanContent = `<p>${cleanContent}</p>`;
          }
          
          // Update form with AI suggestions
          onChange({
            ...formData,
            title: cleanTitle,
            content: cleanContent,
            category: aiData.category || formData.category,
          });
          
          toast.success('Contenu généré avec succès ! Titre en MAJUSCULES, contenu structuré.');
        } else {
          // If not JSON, clean and use the response as enriched content
          let cleanContent = fullResponse
            .replace(/\*\*/g, '')
            .replace(/##/g, '')
            .replace(/###/g, '');
          onChange({ ...formData, content: cleanContent });
          toast.success('Contenu enrichi avec succès !');
        }
      } catch {
        // Fallback: clean and use as enriched content
        const cleanContent = fullResponse
          .replace(/\*\*/g, '')
          .replace(/##/g, '');
        onChange({ ...formData, content: cleanContent });
        toast.success('Contenu enrichi !');
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast.error('Erreur lors de la génération IA');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 500 * 1024 * 1024 : 20 * 1024 * 1024;
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name}: Type de fichier non supporté`);
        continue;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: Fichier trop volumineux (max ${isVideo ? '500' : '20'}Mo)`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    setMediaFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];
    
    setUploadingMedia(true);
    const urls: string[] = [];
    
    try {
      for (const file of mediaFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('news-media')
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('news-media')
          .getPublicUrl(data.path);
        
        urls.push(urlData.publicUrl);
      }
      
      return urls;
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const uploadedUrls = await uploadMedia();
      
      // Ensure title is uppercase
      const updatedFormData = {
        ...formData,
        title: formData.title.toUpperCase(),
        image_url: uploadedUrls[0] || formData.image_url,
        media_urls: uploadedUrls.length > 0 ? uploadedUrls : formData.media_urls,
      };
      
      onChange(updatedFormData);
      
      setTimeout(() => onSubmit(e), 100);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement des médias');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* AI Generate Button - Prominent */}
      <Card className="border-2 border-dashed border-secondary/50 bg-secondary/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <p className="font-medium text-sm">🤖 Génération automatique IA</p>
              <p className="text-xs text-muted-foreground">
                Écrivez un texte brut, cliquez sur Générer. L'IA structure et remplit tous les champs automatiquement.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAutoGenerate}
              disabled={isEnhancing || !formData.content.trim()}
              className="btn-gold-gradient gap-2 shrink-0 w-full sm:w-auto"
            >
              {isEnhancing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Générer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre * (sera en MAJUSCULES)</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onChange({ ...formData, title: e.target.value })}
            placeholder="Titre de l'actualité"
            required
            className="font-bold uppercase"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(v) => onChange({ ...formData, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEWS_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu *</Label>
        <p className="text-xs text-muted-foreground mb-2">
          ✍️ Écrivez votre texte brut, puis "Générer" pour le structurer. L'éditeur fonctionne comme un email : gras, italique, couleurs visibles directement.
        </p>
        <RichTextEditor
          content={formData.content}
          onChange={(html) => onChange({ ...formData, content: html })}
          placeholder="Écrivez votre contenu ici... L'IA le structurera automatiquement."
        />
      </div>

      {/* Media Upload */}
      <div className="space-y-2">
        <Label>📷 Images et Vidéos (obligatoire)</Label>
        <Card 
          className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-4 sm:p-6 text-center">
            <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Cliquez pour ajouter des images (max 20Mo) ou vidéos (max 500Mo)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
        
        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                {mediaFiles[index]?.type.startsWith('video/') ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Video className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(index);
                  }}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) => onChange({ ...formData, is_published: checked })}
        />
        <Label htmlFor="is_published">Publier immédiatement</Label>
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button type="submit" className="btn-primary-gradient w-full sm:w-auto" disabled={isPending || uploadingMedia}>
          {(isPending || uploadingMedia) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {uploadingMedia ? 'Téléchargement...' : isEditing ? 'Modifier' : 'Publier'}
        </Button>
      </DialogFooter>
    </form>
  );
}
