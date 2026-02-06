import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de l'ASSOJEREB (Association des Jeunes Ressortissants de Brongonzué), une association culturelle et communautaire ivoirienne.

Tu connais parfaitement l'association:
- C'est une association des ressortissants de Brongonzué, un village du centre de la Côte d'Ivoire, pays Baoulé
- L'association est organisée en 6 grandes familles: AKPRO, DJOMAN, KOFFI, KOUAME, KOUASSI, N'GUESSAN
- Il y a 42 maisons au village qui sont réparties entre ces familles
- Les cotisations mensuelles varient selon les catégories de membres
- L'association organise des événements culturels comme le Paquinou

Tu dois:
- Répondre aux questions sur l'association, ses activités, ses événements
- Aider les membres à comprendre leurs cotisations et leur statut
- Orienter vers les bonnes personnes ou ressources
- Être amical, professionnel et culturellement sensible
- Répondre en français

Si tu ne connais pas une information spécifique, tu peux suggérer de contacter l'administration de l'association.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = SYSTEM_PROMPT;
    
    // Different prompts for different AI features
    if (type === 'news-summary') {
      systemPrompt = `Tu es un rédacteur professionnel pour l'ASSOJEREB. Tu dois générer des résumés d'actualités clairs et engageants. Résume le contenu fourni en 2-3 phrases percutantes.`;
    } else if (type === 'news-enhance') {
      systemPrompt = `Tu es un rédacteur professionnel pour l'ASSOJEREB. Tu dois enrichir et structurer le contenu fourni de manière professionnelle.
      
Utilise le format Markdown pour:
- **Texte en gras** pour les points importants
- *Italique* pour les emphases
- ## Sous-titres pour organiser le contenu
- Listes à puces si nécessaire
- Paragraphes bien séparés
- Structure claire et professionnelle

Garde le ton amical mais professionnel, adapté à une association communautaire ivoirienne.`;
    } else if (type === 'contribution-analysis') {
      systemPrompt = `Tu es un analyste financier pour l'ASSOJEREB. Tu analyses les tendances de cotisations et prédis les retards potentiels. Fournis des insights clairs et des recommandations actionables.`;
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
          ...messages,
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
