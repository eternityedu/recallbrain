-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create brand_profiles table
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  category TEXT,
  target_audience TEXT,
  keywords TEXT,
  value_proposition TEXT,
  trust_signals TEXT,
  ai_summary TEXT,
  ai_recommendation_triggers TEXT,
  ai_example_snippets TEXT,
  recall_score INTEGER DEFAULT 0,
  relevance_score INTEGER DEFAULT 0,
  clarity_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  is_optimized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing table (admin controlled)
CREATE TABLE public.pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for user-admin communication
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get admin user id
CREATE OR REPLACE FUNCTION public.get_admin_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1
$$;

-- Function to check if user is the first user (will be admin)
CREATE OR REPLACE FUNCTION public.is_first_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Brand profiles policies
CREATE POLICY "Users can view their own brand profiles"
ON public.brand_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profiles"
ON public.brand_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profiles"
ON public.brand_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand profiles"
ON public.brand_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Pricing policies (everyone can view, only admins can modify)
CREATE POLICY "Everyone can view active pricing"
ON public.pricing FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admins can insert pricing"
ON public.pricing FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pricing"
ON public.pricing FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pricing"
ON public.pricing FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Chat messages policies
CREATE POLICY "Users can view their own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages read status"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at
BEFORE UPDATE ON public.brand_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at
BEFORE UPDATE ON public.pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Insert default pricing plans
INSERT INTO public.pricing (plan_name, price, features, is_active) VALUES
('Starter', 0, ARRAY['1 Brand Profile', 'Basic AI Optimization', 'Recall Score'], TRUE),
('Pro', 49.00, ARRAY['5 Brand Profiles', 'Advanced AI Optimization', 'Priority Support', 'Detailed Analytics'], TRUE),
('Enterprise', 199.00, ARRAY['Unlimited Brand Profiles', 'Custom AI Training', 'Dedicated Support', 'API Access', 'White Label'], TRUE);