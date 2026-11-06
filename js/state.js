/**
 * SPICE GARDEN POS & RESTAURANT SAAS PLATFORM
 * State Manager & Realtime Database Synchronization Bridge
 * 
 * Production Architecture:
 * - Database (PostgreSQL / Supabase Engine) is the sole source of truth.
 * - LocalStorage is strictly reserved for transient UI state (e.g., active uncommitted cart).
 */

const SEED_DATA_RESTAURANTS = [
  {
    id: 'res_spice_garden',
    name: 'Spice Garden',
    logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    logo_emoji: '🌿',
    tagline: 'Pure Vegetarian Fine Dining',
    address: 'Shop 4-6, Ground Floor, Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014',
    phone: '+91 98765 43210',
    email: 'contact@spicegarden.in',
    gst_number: '27AABCS1429B1Z5',
    fssai_number: '11521019000342',
    active: true
  },
  {
    id: 'res_royal_punjab',
    name: 'Royal Punjab Bistro',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    logo_emoji: '👑',
    tagline: 'Authentic North Indian Charcoal Flavours',
    address: 'Building 12, Cyber Hub, DLF Phase 2, Gurugram, Haryana 122002',
    phone: '+91 99887 76655',
    email: 'delhi@royalpunjab.in',
    gst_number: '07AACCR5678C1Z8',
    fssai_number: '11522020000889',
    active: true
  }
];

const SEED_DATA_SETTINGS = [
  {
    restaurant_id: 'res_spice_garden',
    gst_percentage: 5,
    service_charge_percentage: 5,
    enable_gst: true,
    enable_service_charge: true,
    currency: 'INR',
    currency_symbol: '₹',
    primary_color: '#15803d',
    secondary_color: '#f59e0b',
    opening_hours: '11:00 AM – 11:30 PM',
    sound_alerts: true
  },
  {
    restaurant_id: 'res_royal_punjab',
    gst_percentage: 5,
    service_charge_percentage: 10,
    enable_gst: true,
    enable_service_charge: true,
    currency: 'INR',
    currency_symbol: '₹',
    primary_color: '#b91c1c',
    secondary_color: '#d97706',
    opening_hours: '12:00 PM – 12:00 AM',
    sound_alerts: true
  }
];

const SEED_DATA_PROFILES = [
  { id: '00000000-0000-0000-0000-000000000001', restaurant_id: null, name: 'SaaS Platform Super Admin', email: 'superadmin@restaurantplatform.io', username: 'superadmin', role: 'SUPER_ADMIN', active: true },
  { id: '00000000-0000-0000-0000-000000000002', restaurant_id: 'res_spice_garden', name: 'Rajesh Sharma', email: 'owner@spicegarden.in', username: 'owner', role: 'OWNER', active: true },
  { id: '00000000-0000-0000-0000-000000000003', restaurant_id: 'res_spice_garden', name: 'Amit Verma', email: 'manager@spicegarden.in', username: 'manager', role: 'MANAGER', active: true },
  { id: '00000000-0000-0000-0000-000000000004', restaurant_id: 'res_spice_garden', name: 'Neha Gupta', email: 'manager2@spicegarden.in', username: 'manager2', role: 'MANAGER', active: true },
  { id: '00000000-0000-0000-0000-000000000005', restaurant_id: 'res_spice_garden', name: 'Suresh Patil', email: 'waiter1@spicegarden.in', username: 'waiter', role: 'WAITER', active: true },
  { id: '00000000-0000-0000-0000-000000000006', restaurant_id: 'res_spice_garden', name: 'Pooja Nair', email: 'waiter2@spicegarden.in', username: 'waiter2', role: 'WAITER', active: true },
  { id: '00000000-0000-0000-0000-000000000007', restaurant_id: 'res_spice_garden', name: 'Rohan Shinde', email: 'waiter3@spicegarden.in', username: 'waiter3', role: 'WAITER', active: true },
  { id: '00000000-0000-0000-0000-000000000008', restaurant_id: 'res_spice_garden', name: 'Kavita Joshi', email: 'waiter4@spicegarden.in', username: 'waiter4', role: 'WAITER', active: true },
  { id: '00000000-0000-0000-0000-000000000009', restaurant_id: 'res_spice_garden', name: 'Deepak Rao', email: 'waiter5@spicegarden.in', username: 'waiter5', role: 'WAITER', active: true },
  { id: '00000000-0000-0000-0000-000000000010', restaurant_id: 'res_spice_garden', name: 'Chef Sanjeev Kumar', email: 'kitchen@spicegarden.in', username: 'kitchen', role: 'KITCHEN', active: true },
  { id: '00000000-0000-0000-0000-000000000011', restaurant_id: 'res_spice_garden', name: 'Chef Vikas Ranveer', email: 'kitchen2@spicegarden.in', username: 'kitchen2', role: 'KITCHEN', active: true },
  { id: '00000000-0000-0000-0000-000000000012', restaurant_id: 'res_royal_punjab', name: 'Harpreet Singh', email: 'owner@royalpunjab.in', username: 'harpreet', role: 'OWNER', active: true }
];

