import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel intelligent de l'ASSOJEREB (Association des Jeunes Ressortissants de Brongonzué), une association culturelle et communautaire ivoirienne.

Tu connais parfaitement l'association:
- C'est une association des ressortissants de Brongonzué, un village du centre de la Côte d'Ivoire, pays Baoulé
- L'association est organisée en 6 grandes familles: AKPRO, DJOMAN, KOFFI, KOUAME, KOUASSI, N'GUESSAN
- Il y a 42 maisons au village qui sont réparties entre ces familles
- Les cotisations mensuelles varient selon les catégories de membres
- L'association organise des événements culturels comme le Paquinou

CAPACITÉS AVANCÉES:
- Tu peux rechercher dans la base de données pour trouver des informations sur les membres, cotisations, événements
- Tu analyses les données en temps réel pour donner des réponses précises
- Tu peux expliquer les règles de l'association, les procédures d'adhésion
- Tu comprends le contexte culturel Baoulé et ivoirien

Tu dois:
- Répondre aux questions sur l'association, ses activités, ses événements
- Aider les membres à comprendre leurs cotisations et leur statut
- Orienter vers les bonnes personnes ou ressources
- Être amical, professionnel et culturellement sensible
- Répondre en français avec un ton chaleureux
- Donner des réponses précises et contextualisées`;

const NEWS_AUTO_GENERATE_PROMPT = `Tu es un rédacteur professionnel expert pour l'ASSOJEREB. Tu dois générer du contenu structuré et professionnel à partir d'un texte brut.

RÈGLES IMPORTANTES:
1. DÉTECTE automatiquement le type de contenu (événement, communiqué, décès, mariage, naissance, annonce générale)
2. STRUCTURE le contenu de manière appropriée selon le type détecté
3. Utilise un STYLE CONCIS et IMPACTANT - pas de textes longs et inutiles
4. Pour les ÉVÉNEMENTS: mets en avant la date, le lieu, les invités de manière percutante

FORMAT DE RÉPONSE (JSON):
{
  "title": "Titre accrocheur et pertinent",
  "category": "evenement|communique|deces|naissance|mariage|general",
  "content": "<p>Contenu HTML structuré avec paragraphes, listes, titres...</p>"
}

EXEMPLES DE STYLE ATTENDU:

Pour un ÉVÉNEMENT:
<h2>🎉 PAQUINOU 2026 À BRONGONZUÉ 🎉</h2>
<p><strong>✨ Les plus grands artistes Baoulé réunis !</strong></p>
<p>L'ASSOJEREB annonce la grande édition du PAQUINOU 2026, à l'occasion des fêtes de Pâques 2026, au village de Brongonzué.</p>
<p>Un événement culturel majeur qui réunira les grandes voix de la musique tradi-moderne baoulé.</p>
<h3>🎤 Artistes invités</h3>
<ul>
  <li>Adeba Konan</li>
  <li>N'Guess Bon Sens</li>
  <li>Sidonie la Tigresse</li>
</ul>
<p>📍 <strong>Lieu</strong> : Brongonzué<br>📅 <strong>Date</strong> : Pâques 2026</p>
<p>👉 Plus d'informations très bientôt.</p>

Pour un COMMUNIQUÉ:
<h2>📢 Communiqué officiel</h2>
<p>Le bureau exécutif de l'ASSOJEREB informe...</p>

Pour un DÉCÈS:
<h2>🕊️ Avis de décès</h2>
<p>C'est avec une profonde tristesse que l'ASSOJEREB annonce le rappel à Dieu de...</p>

IMPORTANT: Génère du HTML propre, pas de markdown. Utilise <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = SYSTEM_PROMPT;
    let enrichedMessages = messages;
    
    // Different prompts for different AI features
    if (type === 'news-auto-generate') {
      systemPrompt = NEWS_AUTO_GENERATE_PROMPT;
    } else if (type === 'news-summary') {
      systemPrompt = `Tu es un rédacteur professionnel pour l'ASSOJEREB. Génère un résumé concis (2-3 phrases) et accrocheur du contenu fourni.`;
    } else if (type === 'news-enhance') {
      systemPrompt = `Tu es un rédacteur professionnel pour l'ASSOJEREB. Enrichis et structure le contenu fourni en HTML professionnel.
      
Utilise:
- <h2> pour les titres principaux
- <h3> pour les sous-titres
- <p> pour les paragraphes
- <strong> pour le gras
- <em> pour l'italique
- <ul><li> pour les listes
- Des emojis pertinents pour rendre le contenu vivant

IMPORTANT: Génère du HTML propre, PAS de markdown (pas de ** ou ##).`;
    } else if (type === 'contribution-analysis') {
      systemPrompt = `Tu es un analyste financier pour l'ASSOJEREB. Analyse les tendances de cotisations et prédis les retards potentiels. Fournis des insights clairs et des recommandations actionables.`;
    } else if (type === 'chat-with-context') {
      // For the chatbot, we can enrich with database context
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Fetch some context data
      const [membersResult, newsResult, contributionsResult] = await Promise.all([
        supabase.from('members').select('id, first_name, last_name, status').limit(50),
        supabase.from('news').select('id, title, category, published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(10),
        supabase.from('contributions').select('id, amount, status, period_month, period_year').order('created_at', { ascending: false }).limit(20),
      ]);

      const contextData = `
DONNÉES EN TEMPS RÉEL:
- Nombre de membres: ${membersResult.data?.length || 0}
- Dernières actualités: ${newsResult.data?.map(n => n.title).join(', ') || 'Aucune'}
- Cotisations récentes: ${contributionsResult.data?.length || 0} enregistrements
`;
      
      systemPrompt = SYSTEM_PROMPT + '\n\n' + contextData;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...enrichedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
