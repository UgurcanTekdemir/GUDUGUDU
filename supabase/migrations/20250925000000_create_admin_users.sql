-- Create admin users for admin panel access
-- This migration creates the necessary admin users for the admin panel

-- First, create admin users in auth.users table
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@gudubet.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Admin", "last_name": "User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
), (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'superadmin@gudubet.com',
    crypt('superadmin123', gen_salt('bf')),
    now(),
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Super", "last_name": "Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- Create corresponding profiles in public.users table
INSERT INTO public.users (
    auth_user_id,
    username,
    email,
    first_name,
    last_name,
    status,
    email_verified,
    phone_verified,
    kyc_status,
    balance,
    bonus_balance
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@gudubet.com'),
    'admin',
    'admin@gudubet.com',
    'Admin',
    'User',
    'active',
    true,
    true,
    'approved',
    0.00,
    0.00
), (
    (SELECT id FROM auth.users WHERE email = 'superadmin@gudubet.com'),
    'superadmin',
    'superadmin@gudubet.com',
    'Super',
    'Admin',
    'active',
    true,
    true,
    'approved',
    0.00,
    0.00
);

-- Create admin records in public.admins table
INSERT INTO public.admins (
    id,
    email,
    password_hash,
    role_type,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@gudubet.com'),
    'admin@gudubet.com',
    crypt('admin123', gen_salt('bf')),
    'admin',
    true,
    now(),
    now()
), (
    (SELECT id FROM auth.users WHERE email = 'superadmin@gudubet.com'),
    'superadmin@gudubet.com',
    crypt('superadmin123', gen_salt('bf')),
    'super_admin',
    true,
    now(),
    now()
);

-- Create some sample data for testing
INSERT INTO public.game_providers (name, slug, is_active) VALUES
('Pragmatic Play', 'pragmatic-play', true),
('Evolution Gaming', 'evolution-gaming', true),
('NetEnt', 'netent', true);

INSERT INTO public.games (provider_id, name, slug, game_type, category, is_active) VALUES
((SELECT id FROM public.game_providers WHERE slug = 'pragmatic-play'), 'Gates of Olympus', 'gates-of-olympus', 'slot', 'video_slot', true),
((SELECT id FROM public.game_providers WHERE slug = 'evolution-gaming'), 'Lightning Roulette', 'lightning-roulette', 'live_casino', 'roulette', true),
((SELECT id FROM public.game_providers WHERE slug = 'netent'), 'Starburst', 'starburst', 'slot', 'video_slot', true);

INSERT INTO public.bonus_campaigns (name, slug, bonus_type, trigger_type, amount_type, amount_value, is_active) VALUES
('Hoşgeldin Bonusu', 'hosgeldin-bonusu', 'welcome', 'registration', 'fixed', 100.00, true),
('Deposit Bonus', 'deposit-bonus', 'deposit', 'deposit', 'percentage', 50.00, true);
