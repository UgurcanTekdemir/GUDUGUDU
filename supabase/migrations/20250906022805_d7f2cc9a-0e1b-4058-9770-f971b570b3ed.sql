-- Comprehensive database schema for sports betting and casino platform

-- User profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    country VARCHAR(2), -- ISO country code
    currency VARCHAR(3) DEFAULT 'TRY', -- ISO currency code
    balance DECIMAL(15,2) DEFAULT 0.00,
    bonus_balance DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User sessions for tracking login/logout
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    logout_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Financial transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bet', 'win', 'bonus', 'refund', 'commission')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    payment_provider VARCHAR(100),
    external_transaction_id VARCHAR(255),
    description TEXT,
    reference_id UUID, -- Can reference betslip, game_round, bonus etc.
    reference_type VARCHAR(50), -- 'betslip', 'game_round', 'bonus', etc.
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sports categories
CREATE TABLE IF NOT EXISTS public.sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sports leagues/competitions
CREATE TABLE IF NOT EXISTS public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    country VARCHAR(2), -- ISO country code
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sports matches/events
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
    home_team VARCHAR(200) NOT NULL,
    away_team VARCHAR(200) NOT NULL,
    home_team_logo TEXT,
    away_team_logo TEXT,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled', 'postponed')),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    external_match_id VARCHAR(255),
    provider VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Betting odds for matches
CREATE TABLE IF NOT EXISTS public.odds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    market_type VARCHAR(50) NOT NULL, -- '1x2', 'over_under', 'handicap', etc.
    market_name VARCHAR(200) NOT NULL,
    selection VARCHAR(100) NOT NULL, -- 'home', 'draw', 'away', 'over', 'under', etc.
    odds_value DECIMAL(8,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Betting slips/coupons
CREATE TABLE IF NOT EXISTS public.betslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    slip_type VARCHAR(20) DEFAULT 'single' CHECK (slip_type IN ('single', 'multiple', 'system')),
    total_stake DECIMAL(15,2) NOT NULL,
    total_odds DECIMAL(8,2) NOT NULL,
    potential_win DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled', 'cashout')),
    settled_at TIMESTAMP WITH TIME ZONE,
    win_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual bets within a betslip
CREATE TABLE IF NOT EXISTS public.betslip_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    betslip_id UUID REFERENCES public.betslips(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    odds_id UUID REFERENCES public.odds(id) ON DELETE CASCADE NOT NULL,
    market_type VARCHAR(50) NOT NULL,
    market_name VARCHAR(200) NOT NULL,
    selection VARCHAR(100) NOT NULL,
    odds_value DECIMAL(8,2) NOT NULL,
    stake DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Game providers (for casino and slots)
CREATE TABLE IF NOT EXISTS public.game_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Games (casino, slots, etc.)
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.game_providers(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('slot', 'live_casino', 'table_game', 'lottery', 'virtual_sport')),
    category VARCHAR(100), -- 'blackjack', 'roulette', 'poker', 'fruit_slots', etc.
    thumbnail_url TEXT,
    description TEXT,
    min_bet DECIMAL(10,2) DEFAULT 0.01,
    max_bet DECIMAL(15,2) DEFAULT 10000.00,
    rtp_percentage DECIMAL(5,2), -- Return to Player percentage
    volatility VARCHAR(20) CHECK (volatility IN ('low', 'medium', 'high')),
    has_demo BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    external_game_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User game sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    balance_start DECIMAL(15,2) NOT NULL,
    balance_end DECIMAL(15,2),
    total_bet DECIMAL(15,2) DEFAULT 0.00,
    total_win DECIMAL(15,2) DEFAULT 0.00,
    rounds_played INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual game rounds/spins
CREATE TABLE IF NOT EXISTS public.game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    round_number INTEGER NOT NULL,
    bet_amount DECIMAL(15,2) NOT NULL,
    win_amount DECIMAL(15,2) DEFAULT 0.00,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    game_result JSONB, -- Store game-specific result data
    external_round_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bonus campaigns
CREATE TABLE IF NOT EXISTS public.bonus_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    bonus_type VARCHAR(50) NOT NULL CHECK (bonus_type IN ('welcome', 'deposit', 'free_spin', 'cashback', 'loyalty', 'tournament')),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('registration', 'deposit', 'manual', 'promotion_code')),
    amount_type VARCHAR(20) NOT NULL CHECK (amount_type IN ('fixed', 'percentage')),
    amount_value DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2),
    min_deposit DECIMAL(15,2),
    wagering_requirement INTEGER DEFAULT 0, -- Multiplier for bonus amount
    valid_days INTEGER DEFAULT 30,
    max_uses_per_user INTEGER DEFAULT 1,
    total_max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    promotion_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User bonuses
