-- Add image_url field to bonuses_new table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bonuses_new' AND table_schema = 'public') THEN
        ALTER TABLE public.bonuses_new ADD COLUMN IF NOT EXISTS image_url TEXT;
        COMMENT ON COLUMN public.bonuses_new.image_url IS 'Bonus resmi URL''si';
    END IF;
END $$;
