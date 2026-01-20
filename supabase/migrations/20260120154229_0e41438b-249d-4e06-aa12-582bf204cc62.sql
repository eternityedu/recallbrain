-- Add new score component columns to brand_profiles
ALTER TABLE public.brand_profiles
ADD COLUMN IF NOT EXISTS semantic_clarity_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS intent_alignment_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS consistency_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS explainability_score integer DEFAULT 0;