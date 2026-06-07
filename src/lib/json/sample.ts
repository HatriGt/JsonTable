export const SAMPLE_JSON = `{
  "id": "usr_94821",
  "isActive": true,
  "profile": {
    "firstName": "Alex",
    "lastName": "Rivera",
    "roles": ["administrator", "developer"]
  },
  "contact": {
    "email": "alex.rivera@example.com",
    "address": {
      "street": "742 Evergreen Terrace",
      "city": "Springfield",
      "zipCode": "97477"
    }
  },
  "orders": [
    {
      "orderId": "ord_001",
      "total": 89.99,
      "status": "shipped",
      "items": ["book", "desk_lamp"]
    },
    {
      "orderId": "ord_002",
      "total": 14.5,
      "status": "processing",
      "items": ["pen_set"]
    },
    {
      "orderId": "ord_003",
      "total": 249.0,
      "status": "delivered",
      "items": ["headphones", "cable", "case"]
    },
    {
      "orderId": "ord_004",
      "total": 32.75,
      "status": "shipped",
      "items": ["notebook", "pen_set"]
    }
  ]
}
`;