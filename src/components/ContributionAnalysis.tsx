import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContributions } from '@/hooks/useContributions';
import { useMembers } from '@/hooks/useMembers';
import { TrendingUp, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function ContributionAnalysis() {
  const { allContributions, stats } = useContributions();
  const { members } = useMembers();
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis('');

    // Prepare data for analysis
    const analysisData = {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'actif').length,
      totalCollected: stats.totalCollected,
      paidCount: stats.paidCount,
      pendingCount: stats.pendingCount,
      lateCount: stats.lateCount,
      recentContributions: allContributions.slice(0, 50).map(c => ({
        status: c.status,
        amount: c.amount,
        type: c.contribution_type,
        month: c.period_month,
        year: c.period_year,
      })),
      membersWithLatePayments: members.filter(m => {
        const memberContribs = allContributions.filter(c => c.member_id === m.id);
        return memberContribs.some(c => c.status === 'en_retard');
      }).length,
    };

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'contribution-analysis',
          messages: [{
            role: 'user',
            content: `Analyse ces données de cotisations de l'ASSOJEREB et fournis:
1. Un résumé de la situation actuelle
2. Les tendances observées
3. Les membres à risque de retard
4. Des recommandations pour améliorer le taux de recouvrement

Données: ${JSON.stringify(analysisData, null, 2)}`
          }],
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('AI request failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
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
              setAnalysis(prev => prev + content);
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('Erreur lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analyse IA des cotisations
            </CardTitle>
            <CardDescription>
              Intelligence artificielle pour prédire les tendances et retards
            </CardDescription>
          </div>
          <Button onClick={runAnalysis} disabled={isAnalyzing} className="btn-primary-gradient">
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyse...' : 'Lancer l\'analyse'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-success">{stats.paidCount}</p>
            <p className="text-xs text-muted-foreground">Payées</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-warning">{stats.pendingCount}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-destructive">{stats.lateCount}</p>
            <p className="text-xs text-muted-foreground">En retard</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{members.length}</p>
            <p className="text-xs text-muted-foreground">Membres</p>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis ? (
          <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Cliquez sur "Lancer l'analyse" pour obtenir des insights IA</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