CREATE TABLE IF NOT EXISTS public.user_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.bonus_campaigns(id) ON DELETE CASCADE NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    wagering_requirement DECIMAL(15,2) DEFAULT 0.00,
    wagering_completed DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_leagues_sport_id ON public.leagues(sport_id);
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON public.matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_odds_match_id ON public.odds(match_id);
CREATE INDEX IF NOT EXISTS idx_betslips_user_id ON public.betslips(user_id);
CREATE INDEX IF NOT EXISTS idx_betslip_items_betslip_id ON public.betslip_items(betslip_id);
CREATE INDEX IF NOT EXISTS idx_games_provider_id ON public.games(provider_id);
CREATE INDEX IF NOT EXISTS idx_games_type ON public.games(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_session_id ON public.game_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_user_id ON public.user_bonuses(user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_sports_updated_at ON public.sports;
CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON public.sports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_leagues_updated_at ON public.leagues;
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_odds_updated_at ON public.odds;
CREATE TRIGGER update_odds_updated_at BEFORE UPDATE ON public.odds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_betslips_updated_at ON public.betslips;
CREATE TRIGGER update_betslips_updated_at BEFORE UPDATE ON public.betslips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_betslip_items_updated_at ON public.betslip_items;
CREATE TRIGGER update_betslip_items_updated_at BEFORE UPDATE ON public.betslip_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_game_providers_updated_at ON public.game_providers;
CREATE TRIGGER update_game_providers_updated_at BEFORE UPDATE ON public.game_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON public.game_sessions;
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON public.game_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_game_rounds_updated_at ON public.game_rounds;
CREATE TRIGGER update_game_rounds_updated_at BEFORE UPDATE ON public.game_rounds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_bonus_campaigns_updated_at ON public.bonus_campaigns;
CREATE TRIGGER update_bonus_campaigns_updated_at BEFORE UPDATE ON public.bonus_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_bonuses_updated_at ON public.user_bonuses;
CREATE TRIGGER update_user_bonuses_updated_at BEFORE UPDATE ON public.user_bonuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betslip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = auth_user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_user_id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Create RLS policies for user_sessions table
CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can insert their own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can update their own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for transactions table
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for public data (readable by everyone)
CREATE POLICY "Sports are viewable by everyone" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Leagues are viewable by everyone" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Odds are viewable by everyone" ON public.odds FOR SELECT USING (true);
CREATE POLICY "Game providers are viewable by everyone" ON public.game_providers FOR SELECT USING (true);
CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);
CREATE POLICY "Bonus campaigns are viewable by everyone" ON public.bonus_campaigns FOR SELECT USING (true);

-- Create RLS policies for betslips
CREATE POLICY "Users can view their own betslips" ON public.betslips FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own betslips" ON public.betslips FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can update their own betslips" ON public.betslips FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for betslip_items
CREATE POLICY "Users can view their own betslip items" ON public.betslip_items FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users u JOIN public.betslips b ON u.id = b.user_id WHERE b.id = betslip_id));
CREATE POLICY "Users can create their own betslip items" ON public.betslip_items FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users u JOIN public.betslips b ON u.id = b.user_id WHERE b.id = betslip_id));

