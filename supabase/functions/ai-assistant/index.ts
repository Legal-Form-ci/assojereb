import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel intelligent de l'ASSOJEREB (Association des Jeunes Ressortissants de Brongonzué), une association culturelle et communautaire ivoirienne.

Tu connais parfaitement l'association:
- C'est une association des ressortissants de Brongonzué, un village du centre de la Côte d'Ivoire, pays Baoulé
- L'association est organisée en 6 grandes familles: DJELA OSSOU, ZOKOUAKOU, YAO GNANNI, AHOUMMOI BLE OSSOU, HOUMBOUANOU, TOUA ZAMME
- Il y a 43 maisons au village qui sont réparties entre ces familles
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

const NEWS_AUTO_GENERATE_PROMPT = `Tu es un rédacteur professionnel expert pour l'ASSOJEREB. Tu DOIS générer du contenu structuré et professionnel à partir d'un texte brut.

🚨 RÈGLES ABSOLUES - À RESPECTER IMPÉRATIVEMENT:

1. DÉTECTE AUTOMATIQUEMENT le type de contenu:
   - "evenement" : pour les événements, fêtes, célébrations, rencontres
   - "communique" : pour les communiqués officiels, annonces administratives
   - "deces" : pour les avis de décès
   - "mariage" : pour les annonces de mariage
   - "anniversaire" : pour les anniversaires
   - "opportunite" : pour les opportunités, offres, partenariats
   - "projet" : pour les projets communautaires
   - "general" : pour les autres actualités

2. STYLE PROFESSIONNEL ET CONCIS:
   - Titres COURTS et PERCUTANTS
   - Phrases d'accroche en ITALIQUE
   - PAS de biographies longues
   - PAS de textes inutiles
   - MAXIMUM 200 mots pour le contenu

3. FORMAT HTML OBLIGATOIRE (PAS de markdown, PAS de **, PAS de ###):
   - <h2> pour le titre principal (avec emojis appropriés)
   - <p><em>phrase d'accroche courte</em></p> en italique
   - <p> pour les paragraphes
   - <strong> pour le gras
   - <ul><li> pour les listes
   - <br> pour les sauts de ligne

4. STRUCTURE TYPE POUR ÉVÉNEMENT:
<h2>🎉 TITRE EN MAJUSCULES 🎉</h2>
<p><em>Phrase d'accroche courte et percutante</em></p>
<p>Description brève de l'événement (2-3 phrases max)</p>
<h3>🎤 Points clés</h3>
<ul>
  <li>Point 1</li>
  <li>Point 2</li>
</ul>
<p>📍 <strong>Lieu</strong> : Nom du lieu<br>📅 <strong>Date</strong> : Date prévue</p>
<p>📞 <strong>Contact</strong> : Le Président de l'association</p>

5. STRUCTURE TYPE POUR COMMUNIQUÉ:
<h2>📢 TITRE DU COMMUNIQUÉ</h2>
<p><em>Objet du communiqué</em></p>
<p>Contenu du communiqué...</p>
<p>👉 <strong>Contact</strong> : Le Président</p>

6. STRUCTURE TYPE POUR DÉCÈS:
<h2>🕊️ AVIS DE DÉCÈS</h2>
<p><em>L'ASSOJEREB a la profonde douleur d'annoncer...</em></p>
<p>Informations sur le défunt...</p>

FORMAT DE RÉPONSE (JSON STRICT):
{
  "title": "TITRE EN MAJUSCULES",
  "category": "evenement|communique|deces|mariage|anniversaire|opportunite|projet|general",
  "content": "<h2>...</h2><p><em>accroche</em></p>..."
}

⚠️ Le titre doit TOUJOURS être en MAJUSCULES dans le JSON.
⚠️ Génère UNIQUEMENT du HTML propre, JAMAIS de markdown.`;

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
      systemPrompt = `Tu es un rédacteur professionnel pour l'ASSOJEREB. Génère un résumé concis (2-3 phrases) et accrocheur du contenu fourni. Utilise un style professionnel.`;
    } else if (type === 'news-enhance') {
      systemPrompt = `Tu es un rédacteur professionnel pour l'ASSOJEREB. Enrichis et structure le contenu fourni en HTML professionnel.
      
RÈGLES:
- Utilise <h2> pour les titres principaux (EN MAJUSCULES)
- Utilise <h3> pour les sous-titres
- Utilise <p> pour les paragraphes
- Utilise <strong> pour le gras
- Utilise <em> pour l'italique (phrases d'accroche)
- Utilise <ul><li> pour les listes
- Ajoute des emojis pertinents

IMPORTANT: Génère du HTML propre, PAS de markdown (pas de ** ou ##).
Le contenu doit être CONCIS et PROFESSIONNEL.`;
    } else if (type === 'contribution-analysis') {
      systemPrompt = `Tu es un analyste financier pour l'ASSOJEREB. Analyse les tendances de cotisations et prédis les retards potentiels. Fournis des insights clairs et des recommandations actionables.`;
    } else if (type === 'chat-with-context') {
      // For the chatbot, we can enrich with database context
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Fetch comprehensive context data
      const [membersResult, familiesResult, housesResult, newsResult, contributionsResult, categoriesResult] = await Promise.all([
        supabase.from('members').select('id, first_name, last_name, status, family_id, profession').limit(100),
        supabase.from('families').select('id, name, description').order('display_order'),
        supabase.from('houses').select('id, name, house_number, family_id').order('house_number'),
        supabase.from('news').select('id, title, category, published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(20),
        supabase.from('contributions').select('id, amount, status, period_month, period_year, contribution_type').order('created_at', { ascending: false }).limit(50),
        supabase.from('contribution_categories').select('id, name, monthly_amount').eq('is_active', true),
      ]);

      const contextData = `
DONNÉES EN TEMPS RÉEL DE L'ASSOCIATION:

📊 STATISTIQUES:
- Nombre total de membres: ${membersResult.data?.length || 0}
- Nombre de familles: ${familiesResult.data?.length || 0}
- Nombre de maisons: ${housesResult.data?.length || 0}

👨‍👩‍👧‍👦 LES 6 GRANDES FAMILLES:
${familiesResult.data?.map(f => `- ${f.name}: ${f.description || 'Famille du village'}`).join('\n') || 'Non disponible'}

🏠 MAISONS (${housesResult.data?.length || 0} au total):
Les maisons sont numérotées de 1 à ${housesResult.data?.length || 43}.

📰 DERNIÈRES ACTUALITÉS:
${newsResult.data?.map(n => `- ${n.title} (${n.category})`).join('\n') || 'Aucune actualité récente'}

💰 COTISATIONS RÉCENTES: ${contributionsResult.data?.length || 0} enregistrements

📋 GRILLE DES COTISATIONS:
${categoriesResult.data?.map(c => `- ${c.name}: ${c.monthly_amount} FCFA/mois`).join('\n') || 'Non disponible'}
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
