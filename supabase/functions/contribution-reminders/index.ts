import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  family_id: string;
  contribution_category: {
    monthly_amount: number;
    name: string;
  } | null;
}

interface PendingContribution {
  member_id: string;
  amount: number;
  period_month: number;
  period_year: number;
  member: Member;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔔 Starting contribution reminders job...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    console.log(`📅 Processing reminders for ${currentMonth}/${currentYear}`);

    // 1. Get all active members with their contribution category
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        family_id,
        contribution_category:contribution_categories(monthly_amount, name)
      `)
      .eq('status', 'actif');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw membersError;
    }

    console.log(`👥 Found ${members?.length || 0} active members`);

    // 2. Get existing contributions for current month
    const { data: existingContributions, error: contribError } = await supabase
      .from('contributions')
      .select('member_id, status')
      .eq('period_month', currentMonth)
      .eq('period_year', currentYear)
      .eq('contribution_type', 'mensuelle');

    if (contribError) {
      console.error('Error fetching contributions:', contribError);
      throw contribError;
    }

    // Create a map of member_id -> contribution status
    const contributionMap = new Map(
      existingContributions?.map(c => [c.member_id, c.status]) || []
    );

    // 3. Identify members who haven't paid
    const membersNeedingReminder: PendingContribution[] = [];

    for (const member of members || []) {
      const existingStatus = contributionMap.get(member.id);
      
      // If no contribution exists or it's pending/late, add to reminder list
      if (!existingStatus || existingStatus === 'en_attente' || existingStatus === 'en_retard') {
        // Handle contribution_category being an array from the join
        const category = Array.isArray(member.contribution_category) 
          ? member.contribution_category[0] 
          : member.contribution_category;
        const amount = category?.monthly_amount || 0;
        
        if (amount > 0 && (member.email || member.phone)) {
          membersNeedingReminder.push({
            member_id: member.id,
            amount,
            period_month: currentMonth,
            period_year: currentYear,
            member: {
              ...member,
              contribution_category: category || null,
            } as Member,
          });
        }
      }
    }

    console.log(`📨 ${membersNeedingReminder.length} members need reminders`);

    // 4. Queue notifications for each member
    const notificationsToQueue = [];

    for (const pending of membersNeedingReminder) {
      const { member, amount, period_month, period_year } = pending;
      
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      const monthName = monthNames[period_month - 1];

      const body = `Cher(e) ${member.first_name} ${member.last_name},\n\n` +
        `Nous vous rappelons que votre cotisation mensuelle de ${amount.toLocaleString('fr-FR')} FCFA ` +
        `pour le mois de ${monthName} ${period_year} n'a pas encore été enregistrée.\n\n` +
        `Catégorie: ${member.contribution_category?.name || 'Standard'}\n` +
        `Montant: ${amount.toLocaleString('fr-FR')} FCFA\n\n` +
        `Merci de régulariser votre situation dès que possible.\n\n` +
        `L'équipe ASSOJEREB - Association des Jeunes Ressortissants de Brongonzué`;

      // Queue email notification if email exists
      if (member.email) {
        notificationsToQueue.push({
          channel: 'email',
          recipient_email: member.email,
          recipient_member_id: member.id,
          subject: `Rappel: Cotisation ${monthName} ${period_year} - ASSOJEREB`,
          body,
          status: 'pending',
          scheduled_at: new Date().toISOString(),
        });
      }

      // Queue SMS notification if phone exists
      if (member.phone) {
        const smsBody = `ASSOJEREB: Rappel cotisation ${monthName} ${period_year}. ` +
          `Montant: ${amount.toLocaleString('fr-FR')} FCFA. Merci de régulariser.`;
        
        notificationsToQueue.push({
          channel: 'sms',
          recipient_phone: member.phone,
          recipient_member_id: member.id,
          body: smsBody,
          status: 'pending',
          scheduled_at: new Date().toISOString(),
        });
      }
    }

    // 5. Insert notifications into queue
    if (notificationsToQueue.length > 0) {
      const { data: insertedNotifs, error: insertError } = await supabase
        .from('notification_queue')
        .insert(notificationsToQueue)
        .select('id');

      if (insertError) {
        console.error('Error inserting notifications:', insertError);
        throw insertError;
      }

      console.log(`✅ Queued ${insertedNotifs?.length || 0} notifications`);
    }

    // 6. Create/update pending contributions for members without any record
    const contributionsToCreate = membersNeedingReminder
      .filter(p => !contributionMap.has(p.member_id))
      .map(p => ({
        member_id: p.member_id,
        contribution_type: 'mensuelle',
        amount: p.amount,
        period_month: p.period_month,
        period_year: p.period_year,
        status: 'en_attente',
      }));

    if (contributionsToCreate.length > 0) {
      const { error: createContribError } = await supabase
        .from('contributions')
        .insert(contributionsToCreate);

      if (createContribError) {
        console.error('Error creating pending contributions:', createContribError);
      } else {
        console.log(`📝 Created ${contributionsToCreate.length} pending contributions`);
      }
    }

    // 7. Mark overdue contributions (more than 15 days into the month)
    if (now.getDate() > 15) {
      const { error: updateError } = await supabase
        .from('contributions')
        .update({ status: 'en_retard' })
        .eq('period_month', currentMonth)
        .eq('period_year', currentYear)
        .eq('status', 'en_attente');

      if (updateError) {
        console.error('Error updating overdue contributions:', updateError);
      } else {
        console.log('⚠️ Updated pending contributions to overdue status');
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalActiveMembers: members?.length || 0,
        membersNeedingReminder: membersNeedingReminder.length,
        notificationsQueued: notificationsToQueue.length,
        pendingContributionsCreated: contributionsToCreate.length,
      },
    };

    console.log('🎉 Contribution reminders job completed:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in contribution reminders:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
