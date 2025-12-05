-- Create popular_searches table for trending search terms
CREATE TABLE public.popular_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL UNIQUE,
  total_count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.popular_searches ENABLE ROW LEVEL SECURITY;

-- Anyone can read popular searches (for the app)
CREATE POLICY "Anyone can read popular searches" 
ON public.popular_searches 
FOR SELECT 
USING (true);

-- Admins can manage popular searches
CREATE POLICY "Admins can manage popular searches" 
ON public.popular_searches 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role IN ('admin', 'super_admin')
));

-- Create index for faster ordering
CREATE INDEX idx_popular_searches_total_count ON public.popular_searches(total_count DESC);

-- Trigger for updated_at
CREATE TRIGGER update_popular_searches_updated_at
BEFORE UPDATE ON public.popular_searches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();