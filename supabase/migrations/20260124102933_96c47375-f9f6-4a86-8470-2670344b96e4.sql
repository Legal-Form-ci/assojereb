-- Create notification_templates table for storing email/SMS templates
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_queue table for scheduled notifications
CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.notification_templates(id),
  recipient_member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_settings table for user preferences
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_templates (admin only)
CREATE POLICY "Admins can manage notification templates"
  ON public.notification_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for notification_queue (admin can view all, users can view their own)
CREATE POLICY "Admins can manage notification queue"
  ON public.notification_queue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their own notifications"
  ON public.notification_queue
  FOR SELECT
  USING (
    recipient_member_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS policies for notification_settings (users can manage their own)
CREATE POLICY "Users can manage their notification settings"
  ON public.notification_settings
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, body, variables) VALUES
  ('contribution_reminder', 'email', 'Rappel de cotisation - ASSOJEREB', 
   'Cher(e) {{member_name}},\n\nNous vous rappelons que votre cotisation de {{amount}} FCFA pour le mois de {{month}} {{year}} est en attente.\n\nMerci de procéder au paiement dans les plus brefs délais.\n\nCordialement,\nL''équipe ASSOJEREB',
   '["member_name", "amount", "month", "year"]'::jsonb),
  
  ('contribution_overdue', 'email', 'Cotisation en retard - ASSOJEREB',
   'Cher(e) {{member_name}},\n\nVotre cotisation de {{amount}} FCFA pour le mois de {{month}} {{year}} est en retard.\n\nNous vous prions de régulariser votre situation.\n\nCordialement,\nL''équipe ASSOJEREB',
   '["member_name", "amount", "month", "year"]'::jsonb),
  
  ('contribution_received', 'email', 'Confirmation de paiement - ASSOJEREB',
   'Cher(e) {{member_name}},\n\nNous avons bien reçu votre paiement de {{amount}} FCFA.\n\nMerci pour votre contribution.\n\nCordialement,\nL''équipe ASSOJEREB',
   '["member_name", "amount"]'::jsonb),
  
  ('welcome_member', 'email', 'Bienvenue à ASSOJEREB',
   'Cher(e) {{member_name}},\n\nBienvenue au sein de l''association ASSOJEREB !\n\nVotre numéro de membre est : {{member_number}}\n\nVotre mot de passe temporaire est : {{password}}\n\nVeuillez le changer lors de votre première connexion.\n\nCordialement,\nL''équipe ASSOJEREB',
   '["member_name", "member_number", "password"]'::jsonb),

  ('contribution_reminder_sms', 'sms', NULL,
   'ASSOJEREB: Rappel - Votre cotisation de {{amount}} FCFA pour {{month}} est en attente. Merci de régulariser.',
   '["amount", "month"]'::jsonb),
  
  ('exceptional_contribution', 'email', 'Cotisation exceptionnelle - ASSOJEREB',
   'Cher(e) {{member_name}},\n\nUne cotisation exceptionnelle a été créée :\n\n{{title}}\nMontant : {{amount}} FCFA\nDate limite : {{due_date}}\n\n{{description}}\n\nCordialement,\nL''équipe ASSOJEREB',
   '["member_name", "title", "amount", "due_date", "description"]'::jsonb);

-- Create indexes for performance
CREATE INDEX idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled ON public.notification_queue(scheduled_at);
CREATE INDEX idx_notification_queue_recipient ON public.notification_queue(recipient_member_id);