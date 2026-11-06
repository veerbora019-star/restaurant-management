-- ============================================================================
-- SPICE GARDEN RESTAURANT SAAS PLATFORM — PRODUCTION POSTGRESQL / SUPABASE DDL
-- Multi-Tenant Database Schema with Row Level Security (RLS) & Triggers
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'OWNER', 'MANAGER', 'WAITER', 'KITCHEN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE table_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'FOOD_READY', 'BILL_REQUESTED', 'CLEANING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'UPI', 'ONLINE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FLAT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('BASIC', 'PRO', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 2. TABLES DEFINITIONS
-- ============================================================================

-- 1. RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    logo_emoji VARCHAR(16) DEFAULT '🌿',
    tagline VARCHAR(255),
    address TEXT NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    gst_number VARCHAR(32),
    fssai_number VARCHAR(32),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESTAURANT SETTINGS
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id VARCHAR(64) NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
    gst_percentage NUMERIC(5,2) DEFAULT 5.00,
    service_charge_percentage NUMERIC(5,2) DEFAULT 5.00,
    enable_gst BOOLEAN DEFAULT true,
    enable_service_charge BOOLEAN DEFAULT true,
    currency VARCHAR(16) DEFAULT 'INR',
    currency_symbol VARCHAR(8) DEFAULT '₹',
    primary_color VARCHAR(32) DEFAULT '#15803d',
    secondary_color VARCHAR(32) DEFAULT '#f59e0b',
    opening_hours VARCHAR(128) DEFAULT '11:00 AM – 11:30 PM',
    sound_alerts BOOLEAN DEFAULT true,
    auto_accept_orders BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBSCRIPTIONS (Platform architecture for SaaS plans)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL DEFAULT 'PRO',
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS / PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id VARCHAR(64) REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(128) NOT NULL,
    password_hash TEXT, -- Used if standalone / Supabase Auth uuid matches id
    role user_role NOT NULL DEFAULT 'WAITER',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) NOT NULL,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    emoji VARCHAR(16) DEFAULT '🍽️',
    display_order INT DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (restaurant_id, id)
);

-- 6. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    emoji VARCHAR(16) DEFAULT '🍲',
    dietary VARCHAR(32) DEFAULT 'veg', -- 'veg', 'vegan', 'nonveg'
    available BOOLEAN DEFAULT true,
    bestseller BOOLEAN DEFAULT false,
    spice_level INT DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 3),
    preparation_time VARCHAR(64) DEFAULT '15-20 min',
    calories VARCHAR(64),
    ingredients TEXT[],
    allergens TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (restaurant_id, category_id) REFERENCES categories(restaurant_id, id) ON DELETE CASCADE
);

-- 7. RESTAURANT TABLES
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id SERIAL PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(32) NOT NULL,
    section VARCHAR(64) DEFAULT 'Indoor AC',
    capacity INT DEFAULT 4,
    qr_token VARCHAR(128) NOT NULL,
    status table_status NOT NULL DEFAULT 'AVAILABLE',
    active_order_id VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, table_number)
);

-- 8. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    discount_type discount_type NOT NULL DEFAULT 'PERCENTAGE',
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    minimum_order NUMERIC(10,2) DEFAULT 0,
    maximum_discount NUMERIC(10,2) DEFAULT 0,
    expires_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, code)
);

