-- Add property_type, bedrooms, bathrooms, and max_guests to properties table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'property_type') THEN
        ALTER TABLE public.properties ADD COLUMN property_type text CHECK (property_type IN ('Hotel', 'Villa', 'Apartment')) DEFAULT 'Hotel';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bedrooms') THEN
        ALTER TABLE public.properties ADD COLUMN bedrooms integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') THEN
        ALTER TABLE public.properties ADD COLUMN bathrooms integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'max_guests') THEN
        ALTER TABLE public.properties ADD COLUMN max_guests integer DEFAULT 0;
    END IF;
END $$;
