# Slider Management - Backend API Specification

## Overview
The slider management system allows admins to control which products appear in the homepage slider carousel. Products can be reordered, hidden/shown, and removed from the slider.

## Database Schema

### Table: sliders
```sql
CREATE TABLE sliders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sliders_order ON sliders(order);
CREATE INDEX idx_sliders_product_id ON sliders(product_id);
CREATE UNIQUE INDEX idx_sliders_product_unique ON sliders(product_id);
```

## API Endpoints

### 1. Get All Slider Items
**Endpoint:** `GET /slider/all`

**Authentication:** Required (JWT)

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "product_id": "650e8400-e29b-41d4-a716-446655440001",
    "product": {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "name": "Gaming Laptop",
      "description": "High-performance laptop for gaming",
      "price": 1299.99,
      "discount": 10,
      "image_url": "https://cloudinary.com/...",
      "category_id": "750e8400-e29b-41d4-a716-446655440002"
    },
    "order": 1,
    "is_active": true,
    "created_at": "2025-11-18T10:30:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid token

---

### 2. Add Product to Slider
**Endpoint:** `POST /slider/add`

**Authentication:** Required (JWT - Admin only)

**Request Body:**
```json
{
  "product_id": "650e8400-e29b-41d4-a716-446655440001",
  "order": 1
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "product_id": "650e8400-e29b-41d4-a716-446655440001",
  "order": 1,
  "is_active": true,
  "created_at": "2025-11-18T10:30:00Z"
}
```

**Status Codes:**
- `201 Created` - Successfully added
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `409 Conflict` - Product already in slider

---

### 3. Update Slider Item
**Endpoint:** `PUT /slider/{id}`

**Authentication:** Required (JWT - Admin only)

**URL Parameters:**
- `id` - Slider item UUID

**Request Body:**
```json
{
  "order": 2,
  "is_active": false
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "product_id": "650e8400-e29b-41d4-a716-446655440001",
  "order": 2,
  "is_active": false,
  "updated_at": "2025-11-18T11:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Successfully updated
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Slider item not found

---

### 4. Remove Product from Slider
**Endpoint:** `DELETE /slider/{id}`

**Authentication:** Required (JWT - Admin only)

**URL Parameters:**
- `id` - Slider item UUID

**Response:**
```json
{
  "message": "Slider item deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Successfully deleted
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Slider item not found

---

## Frontend Component Features

### Slider Management Page (`/slider`)

**Features:**
- Display all products in slider with order position
- Show product image, name, description, price, and discount
- Add new products to slider via modal selection
- Remove products from slider with confirmation
- Toggle visibility (hide/show) without removing
- Drag-to-reorder functionality (optional future enhancement)
- Real-time updates using TanStack Query

**UI Elements:**
- Ordered list showing slider items
- "Add Product" button opens selection modal
- Product cards show:
  - Order number (1, 2, 3...)
  - Product image (80x80px thumbnail)
  - Product name
  - Description (truncated to 2 lines)
  - Price and discount percentage
- Action buttons:
  - Eye icon: Toggle visibility
  - Trash icon: Remove from slider

**Behavior:**
- Automatically reassign order when items are deleted
- Only one slider item per product (unique constraint)
- Inactive items still appear in list but marked as hidden
- Changes persist immediately after action

---

## Notes for Backend Developer

1. **Unique Constraint:** Each product can only appear once in the slider
2. **Order Management:** When a product is deleted from slider, consider whether to auto-reorder remaining items
3. **Visibility:** The `is_active` field controls whether the item shows in the public slider (frontend should filter by this)
4. **Pagination:** For large slider lists, consider adding limit/offset pagination
5. **Caching:** Consider caching the slider endpoint as it's called frequently by frontend users
6. **Admin Check:** All write operations require admin authentication verification
7. **Product Validation:** Verify product exists before adding to slider
8. **Relationship:** Slider items are deleted when product is deleted (CASCADE on foreign key)
