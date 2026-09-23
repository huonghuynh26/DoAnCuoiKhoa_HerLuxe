# Resource format

When creating a resource in a Mock API, use the matching resource name and paste the array from the related JSON file inside your `root.items` collection.

```json
{
  "root": {
    "items": [
      { "id": "cloud-cream", "name": "Cloud cream", "price": 28 }
    ]
  }
}
```

The local app accepts the plain array files as seed data and stores changes in localStorage.
