-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_app_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can view profiles of friends and group members
CREATE POLICY "Users can view friends profiles" ON users FOR SELECT USING (
    id IN (
        SELECT addressee_id FROM friendships 
        WHERE requester_id = auth.uid() AND status = 'accepted'
        UNION
        SELECT requester_id FROM friendships 
        WHERE addressee_id = auth.uid() AND status = 'accepted'
    )
    OR 
    id IN (
        SELECT gm.user_id FROM group_members gm
        WHERE gm.group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid() AND is_active = true
        ) AND gm.is_active = true
    )
);

-- Groups table policies
-- Group members can view groups they belong to
CREATE POLICY "Members can view their groups" ON groups FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND is_active = true)
);

-- Group admins can update their groups
CREATE POLICY "Admins can update their groups" ON groups FOR UPDATE USING (admin_id = auth.uid());

-- Users can create new groups (they become admin)
CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (admin_id = auth.uid());

-- Group members table policies
-- Users can view group memberships for groups they're in
CREATE POLICY "Users can view group memberships" ON group_members FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND is_active = true)
);

-- Users can insert themselves into groups (joining)
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own group membership (leave group)
CREATE POLICY "Users can update own membership" ON group_members FOR UPDATE USING (user_id = auth.uid());

-- Group admins can manage group memberships
CREATE POLICY "Admins can manage group memberships" ON group_members FOR ALL USING (
    group_id IN (SELECT id FROM groups WHERE admin_id = auth.uid())
);

-- Daily app usage table policies
-- Users can manage their own app usage data
CREATE POLICY "Users can manage own app usage" ON daily_app_usage FOR ALL USING (user_id = auth.uid());

-- Group members can view app usage of other members (based on privacy settings)
CREATE POLICY "Group members can view others app usage" ON daily_app_usage FOR SELECT USING (
    user_id IN (
        SELECT gm.user_id FROM group_members gm
        INNER JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid() AND is_active = true
        ) 
        AND gm.is_active = true
        AND u.privacy_level = 'friends_only'
    )
);

-- Breaches table policies
-- Users can view their own breaches
CREATE POLICY "Users can view own breaches" ON breaches FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own breaches
CREATE POLICY "Users can insert own breaches" ON breaches FOR INSERT WITH CHECK (user_id = auth.uid());

-- Group members can view breaches of other members in their groups
CREATE POLICY "Group members can view others breaches" ON breaches FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND is_active = true)
);

-- Payments table policies
-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own payments
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (user_id = auth.uid());

-- Group admins can view all payments in their groups
CREATE POLICY "Group admins can view group payments" ON payments FOR SELECT USING (
    group_id IN (SELECT id FROM groups WHERE admin_id = auth.uid())
);

-- App categories table policies (read-only for users, managed by system)
CREATE POLICY "Users can view app categories" ON app_categories FOR SELECT TO authenticated USING (true);

-- Friendships table policies
-- Users can view friendships involving them
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
);

-- Users can create friend requests
CREATE POLICY "Users can send friend requests" ON friendships FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Users can update friendships involving them (accept/decline)
CREATE POLICY "Users can manage own friendships" ON friendships FOR UPDATE USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
);

-- Function to generate unique group join codes
CREATE OR REPLACE FUNCTION generate_group_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set join code on group creation
CREATE OR REPLACE FUNCTION set_group_join_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
        NEW.join_code := generate_group_join_code();
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM groups WHERE join_code = NEW.join_code) LOOP
            NEW.join_code := generate_group_join_code();
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER groups_set_join_code 
    BEFORE INSERT ON groups 
    FOR EACH ROW 
    EXECUTE FUNCTION set_group_join_code();