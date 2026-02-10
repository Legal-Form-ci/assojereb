import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNewsBySlug, NEWS_CATEGORIES } from '@/hooks/useNews';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Footer } from '@/components/Footer';
import logoAssojereb from '@/assets/logo-assojereb.png';
import { useEffect } from 'react';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading } = useNewsBySlug(id);
  
  const categoryInfo = article ? NEWS_CATEGORIES.find(c => c.value === article.category) : null;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Article non trouvé</h2>
          <Button onClick={() => navigate('/actualites')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux actualités
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const mediaUrls = Array.isArray(article.media_urls) ? article.media_urls as string[] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 lg:py-12">
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
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight uppercase">
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

            {/* Content - Render HTML directly, NOT markdown */}
            <Card className="border-l-4 border-b-4 border-l-secondary border-b-secondary border-r-4 border-t-4 border-r-primary border-t-primary">
              <CardContent className="p-6 md:p-8">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:uppercase prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-bold prose-em:text-secondary prose-em:text-sm prose-ul:list-disc prose-ol:list-decimal prose-li:text-foreground prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-table:border prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>

            {/* Media Gallery */}
            {mediaUrls.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold">Galerie média</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaUrls.map((url: string, index: number) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
                      {typeof url === 'string' && (url.includes('.mp4') || url.includes('.webm')) ? (
                        <video src={url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={url as string} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
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
                  const shareUrl = article.slug 
                    ? `${window.location.origin}/actualites/${article.slug}`
                    : window.location.href;
                    
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      url: shareUrl,
                    }).catch(() => {
                      navigator.clipboard.writeText(shareUrl);
                    });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Partager
              </Button>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-3 lg:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 lg:gap-3">
          <img 
            src={logoAssojereb} 
            alt="Logo ASSOJEREB" 
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
          />
          <span className="font-serif text-lg lg:text-xl font-bold text-primary">ASSOJEREB</span>
        </Link>
        
        <nav className="flex items-center gap-2 lg:gap-4">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/actualites">Actualités</Link>
          </Button>
          <Button asChild size="sm" className="btn-primary-gradient">
            <Link to="/auth">Espace membre</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
