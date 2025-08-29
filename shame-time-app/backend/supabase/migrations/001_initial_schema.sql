-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores user profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    privacy_level TEXT CHECK (privacy_level IN ('friends_only', 'private')) DEFAULT 'friends_only',
    -- Additional user preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true
);

-- Groups table - stores information about each group
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    privacy_level TEXT CHECK (privacy_level IN ('full_access', 'limited_access')) DEFAULT 'full_access',
    shame_pool_enabled BOOLEAN DEFAULT false,
    shame_pool_amount DECIMAL(10,2) DEFAULT 0.00,
    current_competition_period_start DATE DEFAULT CURRENT_DATE,
    competition_period_duration_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT NULL,
    join_code VARCHAR(20) UNIQUE NOT NULL
);

-- Group members table - join table for users and groups
CREATE TABLE group_members (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (user_id, group_id)
);

-- Daily app usage table - stores daily breakdown of user's app usage
CREATE TABLE daily_app_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    app_bundle_id VARCHAR(255), -- For more precise app identification
    time_minutes INTEGER NOT NULL CHECK (time_minutes >= 0),
    category TEXT CHECK (category IN ('bad', 'neutral', 'good')) NOT NULL,
    is_hidden BOOLEAN DEFAULT false, -- For user privacy settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, app_bundle_id)
);

-- Breaches table - stores log of time limit violations
CREATE TABLE breaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    breach_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    app_or_genre VARCHAR(255) NOT NULL,
    time_limit_minutes INTEGER NOT NULL,
    actual_time_minutes INTEGER NOT NULL,
    penalty_applied INTEGER NOT NULL DEFAULT 1, -- Exponential penalty value
    breach_number INTEGER NOT NULL DEFAULT 1, -- Which breach in sequence (1st, 2nd, 3rd...)
    competition_period_start DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table - stores payment records for Shame Pool
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')) DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),
    payment_type TEXT CHECK (payment_type IN ('entry_fee', 'penalty', 'payout')) DEFAULT 'entry_fee',
    competition_period_start DATE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App categories configuration table - for managing good/bad/neutral apps
CREATE TABLE app_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name VARCHAR(255) NOT NULL,
    app_bundle_id VARCHAR(255) UNIQUE,
    category TEXT CHECK (category IN ('bad', 'neutral', 'good')) NOT NULL,
    default_time_limit_minutes INTEGER, -- Default time limits for the app
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend relationships table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- Create indexes for better performance
CREATE INDEX idx_daily_app_usage_user_date ON daily_app_usage(user_id, date);
CREATE INDEX idx_daily_app_usage_date ON daily_app_usage(date);
CREATE INDEX idx_breaches_user_id ON breaches(user_id);
CREATE INDEX idx_breaches_group_period ON breaches(group_id, competition_period_start);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_payments_user_group ON payments(user_id, group_id);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_categories_updated_at BEFORE UPDATE ON app_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();