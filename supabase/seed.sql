-- ============================================================================
-- SPICE GARDEN RESTAURANT SAAS PLATFORM — SEED DATA
-- Realistic Multi-Tenant Seed Data for Development & Production Demos
-- ============================================================================

-- 1. RESTAURANTS
INSERT INTO restaurants (id, name, logo_url, logo_emoji, tagline, address, phone, email, gst_number, fssai_number, active)
VALUES
('res_spice_garden', 'Spice Garden', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', '🌿', 'Pure Vegetarian Fine Dining', 'Shop 4-6, Ground Floor, Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014', '+91 98765 43210', 'contact@spicegarden.in', '27AABCS1429B1Z5', '11521019000342', true),
('res_royal_punjab', 'Royal Punjab Bistro', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', '👑', 'Authentic North Indian Charcoal Flavours', 'Building 12, Cyber Hub, DLF Phase 2, Gurugram, Haryana 122002', '+91 99887 76655', 'delhi@royalpunjab.in', '07AACCR5678C1Z8', '11522020000889', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

-- 2. RESTAURANT SETTINGS
INSERT INTO restaurant_settings (restaurant_id, gst_percentage, service_charge_percentage, enable_gst, enable_service_charge, currency, currency_symbol, primary_color, secondary_color, opening_hours, sound_alerts)
VALUES
('res_spice_garden', 5.00, 5.00, true, true, 'INR', '₹', '#15803d', '#f59e0b', '11:00 AM – 11:30 PM', true),
('res_royal_punjab', 5.00, 10.00, true, true, 'INR', '₹', '#b91c1c', '#d97706', '12:00 PM – 12:00 AM', true)
ON CONFLICT (restaurant_id) DO UPDATE SET gst_percentage = EXCLUDED.gst_percentage;

-- 3. SUBSCRIPTIONS
INSERT INTO subscriptions (restaurant_id, plan, status, start_date, end_date)
VALUES
('res_spice_garden', 'PRO', 'ACTIVE', NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days'),
('res_royal_punjab', 'PREMIUM', 'ACTIVE', NOW() - INTERVAL '10 days', NOW() + INTERVAL '355 days');

-- 4. STAFF / PROFILES (1 Super Admin, 1 Owner, 2 Managers, 5 Waiters, 2 Kitchen Chefs)
INSERT INTO profiles (id, restaurant_id, name, email, username, password_hash, role, active)
VALUES
('00000000-0000-0000-0000-000000000001', NULL, 'SaaS Platform Super Admin', 'superadmin@restaurantplatform.io', 'superadmin', 'admin123', 'SUPER_ADMIN', true),
('00000000-0000-0000-0000-000000000002', 'res_spice_garden', 'Rajesh Sharma', 'owner@spicegarden.in', 'owner', 'admin123', 'OWNER', true),
('00000000-0000-0000-0000-000000000003', 'res_spice_garden', 'Amit Verma', 'manager@spicegarden.in', 'manager', 'admin123', 'MANAGER', true),
('00000000-0000-0000-0000-000000000004', 'res_spice_garden', 'Neha Gupta', 'manager2@spicegarden.in', 'manager2', 'admin123', 'MANAGER', true),
('00000000-0000-0000-0000-000000000005', 'res_spice_garden', 'Suresh Patil', 'waiter1@spicegarden.in', 'waiter', 'waiter123', 'WAITER', true),
('00000000-0000-0000-0000-000000000006', 'res_spice_garden', 'Pooja Nair', 'waiter2@spicegarden.in', 'waiter2', 'waiter123', 'WAITER', true),
('00000000-0000-0000-0000-000000000007', 'res_spice_garden', 'Rohan Shinde', 'waiter3@spicegarden.in', 'waiter3', 'waiter123', 'WAITER', true),
('00000000-0000-0000-0000-000000000008', 'res_spice_garden', 'Kavita Joshi', 'waiter4@spicegarden.in', 'waiter4', 'waiter123', 'WAITER', true),
('00000000-0000-0000-0000-000000000009', 'res_spice_garden', 'Deepak Rao', 'waiter5@spicegarden.in', 'waiter5', 'waiter123', 'WAITER', true),
('00000000-0000-0000-0000-000000000010', 'res_spice_garden', 'Chef Sanjeev Kumar', 'kitchen@spicegarden.in', 'kitchen', 'kitchen123', 'KITCHEN', true),
('00000000-0000-0000-0000-000000000011', 'res_spice_garden', 'Chef Vikas Ranveer', 'kitchen2@spicegarden.in', 'kitchen2', 'kitchen123', 'KITCHEN', true),
('00000000-0000-0000-0000-000000000012', 'res_royal_punjab', 'Harpreet Singh', 'owner@royalpunjab.in', 'harpreet', 'admin123', 'OWNER', true)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 5. CATEGORIES
INSERT INTO categories (restaurant_id, id, name, emoji, display_order, active)
VALUES
('res_spice_garden', 'starters', 'Starters & Tandoor', '🥗', 1, true),
('res_spice_garden', 'mains', 'Main Course Curries', '🥘', 2, true),
('res_spice_garden', 'breads', 'Tandoori Breads & Naan', '🫓', 3, true),
('res_spice_garden', 'rice', 'Dum Biryani & Rice', '🍚', 4, true),
('res_spice_garden', 'drinks', 'Beverages & Coolers', '🥤', 5, true),
('res_spice_garden', 'desserts', 'Royal Desserts & Sweets', '🍨', 6, true)
ON CONFLICT (restaurant_id, id) DO NOTHING;

-- 6. MENU ITEMS (30 Authentic Dishes)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, emoji, dietary, available, bestseller, spice_level, preparation_time, calories, ingredients, allergens, image_url)
VALUES
(1, 'res_spice_garden', 'starters', 'Crispy Veg Samosa (2 Pcs)', 'Golden flaky pastry stuffed with seasoned potatoes, green peas and fresh spices.', 70.00, '🥟', 'veg', true, true, 1, '10-12 min', '280 kcal', ARRAY['Potatoes', 'Green Peas', 'Whole Wheat Flour', 'Garam Masala'], ARRAY['Gluten'], 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
(2, 'res_spice_garden', 'starters', 'Tandoori Paneer Tikka', 'Succulent malai paneer cubes marinated in hung yogurt, Kashmiri deghi mirch & ajwain, char-grilled in clay tandoor.', 240.00, '🍢', 'veg', true, true, 2, '15-18 min', '340 kcal', ARRAY['Cottage Cheese', 'Hung Curd', 'Bell Peppers', 'Mustard Oil'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'),
(3, 'res_spice_garden', 'starters', 'Hara Bhara Kabab (6 Pcs)', 'Nutritious patties made with spinach, green peas, cottage cheese and roasted gram flour.', 190.00, '🌿', 'veg', true, false, 1, '12-15 min', '220 kcal', ARRAY['Baby Spinach', 'Green Peas', 'Paneer', 'Cashew'], ARRAY['Dairy', 'Nuts'], 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80'),
(4, 'res_spice_garden', 'starters', 'Dahi Puri Chaat (6 Pcs)', 'Crisp semolina puris loaded with potato mash, sweet chilled curd, zesty tamarind reduction & fine sev.', 130.00, '🫙', 'veg', true, true, 1, '8-10 min', '210 kcal', ARRAY['Puris', 'Sweet Yogurt', 'Tamarind Chutney', 'Sev'], ARRAY['Gluten', 'Dairy'], 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'),
(5, 'res_spice_garden', 'starters', 'Crispy Corn Salt & Pepper', 'Tender American sweet corn kernels tossed with crushed black pepper, spring onions and capsicum.', 180.00, '🌽', 'vegan', true, false, 2, '12-14 min', '240 kcal', ARRAY['Sweet Corn', 'Spring Onions', 'Black Pepper', 'Capsicum'], ARRAY[]::TEXT[], 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80'),
(6, 'res_spice_garden', 'starters', 'Tandoori Malai Chaap', 'Tender soya chaap chunks marinated in rich cashew paste, cardamom cream, cheese and grilled to perfection.', 220.00, '🍢', 'veg', true, true, 0, '14-16 min', '360 kcal', ARRAY['Soya Chaap', 'Cashew Cream', 'Cardamom', 'Cheese'], ARRAY['Dairy', 'Nuts', 'Soy'], 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'),

(7, 'res_spice_garden', 'mains', 'Dal Makhani Bukhara Style', 'Slow cooked black urad lentils & kidney beans simmered overnight on low charcoal heat with organic butter & cream.', 210.00, '🫕', 'veg', true, true, 1, '12-15 min', '390 kcal', ARRAY['Black Lentils', 'Rajma', 'White Butter', 'Dairy Cream'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'),
(8, 'res_spice_garden', 'mains', 'Paneer Butter Masala', 'Tender cottage cheese cubes simmered in a silky, mildly sweet & tangy velvety tomato gravy enriched with butter.', 260.00, '🧈', 'veg', true, true, 1, '15-18 min', '420 kcal', ARRAY['Paneer', 'Cashew Paste', 'Butter', 'Kasuri Methi'], ARRAY['Dairy', 'Nuts'], 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'),
(9, 'res_spice_garden', 'mains', 'Palak Paneer Lehsuni', 'Fresh farm spinach puree cooked with fragrant garlic tadka, green chilies and soft cottage cheese chunks.', 230.00, '🥬', 'veg', true, false, 2, '14-16 min', '310 kcal', ARRAY['Spinach', 'Paneer', 'Fried Garlic', 'Green Chilli'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'),
(10, 'res_spice_garden', 'mains', 'Amritsari Chole Masala', 'Authentic Kabuli chickpeas simmered in a robust dark onion-tomato gravy with freshly ground anardana and Punjabi spices.', 190.00, '🫘', 'vegan', true, true, 2, '12-15 min', '290 kcal', ARRAY['Kabuli Chana', 'Pomegranate Seeds', 'Ginger', 'Spices'], ARRAY[]::TEXT[], 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'),
(11, 'res_spice_garden', 'mains', 'Kadhai Paneer Special', 'Cottage cheese, crunchy bell peppers & onions cooked in a spicy wok with freshly pounded coriander seeds and red chilies.', 250.00, '🥘', 'veg', true, false, 3, '15-18 min', '360 kcal', ARRAY['Paneer', 'Bell Peppers', 'Coriander Seeds', 'Tomatoes'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80'),
(12, 'res_spice_garden', 'mains', 'Mix Veg Diwani Handi', 'Seasonal vegetables, French beans, carrots, baby corn and cauliflower simmered in a rich spinach-cashew aromatic gravy.', 210.00, '🥗', 'veg', true, false, 1, '14-16 min', '280 kcal', ARRAY['Carrots', 'Beans', 'Cauliflower', 'Cashew Paste'], ARRAY['Dairy', 'Nuts'], 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'),
(13, 'res_spice_garden', 'mains', 'Kaju Curry Shahi', 'Roasted whole cashew nuts cooked in a rich, velvety golden onion-cashew-khoya gravy with mild royal spices.', 290.00, '🍛', 'veg', true, true, 1, '15-18 min', '480 kcal', ARRAY['Whole Cashews', 'Khoya', 'Dairy Cream', 'Royal Spices'], ARRAY['Dairy', 'Nuts'], 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'),

(14, 'res_spice_garden', 'breads', 'Butter Garlic Naan', 'Refined flour leavened flatbread topped with finely minced roasted garlic and fresh coriander, brushed with Amul butter.', 65.00, '🫓', 'veg', true, true, 0, '5-7 min', '180 kcal', ARRAY['Wheat Flour', 'Garlic', 'Butter', 'Coriander'], ARRAY['Gluten', 'Dairy'], 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
(15, 'res_spice_garden', 'breads', 'Classic Butter Naan', 'Traditional clay oven baked soft leavened flatbread layered with pure butter.', 50.00, '🫓', 'veg', true, false, 0, '5-6 min', '160 kcal', ARRAY['Wheat Flour', 'Milk', 'Butter'], ARRAY['Gluten', 'Dairy'], 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
(16, 'res_spice_garden', 'breads', 'Cheese Garlic Naan', 'Soft naan stuffed with gooey mozzarella cheese and topped with minced roasted garlic.', 85.00, '🧀', 'veg', true, true, 0, '6-8 min', '240 kcal', ARRAY['Wheat Flour', 'Mozzarella', 'Garlic', 'Butter'], ARRAY['Gluten', 'Dairy'], 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
(17, 'res_spice_garden', 'breads', 'Tandoori Roti (Butter)', 'Healthy 100% whole wheat flatbread freshly baked in tandoor and brushed with butter.', 35.00, '🫓', 'veg', true, false, 0, '4-5 min', '110 kcal', ARRAY['Whole Wheat Atta', 'Butter'], ARRAY['Gluten', 'Dairy'], 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
(18, 'res_spice_garden', 'breads', 'Laccha Paratha Pudina', 'Multi-layered flaky whole wheat bread infused with dried mint leaves and baked crisp.', 60.00, '🫓', 'veg', true, false, 0, '6-8 min', '190 kcal', ARRAY['Whole Wheat Atta', 'Ghee', 'Pudina'], ARRAY['Gluten', 'Dairy'], 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),

(19, 'res_spice_garden', 'rice', 'Hyderabadi Veg Dum Biryani', 'Long grain aged basmati rice slow cooked with marinated vegetables, saffron milk, fried onions & whole spices in sealed pot.', 240.00, '🍚', 'veg', true, true, 2, '16-20 min', '450 kcal', ARRAY['Aged Basmati Rice', 'Saffron', 'Brown Onions', 'Veggies'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'),
(20, 'res_spice_garden', 'rice', 'Paneer Tikka Biryani', 'Smoky char-grilled paneer tikka layered with spiced saffron basmati rice, caramelized onions, herbs and desi ghee.', 280.00, '🍛', 'veg', true, true, 2, '16-20 min', '490 kcal', ARRAY['Paneer Tikka', 'Basmati Rice', 'Desi Ghee', 'Biryani Masala'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'),
(21, 'res_spice_garden', 'rice', 'Jeera Rice with Desi Ghee', 'Fluffy steamed basmati rice tempered with royal cumin seeds, cloves and aromatic desi cow ghee.', 130.00, '🍚', 'veg', true, false, 0, '8-10 min', '260 kcal', ARRAY['Basmati Rice', 'Cumin Seeds', 'Desi Ghee'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80'),
(22, 'res_spice_garden', 'rice', 'Dal Khichdi Tadkewali', 'Comforting home-style rice and yellow moong dal cooked with garlic, cumin, red chilli and desi ghee tadka.', 180.00, '🍲', 'veg', true, false, 1, '10-12 min', '310 kcal', ARRAY['Basmati Tukda', 'Moong Dal', 'Desi Ghee', 'Garlic'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'),

(23, 'res_spice_garden', 'drinks', 'Alphonso Mango Lassi', 'Rich creamy yogurt blended with premium Ratnagiri Alphonso mango pulp, green cardamom and pistachios.', 99.00, '🥭', 'veg', true, true, 0, '5 min', '220 kcal', ARRAY['Fresh Yogurt', 'Alphonso Pulp', 'Cardamom', 'Pistachios'], ARRAY['Dairy', 'Nuts'], 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80'),
(24, 'res_spice_garden', 'drinks', 'Masala Chai Pot', 'Freshly brewed aromatic Assam tea infused with crushed ginger, green cardamom, cinnamon & spices.', 45.00, '☕', 'veg', true, false, 0, '5-7 min', '90 kcal', ARRAY['Assam Tea', 'Milk', 'Ginger', 'Cardamom'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80'),
(25, 'res_spice_garden', 'drinks', 'Fresh Nimbu Shikanji (Soda)', 'Freshly squeezed lemon juice with chilled sparkling soda, roasted cumin, black salt & mint.', 60.00, '🍋', 'vegan', true, false, 0, '4 min', '60 kcal', ARRAY['Lemon', 'Soda', 'Black Salt', 'Mint'], ARRAY[]::TEXT[], 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),
(26, 'res_spice_garden', 'drinks', 'Cold Coffee with Ice Cream', 'Thick creamy blended cold coffee topped with a generous scoop of vanilla ice cream and chocolate drizzle.', 110.00, '🧋', 'veg', true, true, 0, '5 min', '260 kcal', ARRAY['Espresso', 'Milk', 'Vanilla Ice Cream', 'Chocolate'], ARRAY['Dairy'], 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80'),

(27, 'res_spice_garden', 'desserts', 'Gulab Jamun with Rabdi (2 Pcs)', 'Melt-in-mouth mawa dumplings soaked in saffron-rose syrup, topped with thick Lucknowi malai rabdi.', 120.00, '🍮', 'veg', true, true, 0, '5 min', '310 kcal', ARRAY['Khoya', 'Saffron Syrup', 'Rabdi', 'Almonds'], ARRAY['Dairy', 'Nuts', 'Gluten'], 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'),
(28, 'res_spice_garden', 'desserts', 'Royal Kesar Pista Kulfi', 'Traditional slow-reduced dense milk ice cream stick flavored with saffron threads and pistachios.', 110.00, '🍦', 'veg', true, true, 0, '3 min', '240 kcal', ARRAY['Milk', 'Saffron', 'Pistachios', 'Cardamom'], ARRAY['Dairy', 'Nuts'], 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80'),
(29, 'res_spice_garden', 'desserts', 'Sizzling Brownie with Vanilla', 'Warm walnut chocolate brownie served on a scorching cast iron sizzler platter with vanilla ice cream & hot fudge sauce.', 180.00, '🍫', 'veg', true, false, 0, '8 min', '420 kcal', ARRAY['Dark Chocolate', 'Walnuts', 'Ice Cream', 'Fudge'], ARRAY['Dairy', 'Gluten', 'Nuts'], 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'),
(30, 'res_spice_garden', 'desserts', 'Gajar Ka Halwa Desi Ghee', 'Winter special red carrots slow cooked in pure desi ghee, khoya, dry fruits and cardamom.', 140.00, '🥕', 'veg', true, true, 0, '5 min', '290 kcal', ARRAY['Red Carrots', 'Desi Ghee', 'Khoya', 'Cashews'], ARRAY['Dairy', 'Nuts'], 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

-- Reset serial sequence for menu_items
SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));

-- 7. RESTAURANT TABLES (25 Tables across 4 Sections)
INSERT INTO restaurant_tables (id, restaurant_id, table_number, section, capacity, qr_token, status, active_order_id)
VALUES
(1, 'res_spice_garden', '01', 'Indoor AC', 2, 'tok_sg_t01_9821', 'OCCUPIED', 'ORD-20261008-1040'),
(2, 'res_spice_garden', '02', 'Indoor AC', 4, 'tok_sg_t02_7431', 'AVAILABLE', NULL),
(3, 'res_spice_garden', '03', 'Indoor AC', 4, 'tok_sg_t03_5521', 'FOOD_READY', 'ORD-20261008-1041'),
(4, 'res_spice_garden', '04', 'Indoor AC', 6, 'tok_sg_t04_9921', 'AVAILABLE', NULL),
(5, 'res_spice_garden', '05', 'Indoor AC', 8, 'tok_sg_t05_3411', 'OCCUPIED', NULL),
(6, 'res_spice_garden', '06', 'Indoor AC', 4, 'tok_sg_t06_8812', 'AVAILABLE', NULL),
(7, 'res_spice_garden', '07', 'Indoor AC', 4, 'tok_sg_t07_1943', 'OCCUPIED', 'ORD-20261008-1042'),
(8, 'res_spice_garden', '08', 'Indoor AC', 6, 'tok_sg_t08_7721', 'CLEANING', NULL),

(9, 'res_spice_garden', '09', 'Garden Terrace', 2, 'tok_sg_t09_4431', 'AVAILABLE', NULL),
(10, 'res_spice_garden', '10', 'Garden Terrace', 4, 'tok_sg_t10_8842', 'AVAILABLE', NULL),
(11, 'res_spice_garden', '11', 'Garden Terrace', 6, 'tok_sg_t11_6621', 'OCCUPIED', 'ORD-20261008-1038'),
(12, 'res_spice_garden', '12', 'Garden Terrace', 4, 'tok_sg_t12_9910', 'AVAILABLE', NULL),
(13, 'res_spice_garden', '13', 'Garden Terrace', 4, 'tok_sg_t13_1123', 'AVAILABLE', NULL),
(14, 'res_spice_garden', '14', 'Garden Terrace', 6, 'tok_sg_t14_5541', 'OCCUPIED', NULL),
(15, 'res_spice_garden', '15', 'Garden Terrace', 2, 'tok_sg_t15_8819', 'AVAILABLE', NULL),
(16, 'res_spice_garden', '16', 'Garden Terrace', 8, 'tok_sg_t16_3391', 'AVAILABLE', NULL),

(17, 'res_spice_garden', '17', 'Family Lounge', 8, 'tok_sg_t17_7712', 'AVAILABLE', NULL),
(18, 'res_spice_garden', '18', 'Family Lounge', 10, 'tok_sg_t18_8832', 'OCCUPIED', NULL),
(19, 'res_spice_garden', '19', 'Family Lounge', 6, 'tok_sg_t19_1192', 'AVAILABLE', NULL),
(20, 'res_spice_garden', '20', 'Family Lounge', 8, 'tok_sg_t20_4491', 'AVAILABLE', NULL),
(21, 'res_spice_garden', '21', 'Family Lounge', 12, 'tok_sg_t21_6623', 'AVAILABLE', NULL),

(22, 'res_spice_garden', '22', 'Banquet Hall', 10, 'tok_sg_t22_8891', 'AVAILABLE', NULL),
(23, 'res_spice_garden', '23', 'Banquet Hall', 10, 'tok_sg_t23_9934', 'AVAILABLE', NULL),
(24, 'res_spice_garden', '24', 'Banquet Hall', 12, 'tok_sg_t24_1187', 'AVAILABLE', NULL),
(25, 'res_spice_garden', '25', 'Banquet Hall', 16, 'tok_sg_t25_4476', 'AVAILABLE', NULL)
ON CONFLICT (id) DO UPDATE SET table_number = EXCLUDED.table_number, status = EXCLUDED.status;

SELECT setval('restaurant_tables_id_seq', (SELECT MAX(id) FROM restaurant_tables));

-- 8. COUPONS
INSERT INTO coupons (restaurant_id, code, discount_type, discount_value, minimum_order, maximum_discount, expires_at, active, description)
VALUES
('res_spice_garden', 'WELCOME50', 'FLAT', 50.00, 299.00, 50.00, NOW() + INTERVAL '180 days', true, 'Flat ₹50 OFF on orders above ₹299'),
('res_spice_garden', 'SPICE20', 'PERCENTAGE', 20.00, 499.00, 150.00, NOW() + INTERVAL '180 days', true, '20% OFF up to ₹150 on orders above ₹499'),
('res_spice_garden', 'FEAST100', 'FLAT', 100.00, 799.00, 100.00, NOW() + INTERVAL '180 days', true, 'Flat ₹100 OFF on family dining above ₹799'),
('res_spice_garden', 'FAMILY15', 'PERCENTAGE', 15.00, 999.00, 250.00, NOW() + INTERVAL '180 days', true, '15% OFF up to ₹250 on grand feasts above ₹999')
ON CONFLICT (restaurant_id, code) DO NOTHING;

-- 9. INITIAL ORDERS & ORDER ITEMS
INSERT INTO orders (id, restaurant_id, table_id, table_number, order_number, status, customer_name, customer_phone, coupon_code, subtotal, discount, taxable_amount, gst, service_charge, total, payment_status, payment_method, created_at)
VALUES
('ORD-20261008-1038', 'res_spice_garden', 11, '11', 'ORD-1038', 'SERVED', 'Sharma Family', '9822011223', 'FAMILY15', 1870.00, 250.00, 1620.00, 81.00, 81.00, 1782.00, 'PENDING', 'UPI', NOW() - INTERVAL '55 minutes'),
('ORD-20261008-1040', 'res_spice_garden', 1, '01', 'ORD-1040', 'PREPARING', 'Rohan Deshmukh', NULL, 'WELCOME50', 479.00, 50.00, 429.00, 21.45, 21.45, 472.00, 'PENDING', 'CASH', NOW() - INTERVAL '25 minutes'),
('ORD-20261008-1041', 'res_spice_garden', 3, '03', 'ORD-1041', 'READY', 'Pooja Mehta', '9890123456', NULL, 600.00, 0.00, 600.00, 30.00, 30.00, 660.00, 'PENDING', 'UPI', NOW() - INTERVAL '12 minutes'),
('ORD-20261008-1042', 'res_spice_garden', 7, '07', 'ORD-1042', 'PENDING', 'Anand Verma', NULL, 'SPICE20', 705.00, 141.00, 564.00, 28.20, 28.20, 620.00, 'PENDING', 'UPI', NOW() - INTERVAL '3 minutes')
ON CONFLICT (id) DO NOTHING;

-- Order Items
INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price, special_instructions, total)
VALUES
('ORD-20261008-1038', 2, 'Tandoori Paneer Tikka', 2, 240.00, 'Extra spicy with mint dip', 480.00),
('ORD-20261008-1038', 8, 'Paneer Butter Masala', 2, 260.00, 'Less sweet please', 520.00),
('ORD-20261008-1038', 14, 'Butter Garlic Naan', 6, 65.00, 'Crispy', 390.00),
('ORD-20261008-1038', 19, 'Hyderabadi Veg Dum Biryani', 2, 240.00, '', 480.00),

('ORD-20261008-1040', 1, 'Crispy Veg Samosa (2 Pcs)', 1, 70.00, '', 70.00),
('ORD-20261008-1040', 7, 'Dal Makhani Bukhara Style', 1, 210.00, 'Extra butter on top', 210.00),
('ORD-20261008-1040', 15, 'Classic Butter Naan', 2, 50.00, '', 100.00),
('ORD-20261008-1040', 23, 'Alphonso Mango Lassi', 1, 99.00, 'Chilled', 99.00),

('ORD-20261008-1041', 2, 'Tandoori Paneer Tikka', 1, 240.00, 'Less spicy', 240.00),
('ORD-20261008-1041', 19, 'Hyderabadi Veg Dum Biryani', 1, 240.00, 'Double Raita', 240.00),
('ORD-20261008-1041', 27, 'Gulab Jamun with Rabdi (2 Pcs)', 1, 120.00, '', 120.00),

('ORD-20261008-1042', 4, 'Dahi Puri Chaat (6 Pcs)', 2, 130.00, 'Extra sev on side', 260.00),
('ORD-20261008-1042', 11, 'Kadhai Paneer Special', 1, 250.00, 'Very spicy', 250.00),
('ORD-20261008-1042', 14, 'Butter Garlic Naan', 3, 65.00, 'Well done', 195.00)
ON CONFLICT (id) DO NOTHING;