const SEED_DATA_CATEGORIES = [
  { id: 'starters', restaurant_id: 'res_spice_garden', name: 'Starters & Tandoor', emoji: '🥗', display_order: 1, active: true },
  { id: 'mains', restaurant_id: 'res_spice_garden', name: 'Main Course Curries', emoji: '🥘', display_order: 2, active: true },
  { id: 'breads', restaurant_id: 'res_spice_garden', name: 'Tandoori Breads & Naan', emoji: '🫓', display_order: 3, active: true },
  { id: 'rice', restaurant_id: 'res_spice_garden', name: 'Dum Biryani & Rice', emoji: '🍚', display_order: 4, active: true },
  { id: 'drinks', restaurant_id: 'res_spice_garden', name: 'Beverages & Coolers', emoji: '🥤', display_order: 5, active: true },
  { id: 'desserts', restaurant_id: 'res_spice_garden', name: 'Royal Desserts & Sweets', emoji: '🍨', display_order: 6, active: true }
];

const SEED_DATA_MENU = [
  { id: 1, restaurant_id: 'res_spice_garden', category_id: 'starters', name: 'Crispy Veg Samosa (2 Pcs)', price: 70, emoji: '🥟', dietary: 'veg', available: true, bestseller: true, spice_level: 1, preparation_time: '10-12 min', calories: '280 kcal', description: 'Golden flaky pastry stuffed with seasoned potatoes, green peas and fresh spices.', ingredients: ['Potatoes', 'Green Peas', 'Whole Wheat Flour', 'Garam Masala'], allergens: ['Gluten'], image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { id: 2, restaurant_id: 'res_spice_garden', category_id: 'starters', name: 'Tandoori Paneer Tikka', price: 240, emoji: '🍢', dietary: 'veg', available: true, bestseller: true, spice_level: 2, preparation_time: '15-18 min', calories: '340 kcal', description: 'Succulent malai paneer cubes marinated in hung yogurt, Kashmiri deghi mirch & ajwain, char-grilled in clay tandoor.', ingredients: ['Cottage Cheese', 'Hung Curd', 'Bell Peppers', 'Mustard Oil'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' },
  { id: 3, restaurant_id: 'res_spice_garden', category_id: 'starters', name: 'Hara Bhara Kabab (6 Pcs)', price: 190, emoji: '🌿', dietary: 'veg', available: true, bestseller: false, spice_level: 1, preparation_time: '12-15 min', calories: '220 kcal', description: 'Nutritious patties made with spinach, green peas, cottage cheese and roasted gram flour.', ingredients: ['Baby Spinach', 'Green Peas', 'Paneer', 'Cashew'], allergens: ['Dairy', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80' },
  { id: 4, restaurant_id: 'res_spice_garden', category_id: 'starters', name: 'Dahi Puri Chaat (6 Pcs)', price: 130, emoji: '🫙', dietary: 'veg', available: true, bestseller: true, spice_level: 1, preparation_time: '8-10 min', calories: '210 kcal', description: 'Crisp semolina puris loaded with potato mash, sweet chilled curd, zesty tamarind reduction & fine sev.', ingredients: ['Puris', 'Sweet Yogurt', 'Tamarind Chutney', 'Sev'], allergens: ['Gluten', 'Dairy'], image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
  { id: 5, restaurant_id: 'res_spice_garden', category_id: 'starters', name: 'Crispy Corn Salt & Pepper', price: 180, emoji: '🌽', dietary: 'vegan', available: true, bestseller: false, spice_level: 2, preparation_time: '12-14 min', calories: '240 kcal', description: 'Tender American sweet corn kernels tossed with crushed black pepper, spring onions and capsicum.', ingredients: ['Sweet Corn', 'Spring Onions', 'Black Pepper', 'Capsicum'], allergens: [], image_url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80' },
  { id: 6, restaurant_id: 'res_spice_garden', category_id: 'starters', name: 'Tandoori Malai Chaap', price: 220, emoji: '🍢', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '14-16 min', calories: '360 kcal', description: 'Tender soya chaap chunks marinated in rich cashew paste, cardamom cream, cheese and grilled to perfection.', ingredients: ['Soya Chaap', 'Cashew Cream', 'Cardamom', 'Cheese'], allergens: ['Dairy', 'Nuts', 'Soy'], image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' },

  { id: 7, restaurant_id: 'res_spice_garden', category_id: 'mains', name: 'Dal Makhani Bukhara Style', price: 210, emoji: '🫕', dietary: 'veg', available: true, bestseller: true, spice_level: 1, preparation_time: '12-15 min', calories: '390 kcal', description: 'Slow cooked black urad lentils & kidney beans simmered overnight on low charcoal heat with organic butter & cream.', ingredients: ['Black Lentils', 'Rajma', 'White Butter', 'Dairy Cream'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
  { id: 8, restaurant_id: 'res_spice_garden', category_id: 'mains', name: 'Paneer Butter Masala', price: 260, emoji: '🧈', dietary: 'veg', available: true, bestseller: true, spice_level: 1, preparation_time: '15-18 min', calories: '420 kcal', description: 'Tender cottage cheese cubes simmered in a silky, mildly sweet & tangy velvety tomato gravy enriched with butter.', ingredients: ['Paneer', 'Cashew Paste', 'Butter', 'Kasuri Methi'], allergens: ['Dairy', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' },
  { id: 9, restaurant_id: 'res_spice_garden', category_id: 'mains', name: 'Palak Paneer Lehsuni', price: 230, emoji: '🥬', dietary: 'veg', available: true, bestseller: false, spice_level: 2, preparation_time: '14-16 min', calories: '310 kcal', description: 'Fresh farm spinach puree cooked with fragrant garlic tadka, green chilies and soft cottage cheese chunks.', ingredients: ['Spinach', 'Paneer', 'Fried Garlic', 'Green Chilli'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
  { id: 10, restaurant_id: 'res_spice_garden', category_id: 'mains', name: 'Amritsari Chole Masala', price: 190, emoji: '🫘', dietary: 'vegan', available: true, bestseller: true, spice_level: 2, preparation_time: '12-15 min', calories: '290 kcal', description: 'Authentic Kabuli chickpeas simmered in a robust dark onion-tomato gravy with freshly ground anardana and Punjabi spices.', ingredients: ['Kabuli Chana', 'Pomegranate Seeds', 'Ginger', 'Spices'], allergens: [], image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
  { id: 11, restaurant_id: 'res_spice_garden', category_id: 'mains', name: 'Kadhai Paneer Special', price: 250, emoji: '🥘', dietary: 'veg', available: true, bestseller: false, spice_level: 3, preparation_time: '15-18 min', calories: '360 kcal', description: 'Cottage cheese, crunchy bell peppers & onions cooked in a spicy wok with freshly pounded coriander seeds and red chilies.', ingredients: ['Paneer', 'Bell Peppers', 'Coriander Seeds', 'Tomatoes'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80' },
  { id: 12, restaurant_id: 'res_spice_garden', category_id: 'mains', name: 'Mix Veg Diwani Handi', price: 210, emoji: '🥗', dietary: 'veg', available: true, bestseller: false, spice_level: 1, preparation_time: '14-16 min', calories: '280 kcal', description: 'Seasonal vegetables, French beans, carrots, baby corn and cauliflower simmered in a rich spinach-cashew aromatic gravy.', ingredients: ['Carrots', 'Beans', 'Cauliflower', 'Cashew Paste'], allergens: ['Dairy', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
  { id: 13, restaurant_id: 'res_spice_garden', category_id: 'mains', name: 'Kaju Curry Shahi', price: 290, emoji: '🍛', dietary: 'veg', available: true, bestseller: true, spice_level: 1, preparation_time: '15-18 min', calories: '480 kcal', description: 'Roasted whole cashew nuts cooked in a rich, velvety golden onion-cashew-khoya gravy with mild royal spices.', ingredients: ['Whole Cashews', 'Khoya', 'Dairy Cream', 'Royal Spices'], allergens: ['Dairy', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' },

  { id: 14, restaurant_id: 'res_spice_garden', category_id: 'breads', name: 'Butter Garlic Naan', price: 65, emoji: '🫓', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '5-7 min', calories: '180 kcal', description: 'Refined flour leavened flatbread topped with finely minced roasted garlic and fresh coriander, brushed with Amul butter.', ingredients: ['Wheat Flour', 'Garlic', 'Butter', 'Coriander'], allergens: ['Gluten', 'Dairy'], image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { id: 15, restaurant_id: 'res_spice_garden', category_id: 'breads', name: 'Classic Butter Naan', price: 50, emoji: '🫓', dietary: 'veg', available: true, bestseller: false, spice_level: 0, preparation_time: '5-6 min', calories: '160 kcal', description: 'Traditional clay oven baked soft leavened flatbread layered with pure butter.', ingredients: ['Wheat Flour', 'Milk', 'Butter'], allergens: ['Gluten', 'Dairy'], image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { id: 16, restaurant_id: 'res_spice_garden', category_id: 'breads', name: 'Cheese Garlic Naan', price: 85, emoji: '🧀', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '6-8 min', calories: '240 kcal', description: 'Soft naan stuffed with gooey mozzarella cheese and topped with minced roasted garlic.', ingredients: ['Wheat Flour', 'Mozzarella', 'Garlic', 'Butter'], allergens: ['Gluten', 'Dairy'], image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { id: 17, restaurant_id: 'res_spice_garden', category_id: 'breads', name: 'Tandoori Roti (Butter)', price: 35, emoji: '🫓', dietary: 'veg', available: true, bestseller: false, spice_level: 0, preparation_time: '4-5 min', calories: '110 kcal', description: 'Healthy 100% whole wheat flatbread freshly baked in tandoor and brushed with butter.', ingredients: ['Whole Wheat Atta', 'Butter'], allergens: ['Gluten', 'Dairy'], image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { id: 18, restaurant_id: 'res_spice_garden', category_id: 'breads', name: 'Laccha Paratha Pudina', price: 60, emoji: '🫓', dietary: 'veg', available: true, bestseller: false, spice_level: 0, preparation_time: '6-8 min', calories: '190 kcal', description: 'Multi-layered flaky whole wheat bread infused with dried mint leaves and baked crisp.', ingredients: ['Whole Wheat Atta', 'Ghee', 'Pudina'], allergens: ['Gluten', 'Dairy'], image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },

  { id: 19, restaurant_id: 'res_spice_garden', category_id: 'rice', name: 'Hyderabadi Veg Dum Biryani', price: 240, emoji: '🍚', dietary: 'veg', available: true, bestseller: true, spice_level: 2, preparation_time: '16-20 min', calories: '450 kcal', description: 'Long grain aged basmati rice slow cooked with marinated vegetables, saffron milk, fried onions & whole spices in sealed pot.', ingredients: ['Aged Basmati Rice', 'Saffron', 'Brown Onions', 'Veggies'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { id: 20, restaurant_id: 'res_spice_garden', category_id: 'rice', name: 'Paneer Tikka Biryani', price: 280, emoji: '🍛', dietary: 'veg', available: true, bestseller: true, spice_level: 2, preparation_time: '16-20 min', calories: '490 kcal', description: 'Smoky char-grilled paneer tikka layered with spiced saffron basmati rice, caramelized onions, herbs and desi ghee.', ingredients: ['Paneer Tikka', 'Basmati Rice', 'Desi Ghee', 'Biryani Masala'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { id: 21, restaurant_id: 'res_spice_garden', category_id: 'rice', name: 'Jeera Rice with Desi Ghee', price: 130, emoji: '🍚', dietary: 'veg', available: true, bestseller: false, spice_level: 0, preparation_time: '8-10 min', calories: '260 kcal', description: 'Fluffy steamed basmati rice tempered with royal cumin seeds, cloves and aromatic desi cow ghee.', ingredients: ['Basmati Rice', 'Cumin Seeds', 'Desi Ghee'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80' },
  { id: 22, restaurant_id: 'res_spice_garden', category_id: 'rice', name: 'Dal Khichdi Tadkewali', price: 180, emoji: '🍲', dietary: 'veg', available: true, bestseller: false, spice_level: 1, preparation_time: '10-12 min', calories: '310 kcal', description: 'Comforting home-style rice and yellow moong dal cooked with garlic, cumin, red chilli and desi ghee tadka.', ingredients: ['Basmati Tukda', 'Moong Dal', 'Desi Ghee', 'Garlic'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },

  { id: 23, restaurant_id: 'res_spice_garden', category_id: 'drinks', name: 'Alphonso Mango Lassi', price: 99, emoji: '🥭', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '5 min', calories: '220 kcal', description: 'Rich creamy yogurt blended with premium Ratnagiri Alphonso mango pulp, green cardamom and pistachios.', ingredients: ['Fresh Yogurt', 'Alphonso Pulp', 'Cardamom', 'Pistachios'], allergens: ['Dairy', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80' },
  { id: 24, restaurant_id: 'res_spice_garden', category_id: 'drinks', name: 'Masala Chai Pot', price: 45, emoji: '☕', dietary: 'veg', available: true, bestseller: false, spice_level: 0, preparation_time: '5-7 min', calories: '90 kcal', description: 'Freshly brewed aromatic Assam tea infused with crushed ginger, green cardamom, cinnamon & spices.', ingredients: ['Assam Tea', 'Milk', 'Ginger', 'Cardamom'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80' },
  { id: 25, restaurant_id: 'res_spice_garden', category_id: 'drinks', name: 'Fresh Nimbu Shikanji (Soda)', price: 60, emoji: '🍋', dietary: 'vegan', available: true, bestseller: false, spice_level: 0, preparation_time: '4 min', calories: '60 kcal', description: 'Freshly squeezed lemon juice with chilled sparkling soda, roasted cumin, black salt & mint.', ingredients: ['Lemon', 'Soda', 'Black Salt', 'Mint'], allergens: [], image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
  { id: 26, restaurant_id: 'res_spice_garden', category_id: 'drinks', name: 'Cold Coffee with Ice Cream', price: 110, emoji: '🧋', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '5 min', calories: '260 kcal', description: 'Thick creamy blended cold coffee topped with a generous scoop of vanilla ice cream and chocolate drizzle.', ingredients: ['Espresso', 'Milk', 'Vanilla Ice Cream', 'Chocolate'], allergens: ['Dairy'], image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80' },

  { id: 27, restaurant_id: 'res_spice_garden', category_id: 'desserts', name: 'Gulab Jamun with Rabdi (2 Pcs)', price: 120, emoji: '🍮', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '5 min', calories: '310 kcal', description: 'Melt-in-mouth mawa dumplings soaked in saffron-rose syrup, topped with thick Lucknowi malai rabdi.', ingredients: ['Khoya', 'Saffron Syrup', 'Rabdi', 'Almonds'], allergens: ['Dairy', 'Nuts', 'Gluten'], image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80' },
  { id: 28, restaurant_id: 'res_spice_garden', category_id: 'desserts', name: 'Royal Kesar Pista Kulfi', price: 110, emoji: '🍦', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '3 min', calories: '240 kcal', description: 'Traditional slow-reduced dense milk ice cream stick flavored with saffron threads and pistachios.', ingredients: ['Milk', 'Saffron', 'Pistachios', 'Cardamom'], allergens: ['Dairy', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80' },
  { id: 29, restaurant_id: 'res_spice_garden', category_id: 'desserts', name: 'Sizzling Brownie with Vanilla', price: 180, emoji: '🍫', dietary: 'veg', available: true, bestseller: false, spice_level: 0, preparation_time: '8 min', calories: '420 kcal', description: 'Warm walnut chocolate brownie served on a scorching cast iron sizzler platter with vanilla ice cream & hot fudge sauce.', ingredients: ['Dark Chocolate', 'Walnuts', 'Ice Cream', 'Fudge'], allergens: ['Dairy', 'Gluten', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80' },
  { id: 30, restaurant_id: 'res_spice_garden', category_id: 'desserts', name: 'Gajar Ka Halwa Desi Ghee', price: 140, emoji: '🥕', dietary: 'veg', available: true, bestseller: true, spice_level: 0, preparation_time: '5 min', calories: '290 kcal', description: 'Winter special red carrots slow cooked in pure desi ghee, khoya, dry fruits and cardamom.', ingredients: ['Red Carrots', 'Desi Ghee', 'Khoya', 'Cashews'], allergens: ['Dairy', 'Nuts'], image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80' }
];

const SEED_DATA_TABLES = [
  { id: 1, restaurant_id: 'res_spice_garden', table_number: '01', section: 'Indoor AC', capacity: 2, qr_token: 'tok_sg_t01_9821', status: 'OCCUPIED', active_order_id: 'ORD-20261008-1040' },
  { id: 2, restaurant_id: 'res_spice_garden', table_number: '02', section: 'Indoor AC', capacity: 4, qr_token: 'tok_sg_t02_7431', status: 'AVAILABLE', active_order_id: null },
  { id: 3, restaurant_id: 'res_spice_garden', table_number: '03', section: 'Indoor AC', capacity: 4, qr_token: 'tok_sg_t03_5521', status: 'FOOD_READY', active_order_id: 'ORD-20261008-1041' },
  { id: 4, restaurant_id: 'res_spice_garden', table_number: '04', section: 'Indoor AC', capacity: 6, qr_token: 'tok_sg_t04_9921', status: 'AVAILABLE', active_order_id: null },
  { id: 5, restaurant_id: 'res_spice_garden', table_number: '05', section: 'Indoor AC', capacity: 8, qr_token: 'tok_sg_t05_3411', status: 'OCCUPIED', active_order_id: null },
  { id: 6, restaurant_id: 'res_spice_garden', table_number: '06', section: 'Indoor AC', capacity: 4, qr_token: 'tok_sg_t06_8812', status: 'AVAILABLE', active_order_id: null },
  { id: 7, restaurant_id: 'res_spice_garden', table_number: '07', section: 'Indoor AC', capacity: 4, qr_token: 'tok_sg_t07_1943', status: 'OCCUPIED', active_order_id: 'ORD-20261008-1042' },
  { id: 8, restaurant_id: 'res_spice_garden', table_number: '08', section: 'Indoor AC', capacity: 6, qr_token: 'tok_sg_t08_7721', status: 'CLEANING', active_order_id: null },

  { id: 9, restaurant_id: 'res_spice_garden', table_number: '09', section: 'Garden Terrace', capacity: 2, qr_token: 'tok_sg_t09_4431', status: 'AVAILABLE', active_order_id: null },
  { id: 10, restaurant_id: 'res_spice_garden', table_number: '10', section: 'Garden Terrace', capacity: 4, qr_token: 'tok_sg_t10_8842', status: 'AVAILABLE', active_order_id: null },
  { id: 11, restaurant_id: 'res_spice_garden', table_number: '11', section: 'Garden Terrace', capacity: 6, qr_token: 'tok_sg_t11_6621', status: 'OCCUPIED', active_order_id: 'ORD-20261008-1038' },
  { id: 12, restaurant_id: 'res_spice_garden', table_number: '12', section: 'Garden Terrace', capacity: 4, qr_token: 'tok_sg_t12_9910', status: 'AVAILABLE', active_order_id: null },
  { id: 13, restaurant_id: 'res_spice_garden', table_number: '13', section: 'Garden Terrace', capacity: 4, qr_token: 'tok_sg_t13_1123', status: 'AVAILABLE', active_order_id: null },
  { id: 14, restaurant_id: 'res_spice_garden', table_number: '14', section: 'Garden Terrace', capacity: 6, qr_token: 'tok_sg_t14_5541', status: 'OCCUPIED', active_order_id: null },
  { id: 15, restaurant_id: 'res_spice_garden', table_number: '15', section: 'Garden Terrace', capacity: 2, qr_token: 'tok_sg_t15_8819', status: 'AVAILABLE', active_order_id: null },
  { id: 16, restaurant_id: 'res_spice_garden', table_number: '16', section: 'Garden Terrace', capacity: 8, qr_token: 'tok_sg_t16_3391', status: 'AVAILABLE', active_order_id: null },

  { id: 17, restaurant_id: 'res_spice_garden', table_number: '17', section: 'Family Lounge', capacity: 8, qr_token: 'tok_sg_t17_7712', status: 'AVAILABLE', active_order_id: null },
  { id: 18, restaurant_id: 'res_spice_garden', table_number: '18', section: 'Family Lounge', capacity: 10, qr_token: 'tok_sg_t18_8832', status: 'OCCUPIED', active_order_id: null },
  { id: 19, restaurant_id: 'res_spice_garden', table_number: '19', section: 'Family Lounge', capacity: 6, qr_token: 'tok_sg_t19_1192', status: 'AVAILABLE', active_order_id: null },
  { id: 20, restaurant_id: 'res_spice_garden', table_number: '20', section: 'Family Lounge', capacity: 8, qr_token: 'tok_sg_t20_4491', status: 'AVAILABLE', active_order_id: null },
  { id: 21, restaurant_id: 'res_spice_garden', table_number: '21', section: 'Family Lounge', capacity: 12, qr_token: 'tok_sg_t21_6623', status: 'AVAILABLE', active_order_id: null },

  { id: 22, restaurant_id: 'res_spice_garden', table_number: '22', section: 'Banquet Hall', capacity: 10, qr_token: 'tok_sg_t22_8891', status: 'AVAILABLE', active_order_id: null },
  { id: 23, restaurant_id: 'res_spice_garden', table_number: '23', section: 'Banquet Hall', capacity: 10, qr_token: 'tok_sg_t23_9934', status: 'AVAILABLE', active_order_id: null },
  { id: 24, restaurant_id: 'res_spice_garden', table_number: '24', section: 'Banquet Hall', capacity: 12, qr_token: 'tok_sg_t24_1187', status: 'AVAILABLE', active_order_id: null },
  { id: 25, restaurant_id: 'res_spice_garden', table_number: '25', section: 'Banquet Hall', capacity: 16, qr_token: 'tok_sg_t25_4476', status: 'AVAILABLE', active_order_id: null }
];

const SEED_DATA_COUPONS = [
  { id: 'c1', restaurant_id: 'res_spice_garden', code: 'WELCOME50', discount_type: 'FLAT', discount_value: 50, minimum_order: 299, maximum_discount: 50, active: true },
  { id: 'c2', restaurant_id: 'res_spice_garden', code: 'SPICE20', discount_type: 'PERCENTAGE', discount_value: 20, minimum_order: 499, maximum_discount: 150, active: true },
  { id: 'c3', restaurant_id: 'res_spice_garden', code: 'FEAST100', discount_type: 'FLAT', discount_value: 100, minimum_order: 799, maximum_discount: 100, active: true },
  { id: 'c4', restaurant_id: 'res_spice_garden', code: 'FAMILY15', discount_type: 'PERCENTAGE', discount_value: 15, minimum_order: 999, maximum_discount: 250, active: true }
];

const SEED_DATA_ORDERS = [
  {
    id: 'ORD-20261008-1038',
    restaurant_id: 'res_spice_garden',
    table_number: '11',
    order_number: 'ORD-1038',
    status: 'SERVED',
    customer_name: 'Sharma Family',
    customer_phone: '9822011223',
    coupon_code: 'FAMILY15',
    subtotal: 1870,
    discount: 250,
    taxable_amount: 1620,
    gst: 81,
    service_charge: 81,
    total: 1782,
    payment_status: 'PENDING',
    payment_method: 'UPI',
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD-20261008-1040',
    restaurant_id: 'res_spice_garden',
    table_number: '01',
    order_number: 'ORD-1040',
    status: 'PREPARING',
    customer_name: 'Rohan Deshmukh',
    customer_phone: '',
    coupon_code: 'WELCOME50',
    subtotal: 479,
    discount: 50,
    taxable_amount: 429,
    gst: 21.45,
    service_charge: 21.45,
    total: 472,
    payment_status: 'PENDING',
    payment_method: 'CASH',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD-20261008-1041',
    restaurant_id: 'res_spice_garden',
    table_number: '03',
    order_number: 'ORD-1041',
    status: 'READY',
    customer_name: 'Pooja Mehta',
    customer_phone: '9890123456',
    coupon_code: '',
    subtotal: 600,
    discount: 0,
    taxable_amount: 600,
    gst: 30,
    service_charge: 30,
    total: 660,
    payment_status: 'PENDING',
    payment_method: 'UPI',
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD-20261008-1042',
    restaurant_id: 'res_spice_garden',
    table_number: '07',
    order_number: 'ORD-1042',
    status: 'PENDING',
    customer_name: 'Anand Verma',
    customer_phone: '',
    coupon_code: 'SPICE20',
    subtotal: 705,
    discount: 141,
    taxable_amount: 564,
    gst: 28.2,
    service_charge: 28.2,
    total: 620,
    payment_status: 'PENDING',
    payment_method: 'UPI',
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  }
];

const SEED_DATA_ORDER_ITEMS = [
  { id: 'oi_1', order_id: 'ORD-20261008-1038', menu_item_id: 2, name: 'Tandoori Paneer Tikka', quantity: 2, unit_price: 240, special_instructions: 'Extra spicy with mint dip', total: 480 },
  { id: 'oi_2', order_id: 'ORD-20261008-1038', menu_item_id: 8, name: 'Paneer Butter Masala', quantity: 2, unit_price: 260, special_instructions: 'Less sweet please', total: 520 },
  { id: 'oi_3', order_id: 'ORD-20261008-1038', menu_item_id: 14, name: 'Butter Garlic Naan', quantity: 6, unit_price: 65, special_instructions: 'Crispy', total: 390 },
  { id: 'oi_4', order_id: 'ORD-20261008-1038', menu_item_id: 19, name: 'Hyderabadi Veg Dum Biryani', quantity: 2, unit_price: 240, special_instructions: '', total: 480 },

  { id: 'oi_5', order_id: 'ORD-20261008-1040', menu_item_id: 1, name: 'Crispy Veg Samosa (2 Pcs)', quantity: 1, unit_price: 70, special_instructions: '', total: 70 },
  { id: 'oi_6', order_id: 'ORD-20261008-1040', menu_item_id: 7, name: 'Dal Makhani Bukhara Style', quantity: 1, unit_price: 210, special_instructions: 'Extra butter on top', total: 210 },
  { id: 'oi_7', order_id: 'ORD-20261008-1040', menu_item_id: 15, name: 'Classic Butter Naan', quantity: 2, unit_price: 50, special_instructions: '', total: 100 },
  { id: 'oi_8', order_id: 'ORD-20261008-1040', menu_item_id: 23, name: 'Alphonso Mango Lassi', quantity: 1, unit_price: 99, special_instructions: 'Chilled', total: 99 },

  { id: 'oi_9', order_id: 'ORD-20261008-1041', menu_item_id: 2, name: 'Tandoori Paneer Tikka', quantity: 1, unit_price: 240, special_instructions: 'Less spicy', total: 240 },
  { id: 'oi_10', order_id: 'ORD-20261008-1041', menu_item_id: 19, name: 'Hyderabadi Veg Dum Biryani', quantity: 1, unit_price: 240, special_instructions: 'Double Raita', total: 240 },
  { id: 'oi_11', order_id: 'ORD-20261008-1041', menu_item_id: 27, name: 'Gulab Jamun with Rabdi (2 Pcs)', quantity: 1, unit_price: 120, special_instructions: '', total: 120 },

  { id: 'oi_12', order_id: 'ORD-20261008-1042', menu_item_id: 4, name: 'Dahi Puri Chaat (6 Pcs)', quantity: 2, unit_price: 130, special_instructions: 'Extra sev on side', total: 260 },
  { id: 'oi_13', order_id: 'ORD-20261008-1042', menu_item_id: 11, name: 'Kadhai Paneer Special', quantity: 1, unit_price: 250, special_instructions: 'Very spicy', total: 250 },
  { id: 'oi_14', order_id: 'ORD-20261008-1042', menu_item_id: 14, name: 'Butter Garlic Naan', quantity: 3, unit_price: 65, special_instructions: 'Well done', total: 195 }
];

class StateManager {
  constructor() {
    this.events = {};
    this.activeRestaurantId = 'res_spice_garden';
    this.activeTable = '12';
    this.activeRole = 'customer';
    this.activeCoupon = null;
    this.activeOrderId = 'ORD-20261008-1042';

    // UI Transient Cache (Cart & Theme only)
    this.cart = StorageService.get('CART', {});
    this.theme = StorageService.get('THEME', 'light');

    // In-memory relational mirrors (hydrated asynchronously from PostgreSQL engine)
    this.restaurants = SEED_DATA_RESTAURANTS;
    this.settings = SEED_DATA_SETTINGS[0];
    this.menu = SEED_DATA_MENU;
    this.categories = SEED_DATA_CATEGORIES;
    this.tables = SEED_DATA_TABLES;
    this.orders = SEED_DATA_ORDERS;
    this.coupons = SEED_DATA_COUPONS;
    this.staff = SEED_DATA_PROFILES;
  }

  async init() {
    // Initialize Database Engine with full relational seed dataset
    await dbEngine.init({
      restaurants: SEED_DATA_RESTAURANTS,
      restaurant_settings: SEED_DATA_SETTINGS,
      profiles: SEED_DATA_PROFILES,
      categories: SEED_DATA_CATEGORIES,
      menu_items: SEED_DATA_MENU,
      restaurant_tables: SEED_DATA_TABLES,
      orders: SEED_DATA_ORDERS,
      order_items: SEED_DATA_ORDER_ITEMS,
      coupons: SEED_DATA_COUPONS
    });

    // Realtime Database Subscriptions
    RestaurantAPI.subscribeToOrders((evt) => {
      this.refreshOrders();
    });

    RestaurantAPI.subscribeToTables((evt) => {
      this.refreshTables();
    });

    RestaurantAPI.subscribeToMenu((evt) => {
      this.refreshMenu();
    });

    await this.syncFromDatabase();
  }

  async syncFromDatabase() {
    const res = await RestaurantAPI.getRestaurant(this.activeRestaurantId);
    if (res) {
      this.restaurants = await dbEngine.selectRestaurants();
    }
    this.menu = await RestaurantAPI.getMenu(this.activeRestaurantId);
    this.categories = await RestaurantAPI.getCategories(this.activeRestaurantId);
    this.tables = await RestaurantAPI.getTables(this.activeRestaurantId);
    this.orders = await RestaurantAPI.getRestaurantOrders(this.activeRestaurantId);
    this.settings = await RestaurantAPI.getSettings(this.activeRestaurantId);
  }

  async refreshOrders() {
    this.orders = await RestaurantAPI.getRestaurantOrders(this.activeRestaurantId);
    this.emit('orders:updated', this.orders);
  }

  async refreshTables() {
    this.tables = await RestaurantAPI.getTables(this.activeRestaurantId);
    this.emit('tables:updated', this.tables);
  }

  async refreshMenu() {
    this.menu = await RestaurantAPI.getMenu(this.activeRestaurantId);
    this.emit('menu:updated', this.menu);
  }

  getCurrentRestaurant() {
    const r = this.restaurants.find(res => res.id === this.activeRestaurantId) || this.restaurants[0];
    const s = this.settings || SEED_DATA_SETTINGS[0];
    return {
      ...r,
      tax: {
        gstRate: s.gst_percentage || 5,
        serviceChargeRate: s.service_charge_percentage || 5,
        enableGst: s.enable_gst !== false,
        enableServiceCharge: s.enable_service_charge !== false
      },
      settings: s
    };
  }

  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(`[State Event Error: ${event}]`, e); }
      });
    }
  }

  setActiveRestaurant(resId) {
    this.activeRestaurantId = resId;
    RestaurantAPI.setActiveRestaurant(resId);
    this.syncFromDatabase().then(() => {
      this.emit('restaurant:changed', this.getCurrentRestaurant());
    });
  }

  setActiveTable(tableNo) {
    this.activeTable = String(tableNo).padStart(2, '0');
    this.emit('table:selected', this.activeTable);
  }

  setActiveRole(roleId) {
    this.activeRole = roleId;
    this.emit('role:changed', this.activeRole);
  }

  setTheme(theme) {
    this.theme = theme;
    StorageService.set('THEME', this.theme);
    this.emit('theme:changed', this.theme);
  }

  saveCart(newCart) {
    this.cart = newCart;
    StorageService.set('CART', this.cart);
    this.emit('cart:updated', this.cart);
  }

  setActiveCoupon(coupon) {
    this.activeCoupon = coupon;
    this.emit('coupon:applied', this.activeCoupon);
  }

  setActiveOrderId(orderId) {
    this.activeOrderId = orderId;
    this.emit('order:active_changed', this.activeOrderId);
  }

  getStaff() {
    return this.staff;
  }

  async saveStaff(updatedStaff) {
    this.staff = updatedStaff;
    if (typeof dbEngine !== 'undefined') {
      dbEngine.tables.profiles = JSON.parse(JSON.stringify(updatedStaff));
    }
    this.emit('staff:updated', this.staff);
  }

  async saveMenu(updatedMenu) {
    this.menu = updatedMenu;
    if (typeof dbEngine !== 'undefined') {
      dbEngine.tables.menu_items = JSON.parse(JSON.stringify(updatedMenu));
    }
    this.emit('menu:updated', this.menu);
  }

  async saveTables(updatedTables) {
    this.tables = updatedTables;
    if (typeof dbEngine !== 'undefined') {
      dbEngine.tables.restaurant_tables = JSON.parse(JSON.stringify(updatedTables));
    }
    this.emit('tables:updated', this.tables);
  }

  async saveCategories(updatedCats) {
    this.categories = updatedCats;
    if (typeof dbEngine !== 'undefined') {
      dbEngine.tables.categories = JSON.parse(JSON.stringify(updatedCats));
    }
    this.emit('categories:updated', this.categories);
  }

  async saveCoupons(updatedCoupons) {
    this.coupons = updatedCoupons;
    if (typeof dbEngine !== 'undefined') {
      dbEngine.tables.coupons = JSON.parse(JSON.stringify(updatedCoupons));
    }
    this.emit('coupons:updated', this.coupons);
  }

  async updateRestaurant(restaurantId, updatedData) {
    const updated = await RestaurantAPI.updateRestaurant(restaurantId, updatedData);
    if (updatedData.tax || updatedData.settings) {
      await RestaurantAPI.updateSettings(restaurantId, {
        gst_percentage: updatedData.tax ? updatedData.tax.gstRate : 5,
        service_charge_percentage: updatedData.tax ? updatedData.tax.serviceChargeRate : 5,
        enable_gst: updatedData.tax ? updatedData.tax.enableGst : true,
        enable_service_charge: updatedData.tax ? updatedData.tax.enableServiceCharge : true,
        sound_alerts: updatedData.settings ? updatedData.settings.soundAlerts : true
      });
    }
    await this.syncFromDatabase();
    this.emit('restaurant:updated', this.getCurrentRestaurant());
    return updated;
  }

  async updateOrderStatus(orderId, newStatus) {
    const updated = await RestaurantAPI.updateOrderStatus(orderId, newStatus);
    await this.refreshOrders();
    await this.refreshTables();
    return updated;
  }

  async updateTableStatus(tableId, newStatus, activeOrderId = null) {
    const table = this.tables.find(t => t.id === tableId);
    if (table) {
      const updated = await RestaurantAPI.updateTableStatus(table.table_number || table.number, newStatus, activeOrderId);
      await this.refreshTables();
      return updated;
    }
  }
}

const appState = new StateManager();
