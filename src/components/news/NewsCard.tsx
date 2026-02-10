import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NEWS_CATEGORIES } from '@/hooks/useNews';

interface NewsCardProps {
  id: string;
  slug?: string | null;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  media_urls?: string[];
  published_at: string;
}

export function NewsCard({ id, slug, title, content, category, image_url, media_urls, published_at }: NewsCardProps) {
  const categoryInfo = NEWS_CATEGORIES.find(c => c.value === category);
  
  const displayImage = (media_urls && media_urls.length > 0) 
    ? media_urls[0] 
    : image_url;

  // Strip HTML tags for preview text
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <Link to={`/actualites/${slug || id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-b-4 border-l-secondary border-b-secondary border-r-4 border-t-4 border-r-primary border-t-primary bg-card h-full">
        {displayImage ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={displayImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <Newspaper className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge className={`${categoryInfo?.color || 'bg-primary'} text-white border-0`}>
              {categoryInfo?.label || category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(published_at), 'dd MMM yyyy', { locale: fr })}
            </div>
          </div>
          <h3 className="font-serif text-base font-bold line-clamp-2 group-hover:text-primary transition-colors uppercase">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 italic">
            {stripHtml(content).substring(0, 150)}...
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
