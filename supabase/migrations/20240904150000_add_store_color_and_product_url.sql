-- Add color column to stores table
ALTER TABLE public.stores 
ADD COLUMN color text DEFAULT '#3b82f6';

-- Add product_url column to products table
ALTER TABLE public.products 
ADD COLUMN product_url text;

-- Update existing stores with specific colors
UPDATE public.stores 
SET color = 
  CASE 
    WHEN LOWER(name) = 'pricesmart' THEN '#182958'
    WHEN LOWER(name) = 'sirena' THEN '#ffe64c'
    WHEN LOWER(name) = 'jumbo' THEN '#ef3e42'
    WHEN LOWER(name) = 'el nacional' THEN '#497637'
    WHEN LOWER(name) = 'amazon' THEN '#FF9900'
    ELSE color -- Keep existing color if already set
  END
WHERE color IS NULL;

-- Create a function to generate a consistent color from a string
CREATE OR REPLACE FUNCTION public.generate_color_from_text(text) 
RETURNS text AS $$
DECLARE
  hash integer := 0;
  i integer := 0;
  color text;
  colors text[] := ARRAY[
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', 
    '#D4A5A5', '#9B786F', '#E8B4B8', '#D1D1D1', '#A5D8FF',
    '#C8E7F5', '#D4B8D4', '#F8D7DA', '#FFF3CD', '#D1E7DD'
  ];
BEGIN
  -- Generate a consistent hash from the text
  FOR i IN 1..length($1) LOOP
    hash := (hash * 31 + ascii(substring($1 from i for 1)))::integer;
  END LOOP;
  
  -- Use absolute value and modulo to get an index within the array bounds
  hash := abs(hash) % array_length(colors, 1) + 1;
  
  -- Return the color at the calculated index
  RETURN colors[hash];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update any remaining null colors with generated colors
UPDATE public.stores 
SET color = public.generate_color_from_text(name)
WHERE color IS NULL;
