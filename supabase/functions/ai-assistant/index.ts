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

const NEWS_AUTO_GENERATE_PROMPT = `Tu es un rédacteur professionnel de niveau premium pour l'ASSOJEREB, expert en communication sociale et communautaire.

🧠 INTELLIGENCE CONTEXTUELLE:
Tu dois être capable de comprendre et développer un contenu complet à partir de N'IMPORTE QUELLE entrée, même:
- Un seul mot: "paquinou" → Article complet sur le Paquinou
- Une émotion: "fier" → Publication inspirationnelle
- Une phrase brève: "réunion réussie" → Compte-rendu engageant
- Une idée: "partenariat" → Annonce de partenariat professionnelle

🎯 DÉTECTION AUTOMATIQUE DU TYPE:
- "evenement": fêtes, célébrations, rencontres, forums
- "communique": annonces officielles, réunions
- "deces": avis de décès (ton sobre et respectueux)
- "mariage": mariages et unions
- "anniversaire": anniversaires
- "opportunite": opportunités, partenariats, emploi
- "projet": projets communautaires
- "general": autres

📝 STYLE RÉSEAU SOCIAL PROFESSIONNEL:
- Ton humain, direct, authentique — JAMAIS robotique
- Phrases courtes à moyennes, rythmées
- Sauts de ligne réguliers pour la lisibilité mobile
- Émojis utilisés avec parcimonie (2-4 max par publication)
- Phrase d'accroche percutante en première ligne
- MAXIMUM 200 mots pour le contenu total
- PAS de texte générique reconnaissable comme IA
- PAS de superlatifs excessifs ni formules creuses

📋 FORMAT HTML STRICT (JAMAIS de markdown **, ##, ###):
- <h2> pour titre principal avec 1-2 emojis
- <p><em>phrase d'accroche courte</em></p>
- <p> pour paragraphes (courts, 2-3 phrases max!)
- <strong> pour mettre en valeur les mots-clés
- <ul><li> pour listes (max 4 points)
- PAS de <br> entre les balises
- PAS de paragraphes vides <p></p>
- PAS de double saut de ligne

🚨 RÈGLES ABSOLUES:
1. Titre en MAJUSCULES, COURT et PERCUTANT (max 8 mots)
2. Accroche en italique, une seule phrase
3. Contenu structuré, aéré, concis
4. Si pertinent: lieu, date, contact en fin
5. Hashtags pertinents en fin (3-5 max dans un <p>)

FORMAT DE RÉPONSE (JSON STRICT):
{
  "title": "TITRE EN MAJUSCULES",
  "category": "evenement|communique|deces|mariage|anniversaire|opportunite|projet|general",
  "content": "<h2>🎯 TITRE</h2><p><em>accroche</em></p><p>contenu</p>"
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

    // Handle image generation (non-streaming)
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
            { role: "user", content: `Génère une image ultra-réaliste, professionnelle et moderne pour illustrer cette publication d'une association communautaire africaine ivoirienne: ${userMessage}. Style: photo-réaliste, haute qualité, couleurs vibrantes, composition professionnelle. Format 16:9 paysage. Sans texte, sans watermark, sans logo.` },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Image generation failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const fileName = `ai-generated-${Date.now()}.png`;
        const { error: uploadError } = await supabaseClient.storage
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
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      const sb = createClient(supabaseUrl, supabaseKey);
      
      const [membersResult, familiesResult, housesResult, newsResult, categoriesResult] = await Promise.all([
        sb.from('members').select('id, first_name, last_name, status, family_id, profession').limit(100),
        sb.from('families').select('id, name, description').order('display_order'),
        sb.from('houses').select('id, name, house_number, family_id').order('house_number'),
        sb.from('news').select('id, title, category, published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(20),
        sb.from('contribution_categories').select('id, name, monthly_amount').eq('is_active', true),
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
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }), {
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
