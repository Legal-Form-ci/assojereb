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
- Il y a 43 maisons au village réparties entre ces familles
- Les cotisations mensuelles varient selon les catégories de membres
- L'association organise des événements culturels comme le Paquinou

Tu dois répondre en français avec un ton chaleureux et professionnel.`;

const NEWS_AUTO_GENERATE_PROMPT = `Tu es un rédacteur professionnel expert pour l'ASSOJEREB. Tu DOIS générer du contenu COURT, PERCUTANT et PROFESSIONNEL.

🚨 RÈGLES ABSOLUES:

1. DÉTECTE le type automatiquement:
   - "evenement": fêtes, célébrations, rencontres
   - "communique": annonces officielles
   - "deces": avis de décès
   - "mariage": mariages
   - "anniversaire": anniversaires
   - "opportunite": opportunités, partenariats
   - "projet": projets communautaires
   - "general": autres

2. STYLE:
   - Titre en MAJUSCULES, COURT et PERCUTANT (max 10 mots)
   - Phrase d'accroche courte en italique
   - MAXIMUM 150 mots pour le contenu total
   - PAS de biographies longues
   - PAS de textes inutiles ou répétitifs
   - Phrases courtes et directes

3. FORMAT HTML UNIQUEMENT (JAMAIS de markdown **, ##, ###):
   - <h2> pour titre avec emojis
   - <p><em>accroche courte</em></p>
   - <p> pour paragraphes (courts!)
   - <strong> pour gras
   - <ul><li> pour listes
   - PAS de <br> entre les balises de liste
   - PAS de paragraphes vides
   - PAS de double saut de ligne inutile

4. EXEMPLE pour ÉVÉNEMENT:
<h2>🎉 TITRE COURT 🎉</h2>
<p><em>Accroche percutante en une phrase.</em></p>
<p>Description brève (2 phrases max).</p>
<ul>
<li><strong>Point clé 1</strong></li>
<li><strong>Point clé 2</strong></li>
</ul>
<p>📍 <strong>Lieu</strong> : Nom</p>
<p>📅 <strong>Date</strong> : Période</p>
<p>📞 <strong>Contact</strong> : Le Président de l'association</p>

5. EXEMPLE pour DÉCÈS:
<h2>🕊️ AVIS DE DÉCÈS</h2>
<p><em>L'ASSOJEREB annonce avec douleur...</em></p>
<p>Informations essentielles uniquement.</p>

6. INTELLIGENCE: Même avec UN SEUL MOT en entrée, tu dois comprendre le contexte et générer un article complet, structuré et professionnel. Exemples:
   - "paquinou" → Article sur le Paquinou 2026
   - "décès" → Avis de décès type
   - "réunion" → Communiqué de réunion

FORMAT DE RÉPONSE (JSON STRICT):
{
  "title": "TITRE EN MAJUSCULES",
  "category": "evenement|communique|deces|mariage|anniversaire|opportunite|projet|general",
  "content": "<h2>...</h2><p><em>accroche</em></p><p>contenu court</p>"
}`;

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

    // Handle image generation separately (non-streaming)
    if (type === 'generate-news-image') {
      const userMessage = messages[0]?.content || 'Association africaine';
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "user", content: `Génère une image professionnelle et moderne pour illustrer cet article d'une association communautaire africaine ivoirienne: ${userMessage}. Style: professionnel, coloré, africain, communautaire. Format 16:9 paysage.` },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Image generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        // Upload base64 image to storage
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        // Convert base64 to blob
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const fileName = `ai-generated-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('news-media')
          .upload(fileName, bytes, { contentType: 'image/png' });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          return new Response(JSON.stringify({ image_url: imageUrl }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        const { data: publicUrl } = supabaseClient.storage.from('news-media').getPublicUrl(fileName);
        
        return new Response(JSON.stringify({ image_url: publicUrl.publicUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = SYSTEM_PROMPT;
    
    if (type === 'news-auto-generate') {
      systemPrompt = NEWS_AUTO_GENERATE_PROMPT;
    } else if (type === 'news-summary') {
      systemPrompt = `Tu es un rédacteur pour l'ASSOJEREB. Génère un résumé concis (2 phrases) du contenu fourni.`;
    } else if (type === 'news-enhance') {
      systemPrompt = `Tu es un rédacteur pour l'ASSOJEREB. Enrichis le contenu en HTML propre. Utilise <h2>, <h3>, <p>, <strong>, <em>, <ul><li>. JAMAIS de markdown. Contenu CONCIS.`;
    } else if (type === 'chat-with-context') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const [membersResult, familiesResult, housesResult, newsResult, categoriesResult] = await Promise.all([
        supabase.from('members').select('id, first_name, last_name, status, family_id, profession').limit(100),
        supabase.from('families').select('id, name, description').order('display_order'),
        supabase.from('houses').select('id, name, house_number, family_id').order('house_number'),
        supabase.from('news').select('id, title, category, published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(20),
        supabase.from('contribution_categories').select('id, name, monthly_amount').eq('is_active', true),
      ]);

      systemPrompt = SYSTEM_PROMPT + `\n\nDONNÉES EN TEMPS RÉEL:
- ${membersResult.data?.length || 0} membres
- ${familiesResult.data?.length || 0} familles: ${familiesResult.data?.map(f => f.name).join(', ')}
- ${housesResult.data?.length || 0} maisons
- Cotisations: ${categoriesResult.data?.map(c => `${c.name}: ${c.monthly_amount} FCFA`).join(', ')}`;
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
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
