import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useNews } from '@/hooks/useNews';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NEWS_CATEGORIES } from '@/hooks/useNews';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { news, isLoading } = useNews(true);
  
  const article = news.find(n => n.id === id);
  const categoryInfo = article ? NEWS_CATEGORIES.find(c => c.value === article.category) : null;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Article non trouvé</h2>
          <Button onClick={() => navigate('/actualites')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux actualités
          </Button>
        </div>
      </AppLayout>
    );
  }

  const mediaUrls = (article as any).media_urls || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <article className="space-y-6">
          {/* Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className={`${categoryInfo?.color || 'bg-primary'} text-white border-0 px-3 py-1`}>
                {categoryInfo?.label || article.category}
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.published_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </div>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
              {article.title}
            </h1>
          </header>

          {/* Featured Image */}
          {article.image_url && (
            <div className="relative aspect-video rounded-xl overflow-hidden border-4 border-l-secondary border-b-secondary border-r-primary border-t-primary">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <Card className="border-l-4 border-b-4 border-l-secondary border-b-secondary border-r-4 border-t-4 border-r-primary border-t-primary">
            <CardContent className="p-6 md:p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {article.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Media Gallery */}
          {mediaUrls.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold">Galerie média</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaUrls.map((url: string, index: number) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
                    {url.includes('.mp4') || url.includes('.webm') ? (
                      <video src={url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                navigator.share?.({
                  title: article.title,
                  url: window.location.href,
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                });
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