-- 9. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id INT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    table_number VARCHAR(32) NOT NULL,
    order_number VARCHAR(64) NOT NULL,
    status order_status NOT NULL DEFAULT 'PENDING',
    customer_name VARCHAR(255) DEFAULT 'Table Guest',
    customer_phone VARCHAR(32),
    coupon_code VARCHAR(64),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    taxable_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    gst NUMERIC(10,2) NOT NULL DEFAULT 0,
    service_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method payment_method DEFAULT 'UPI',
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDER ITEMS (Historical pricing snapshot)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    special_instructions TEXT,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    method payment_method NOT NULL DEFAULT 'UPI',
    status payment_status NOT NULL DEFAULT 'PAID',
    transaction_reference VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- 'NEW_ORDER', 'FOOD_READY', 'BILL_REQUEST', 'ORDER_CANCELLED'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_cat ON menu_items(restaurant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON restaurant_tables(restaurant_id, table_number);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(restaurant_id, table_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_restaurant ON notifications(restaurant_id, read);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- 4. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restaurants_updated_at ON restaurants;
CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_restaurant_settings_updated_at ON restaurant_settings;
CREATE TRIGGER trg_restaurant_settings_updated_at BEFORE UPDATE ON restaurant_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON menu_items;
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tables_updated_at ON restaurant_tables;
CREATE TRIGGER trg_tables_updated_at BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all core tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function: Get authenticated user's restaurant ID
CREATE OR REPLACE FUNCTION auth_restaurant_id()
RETURNS VARCHAR(64) AS $$
  SELECT restaurant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: Get authenticated user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR RESTAURANTS
-- ----------------------------------------------------------------------------
-- Public can view active restaurants (for customer QR dining)
CREATE POLICY "Public can view active restaurants" ON restaurants
    FOR SELECT USING (active = true);

-- Owners and Super Admins can update their restaurant profile
CREATE POLICY "Owners can update their restaurant" ON restaurants
    FOR UPDATE USING (
        id = auth_restaurant_id() AND auth_user_role() IN ('OWNER', 'SUPER_ADMIN')
    );

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR MENU & CATEGORIES
-- ----------------------------------------------------------------------------
-- Public/Customers can view active categories and available menu items
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (active = true);

CREATE POLICY "Public can view active menu items" ON menu_items
    FOR SELECT USING (available = true);

-- Staff can view all menu items (including out of stock) for their restaurant
CREATE POLICY "Staff can view all restaurant menu items" ON menu_items
    FOR SELECT USING (restaurant_id = auth_restaurant_id());

-- Owners/Managers can insert, update, delete menu items
CREATE POLICY "Managers can manage menu items" ON menu_items
    FOR ALL USING (
        restaurant_id = auth_restaurant_id() AND auth_user_role() IN ('OWNER', 'MANAGER', 'SUPER_ADMIN')
    );

CREATE POLICY "Managers can manage categories" ON categories
    FOR ALL USING (
        restaurant_id = auth_restaurant_id() AND auth_user_role() IN ('OWNER', 'MANAGER', 'SUPER_ADMIN')
    );

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR TABLES
-- ----------------------------------------------------------------------------
-- Public/Customer can read table status for scanning QR
CREATE POLICY "Public can view tables for ordering" ON restaurant_tables
    FOR SELECT USING (true);

-- Staff can update table statuses in their restaurant
CREATE POLICY "Staff can update table status" ON restaurant_tables
    FOR UPDATE USING (
        restaurant_id = auth_restaurant_id()
    );

CREATE POLICY "Managers can manage tables" ON restaurant_tables
    FOR ALL USING (
        restaurant_id = auth_restaurant_id() AND auth_user_role() IN ('OWNER', 'MANAGER', 'SUPER_ADMIN')
    );

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR ORDERS & ORDER ITEMS
-- ----------------------------------------------------------------------------
-- Customers can insert orders for any active restaurant
CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Customers can view their placed order by order ID
CREATE POLICY "Customers can view their specific order" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Customers can view specific order items" ON order_items
    FOR SELECT USING (true);

-- Staff can view and update orders belonging strictly to their restaurant
CREATE POLICY "Staff can view restaurant orders" ON orders
    FOR SELECT USING (
        restaurant_id = auth_restaurant_id() OR auth_user_role() = 'SUPER_ADMIN'
    );

CREATE POLICY "Staff can update restaurant orders" ON orders
    FOR UPDATE USING (
        restaurant_id = auth_restaurant_id() OR auth_user_role() = 'SUPER_ADMIN'
    );

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR PROFILES / STAFF
-- ----------------------------------------------------------------------------
-- Staff can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Owners and Managers can manage staff profiles within their restaurant
CREATE POLICY "Owners can manage staff" ON profiles
    FOR ALL USING (
        restaurant_id = auth_restaurant_id() AND auth_user_role() IN ('OWNER', 'MANAGER', 'SUPER_ADMIN')
    );

-- ----------------------------------------------------------------------------
-- RLS POLICIES FOR SETTINGS & PAYMENTS
-- ----------------------------------------------------------------------------
CREATE POLICY "Public can view basic settings" ON restaurant_settings
    FOR SELECT USING (true);

CREATE POLICY "Owners can update settings" ON restaurant_settings
    FOR UPDATE USING (
        restaurant_id = auth_restaurant_id() AND auth_user_role() IN ('OWNER', 'SUPER_ADMIN')
    );

CREATE POLICY "Staff can view payments" ON payments
    FOR SELECT USING (
        restaurant_id = auth_restaurant_id() AND auth_user_role() IN ('OWNER', 'MANAGER', 'WAITER', 'SUPER_ADMIN')
    );

CREATE POLICY "Staff can insert payments" ON payments
    FOR INSERT WITH CHECK (
        restaurant_id = auth_restaurant_id()
    );
