# HerLuxe React + Vite — Role-aware local storefront

This project is the local React/Vite version of HerLuxe. It keeps the original visual language and assets, while adding a strict customer/admin separation.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Demo accounts

| Role | Email | Password | Access |
|---|---|---|---|
| Customer | `won@example.com` | `customer123` | Storefront, profile, bag and checkout demo |
| Admin | `admin@herluxe.local` | `admin123` | Admin console only |

Change these demo records in `src/resources/json/users.json` or use your users resource from Postman/MindX.

## Behaviour rules

- A signed-out visitor can browse products but cannot add anything to the bag. The Add button takes them to sign in.
- Customers can use the bag, update quantities, view their profile and edit their personal details.
- Admin sign-in redirects to `/admin`.
- Admin navigation intentionally has no shopping bag, product search or purchase controls.
- Admin product cards show `Admin view only`; admin can manage inventory, orders, accounts and resource JSON from the console.
- `/admin` is protected by a role guard. A customer cannot open it.
- `/profile` is protected by an authentication guard.

## Postman / MindX users resource

The users API adapter is in `src/resources/api.js`. It keeps the existing endpoint contract and supports an environment override:

```bash
cp .env.example .env
# Set VITE_MINDX_USERS_API_URL to your users resource endpoint
```

Login and registration try the remote users resource first, merge it with the local demo accounts when password fields are missing, and fall back to localStorage when the endpoint is unavailable. This makes local development safe without removing your Postman integration.

## Structure

```text
src/components/AuthContext.jsx   # session, role and profile state
src/components/CartContext.jsx   # customer-only bag state
src/resources/api.js             # Postman/MindX users resource adapter
src/resources/mockStore.js       # local resource cache and fallbacks
src/resources/json/              # editable products/users/orders/collections data
src/pages/Admin.jsx              # admin-only management console
src/pages/Profile.jsx             # authenticated customer/admin profile
src/styles/app.css               # responsive premium layer
vite.config.js                    # allows the local preview host
```
