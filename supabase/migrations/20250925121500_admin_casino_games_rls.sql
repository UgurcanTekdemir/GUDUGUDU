-- Enable RLS and admin update policy for casino_games

-- Ensure RLS is enabled on casino_games
ALTER TABLE public.casino_games ENABLE ROW LEVEL SECURITY;

-- Read access for everyone (public site needs to list games)
DROP POLICY IF EXISTS "Casino games are viewable by everyone" ON public.casino_games;
CREATE POLICY "Casino games are viewable by everyone" ON public.casino_games
FOR SELECT USING (true);

-- Allow authenticated admins (by email match in admins table) to update games
DROP POLICY IF EXISTS "Admins can update casino games" ON public.casino_games;
CREATE POLICY "Admins can update casino games" ON public.casino_games
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM public.admins a
    WHERE a.email = (auth.jwt() ->> 'email')
      AND a.is_active = true
  )
);

-- Optionally, restrict inserts/deletes unless explicitly needed (left disabled by omission)

