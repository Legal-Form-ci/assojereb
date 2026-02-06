import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useNews, NEWS_CATEGORIES } from '@/hooks/useNews';
import { NewsCard } from '@/components/news/NewsCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Newspaper } from 'lucide-react';

export default function NewsPage() {
  const { news, isLoading } = useNews(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl font-bold">Actualités</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Restez informé des dernières nouvelles, événements et annonces de l'ASSOJEREB
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une actualité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {NEWS_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune actualité trouvée</h3>
            <p className="text-muted-foreground">
              {search || categoryFilter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucune actualité publiée pour le moment'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                id={item.id}
                title={item.title}
                content={item.content}
                category={item.category}
                image_url={item.image_url}
                media_urls={(item as any).media_urls}
                published_at={item.published_at}
              />
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {filteredNews.length} actualité{filteredNews.length > 1 ? 's' : ''} trouvée{filteredNews.length > 1 ? 's' : ''}
        </p>
      </div>
    </AppLayout>
  );
}
