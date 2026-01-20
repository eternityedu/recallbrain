-- Create table to track brand score history over time
CREATE TABLE public.brand_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  recall_score INTEGER DEFAULT 0,
  semantic_clarity_score INTEGER DEFAULT 0,
  intent_alignment_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  explainability_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_score_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own score history
CREATE POLICY "Users can view their own score history"
ON public.brand_score_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own score history
CREATE POLICY "Users can insert their own score history"
ON public.brand_score_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_brand_score_history_brand_id ON public.brand_score_history(brand_id);
CREATE INDEX idx_brand_score_history_created_at ON public.brand_score_history(created_at DESC);