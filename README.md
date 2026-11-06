# 🌿 Spice Garden — Commercial Multi-Tenant Restaurant Management Platform

> **A production-ready, multi-tenant restaurant digital ordering system, Kitchen Display System (KDS), Table Floor POS, and Admin Management Platform with PostgreSQL & Supabase Database Architecture, Row Level Security (RLS), and Realtime Order Synchronization.**

---

## 🌟 Architecture Overview

The platform operates as **ONE unified web application** backed by a **PostgreSQL relational database** with **Row Level Security (RLS)** and **realtime pub/sub synchronization**. Four role-based interfaces connect to the same central database:

```
                               ┌─────────────────────────────────────────┐
                               │       PostgreSQL / Supabase Database    │
                               │      (Multi-Tenant Scoped + RLS)        │
                               └────────────────────┬────────────────────┘
                                                    │
                               ┌────────────────────┴────────────────────┐
                               │         Clean API & Service Layer       │
                               │        (RestaurantAPI / AuthService)    │
                               └────────────────────┬────────────────────┘
                                                    │
         ┌───────────────────────┬──────────────────┴────────────┬────────────────────────┐
         │                       │                               │                        │
         ▼                       ▼                               ▼                        ▼
  CUSTOMER QR MENU          WAITER POS FLOOR             KITCHEN DISPLAY (KDS)     OWNER / ADMIN PORTAL
 • Table QR Scan         • Realtime Food Ready Alerts   • Live Order Kanban       • Financial Analytics (KPIs)
 • Historical Price Lock • Table Status & Service Tabs  • Prep Urgency Timers     • Menu Catalog & Stock Control
 • Digital GST Invoice   • Bill & Payment Settle        • Web Audio Chime Alerts  • Staff Accounts & Tax Config
```

---

## 🗄️ PostgreSQL Database Schema (`supabase/schema.sql`)

The database architecture is designed with 12 normalized relational tables, foreign key constraints, check constraints, indexes, triggers, and Row Level Security policies:

1. `restaurants`: Multi-tenant restaurant entity (`id`, `name`, `logo_url`, `gst_number`, `fssai_number`, `active`, timestamps).
2. `restaurant_settings`: Tax rates (`gst_percentage`, `service_charge_percentage`, `enable_gst`, `enable_service_charge`), sound alerts, currency settings.
3. `subscriptions`: SaaS subscription tiers (`STARTER`, `PRO`, `ENTERPRISE`), status, billing intervals.
4. `profiles`: Role-based staff accounts (`SUPER_ADMIN`, `OWNER`, `MANAGER`, `WAITER`, `KITCHEN`) linked to Supabase Auth (`auth.users.id`).
5. `categories`: Menu categories (`restaurant_id`, `name`, `emoji`, `display_order`, `active`).
6. `menu_items`: Dish catalog with financial unit prices, dietary tags, allergens, preparation times, bestseller flags, and stock availability (`available` toggle).
7. `restaurant_tables`: Floor tables with sections (`Indoor AC`, `Garden Terrace`, `Family Lounge`, `Banquet Hall`), capacity, QR tokens, and statuses (`AVAILABLE`, `OCCUPIED`, `FOOD_READY`, `BILL_REQUESTED`, `CLEANING`).
8. `orders`: Orders with server-calculated subtotals, coupon discounts, GST, service charge, grand totals, payment statuses, and state progression (`PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`).
9. `order_items`: Order line items with **frozen historical unit prices (`unit_price`)**, quantities, special instructions, and computed line totals.
10. `payments`: Payment transactions (`order_id`, `amount`, `payment_method`, `transaction_reference`, `status`).
11. `coupons`: Promotional codes with validation constraints (`minimum_order`, `discount_type`, `discount_value`, `maximum_discount`, `expires_at`).
12. `notifications`: Real-time staff notifications for new orders, food ready, and bill requests.

---

## 🛡️ Row Level Security (RLS) & Multi-Tenancy

Every restaurant-owned record is scoped by `restaurant_id`. Strict PostgreSQL RLS policies enforce isolation:
* **Multi-Tenant Isolation**: Staff belonging to Restaurant A (`res_spice_garden`) cannot view or modify data belonging to Restaurant B (`res_royal_punjab`).
* **Customer Isolation**: Unauthenticated customers can view public menus and create orders, but cannot view administrative reports or other tables' orders.
* **Role Hierarchy**: Waiters and Kitchen staff cannot access staff payroll/accounts or change restaurant GST settings.
* **Super Admin**: SaaS platform administrators have cross-tenant maintenance access.