-- Create RLS policies for game sessions
CREATE POLICY "Users can view their own game sessions" ON public.game_sessions FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own game sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can update their own game sessions" ON public.game_sessions FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for game rounds
CREATE POLICY "Users can view their own game rounds" ON public.game_rounds FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own game rounds" ON public.game_rounds FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for user bonuses
CREATE POLICY "Users can view their own bonuses" ON public.user_bonuses FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own bonuses" ON public.user_bonuses FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Add missing constraints to users table
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE public.users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended', 'banned', 'pending'));
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_kyc_status_check;
ALTER TABLE public.users ADD CONSTRAINT users_kyc_status_check CHECK (kyc_status IN ('pending', 'approved', 'rejected'));

-- Admin system tables
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_type VARCHAR(50) DEFAULT 'admin' CHECK (role_type IN ('super_admin', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Admin permissions
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    is_granted BOOLEAN DEFAULT true,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    granted_by UUID REFERENCES public.admins(id),
    UNIQUE(admin_id, permission_name)
);

-- Admin activities log
CREATE TABLE IF NOT EXISTS public.admin_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications system
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment system tables
CREATE TABLE IF NOT EXISTS public.payment_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('card', 'e_wallet', 'bank_transfer', 'crypto')),
    api_endpoint TEXT,
    supported_currencies TEXT[] DEFAULT ARRAY['TRY'],
    min_amount DECIMAL(15,2) DEFAULT 1.00,
    max_amount DECIMAL(15,2) DEFAULT 100000.00,
    fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.payment_providers(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    provider_reference VARCHAR(255),
    external_transaction_id VARCHAR(255),
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.payment_providers(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    account_details JSONB,
    provider_reference VARCHAR(255),
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin_id ON public.admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_id ON public.admin_activities(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_user_id ON public.notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- Enable RLS for new tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Admins can view themselves" ON public.admins FOR SELECT USING (id = auth.uid());
CREATE POLICY "Super admins can manage all admins" ON public.admins FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin'));

CREATE POLICY "Admins can view their own permissions" ON public.admin_permissions FOR SELECT USING (admin_id = auth.uid());
CREATE POLICY "Super admins can manage all permissions" ON public.admin_permissions FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin'));

CREATE POLICY "Admins can view their own activities" ON public.admin_activities FOR SELECT USING (admin_id = auth.uid());
CREATE POLICY "Super admins can view all activities" ON public.admin_activities FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin'));

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (target_user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Payment providers are viewable by everyone" ON public.payment_providers FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = payments.user_id));
CREATE POLICY "Users can create their own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = payments.user_id));
CREATE POLICY "System can update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = withdrawals.user_id));
CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = withdrawals.user_id));
CREATE POLICY "Admins can manage all withdrawals" ON public.withdrawals FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Add triggers for new tables
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user
INSERT INTO public.admins (email, username, password_hash, first_name, last_name, role_type, is_active) 
VALUES ('superadmin@casino.com', 'superadmin', crypt('admin123', gen_salt('bf')), 'Super', 'Admin', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert default payment providers
INSERT INTO public.payment_providers (name, slug, provider_type, api_endpoint, supported_currencies, min_amount, max_amount) VALUES
('Stripe', 'stripe', 'card', 'https://api.stripe.com', ARRAY['TRY', 'USD', 'EUR'], 1.00, 100000.00),
('PayTR', 'paytr', 'card', 'https://www.paytr.com/odeme/api', ARRAY['TRY'], 1.00, 50000.00),
('Iyzico', 'iyzico', 'card', 'https://api.iyzipay.com', ARRAY['TRY', 'USD', 'EUR'], 1.00, 75000.00),
('Papara', 'papara', 'e_wallet', 'https://merchant-api.papara.com', ARRAY['TRY'], 5.00, 10000.00),
('Bank Transfer', 'bank_transfer', 'bank_transfer', NULL, ARRAY['TRY'], 50.00, 100000.00)
ON CONFLICT (slug) DO NOTHING;