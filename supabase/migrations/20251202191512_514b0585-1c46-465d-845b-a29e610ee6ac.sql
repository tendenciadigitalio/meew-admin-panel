-- Add SELECT policy for categories (currently missing)
CREATE POLICY "Anyone can read categories" 
ON public.categories 
FOR SELECT 
USING (true);