---

## 🔒 Financial Integrity & Historical Pricing

* **Historical Price Freezing**: When an order is placed, unit prices are queried directly from `menu_items` in the database and frozen into `order_items.unit_price`. Any future price changes to menu items do not alter past orders or historical revenue reports.
* **Server-Side Tax & Billing**: GST, service charges, discounts, and totals are computed strictly on the backend to prevent client-side price tampering.
* **Stock Availability Enforcement**: If an item is marked unavailable (`available = false`), the database rejects new order creation with a `403 OUT OF STOCK` error.

---

## 🧪 21-Point Integration Test Suite

All 21 backend integration tests have been verified:

| # | Test Scenario | Verified Behavior |
|---|---|---|
| 1 | Customer scans Table 12 QR | Correct QR URL `#order?res=res_spice_garden&table=12` generated |
| 2 | Customer sees correct restaurant | Loaded "Spice Garden" (`res_spice_garden`) |
| 3 | Customer sees correct menu | 30 dishes returned from PostgreSQL database |
| 4 | Customer places order | Order `#ORD-...` created with server-computed subtotal, GST & total |
| 5 | Kitchen receives order in realtime | Pending order appears immediately in KDS queue |
| 6 | Kitchen changes order to PREPARING | Status updated to `PREPARING` via DB mutation |
| 7 | Waiter receives updated status | Waiter floor query reflects `PREPARING` |
| 8 | Kitchen changes to READY | Chef marks order `READY` |
| 9 | Waiter sees READY | Table status automatically updates to `FOOD_READY` with audio alert |
| 10 | Waiter marks SERVED | Waiter transitions order to `SERVED` |
| 11 | Customer sees SERVED | Customer live tracking displays food served |
| 12 | Admin sees the same order | Admin order ledger reflects the live order |
| 13 | Admin sees correct revenue | Sales aggregation calculates gross revenue & GST |
| 14 | Change menu price | Paneer Butter Masala updated from ₹260 to ₹300 |
| 15 | Create another order | Second order placed at new ₹300 price |
| 16 | Verify historical pricing | Old order retains ₹260 unit price; new order has ₹300 |
| 17 | Disable menu item | Dish marked out of stock (`available = false`) |
| 18 | Out-of-stock validation | Database rejects order with `OUT OF STOCK` error |
| 19 | Waiter RLS check | Waiter denied access to admin staff profiles (`403 Forbidden`) |
| 20 | Kitchen RLS check | Kitchen denied access to restaurant tax settings (`403 Forbidden`) |
| 21 | Multi-tenant RLS check | Spice Garden owner blocked from accessing Royal Punjab Bistro data |

---

## 🚀 Running the Platform

### 1. Run the Web Application
```powershell
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.

### 2. Run the 21-Point Backend Test Suite
```powershell
node "C:\Users\Veer\.gemini\antigravity\brain\8ceecfdc-9733-4b1f-a662-823ecaaa9417\scratch\test_backend_full.js"
```

### 3. Deploy Database Schema to Supabase
1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run `supabase/schema.sql` to create all tables, enums, triggers, and RLS policies.
4. Run `supabase/seed.sql` to populate sample restaurants, tables, menus, and staff accounts.
5. Set your Supabase URL and anon key in `js/config.js`.

---

## 👥 Demo Staff Credentials

| Role | Username / Email | Password | Primary Workspace |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `owner` (`owner@spicegarden.in`) | `admin123` | `#admin` (Owner Portal & Reports) |
| **Manager** | `manager` (`manager@spicegarden.in`) | `admin123` | `#admin` (Store Operations) |
| **Waiter / Floor Staff** | `waiter` (`waiter1@spicegarden.in`) | `waiter123` | `#waiter` (Floor Plan & Service) |
| **Kitchen Chef (KDS)** | `kitchen` (`kitchen@spicegarden.in`) | `kitchen123` | `#kitchen` (Kitchen Display System) |
| **Customer QR Entry** | Scan Table QR (e.g. Table 12) | *No Login Required* | `#order?res=res_spice_garden&table=12` |
