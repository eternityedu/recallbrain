-- Create notification history table
CREATE TABLE public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  email_sent_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  score_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification history
CREATE POLICY "Users can view their own notification history"
ON public.notification_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own notifications (via edge function with service role)
CREATE POLICY "Users can insert their own notifications"
ON public.notification_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create competitors table
CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_website TEXT,
  competitor_description TEXT,
  estimated_recall_score INTEGER DEFAULT 0,
  estimated_semantic_clarity INTEGER DEFAULT 0,
  estimated_intent_alignment INTEGER DEFAULT 0,
  estimated_authority INTEGER DEFAULT 0,
  estimated_consistency INTEGER DEFAULT 0,
  estimated_explainability INTEGER DEFAULT 0,
  analysis_notes TEXT,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitors
CREATE POLICY "Users can view their own competitors"
ON public.competitors
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competitors"
ON public.competitors
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors"
ON public.competitors
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors"
ON public.competitors
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_competitors_updated_at
BEFORE UPDATE ON public.competitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();