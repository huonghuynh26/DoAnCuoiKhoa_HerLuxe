# Resource contracts

The JSON files in `json/` are the editable seed contracts for the local app and can also be used when creating resources in a Mock API:

- `products.json` → `products`
- `collections.json` → `collections`
- `users.json` → `users`
- `orders.json` → `orders`

The storefront reads the JSON as seed data, then writes CRUD changes to localStorage. The users resource can additionally be read from the endpoint configured in `src/resources/api.js`.
