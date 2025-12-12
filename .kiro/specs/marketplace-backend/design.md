# Design Document

## Overview

The Acad Swap marketplace backend provides a comprehensive data model to support item listings, transactions, user reputation, social connections, and activity notifications. The design focuses on a relational database schema using PostgreSQL (Supabase) with proper foreign key relationships, indexes for performance, and Row Level Security (RLS) policies for data protection.

## Architecture

The system uses a PostgreSQL database hosted on Supabase with the following architectural principles:

- **Relational Data Model**: Tables with foreign key constraints ensure referential integrity
- **Row Level Security**: Supabase RLS policies control data access at the database level
- **Timestamps**: All tables include created_at and updated_at for audit trails
- **Soft Deletes**: Critical data uses status flags rather than hard deletes to preserve history
- **Indexes**: Strategic indexes on foreign keys and frequently queried columns for performance

## Components and Interfaces

### Database Tables

The system consists of the following core tables:

1. **users** (existing) - User account information
2. **items** - Product listings
3. **transactions** - Completed sales
4. **ratings** - Seller reputation ratings
5. **notifications** - Activity feed
6. **friendships** - User connections

### Table Relationships

```
users (1) ----< (many) items [seller_id]
users (1) ----< (many) transactions [buyer_id]
users (1) ----< (many) transactions [seller_id]
users (1) ----< (many) ratings [rated_user_id]
users (1) ----< (many) ratings [rater_id]
users (1) ----< (many) notifications [user_id]
users (1) ----< (many) friendships [user_id]
users (1) ----< (many) friendships [friend_id]
items (1) ----< (1) transactions [item_id]
transactions (1) ----< (1) ratings [transaction_id]
```

## Data Models

### Items Table

Stores product listings created by sellers.

```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    images TEXT[], -- Array of image URLs
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_items_seller_id ON items(seller_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
```

**Fields:**
- `id`: Unique identifier
- `seller_id`: Foreign key to users table
- `title`: Item name (max 255 chars)
- `description`: Detailed item description
- `price`: Item price in Philippine Pesos (non-negative)
- `category`: Product category (e.g., "Textbooks", "Electronics")
- `condition`: Item condition (e.g., "New", "Like New", "Used")
- `images`: Array of image URLs stored as text array
- `status`: Listing status (active/sold/inactive)
- `view_count`: Number of times item was viewed
- `created_at`: Timestamp when item was listed
- `updated_at`: Timestamp of last modification

### Transactions Table

Records completed sales between buyers and sellers.

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_item_id ON transactions(item_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

**Fields:**
- `id`: Unique identifier
- `item_id`: Foreign key to items table (RESTRICT prevents deletion of sold items)
- `buyer_id`: Foreign key to users table (buyer)
- `seller_id`: Foreign key to users table (seller)
- `price`: Final sale price
- `status`: Transaction status (completed/cancelled)
- `created_at`: Timestamp when transaction occurred
- `updated_at`: Timestamp of last modification

### Ratings Table

Stores buyer ratings of sellers after transactions.

```sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_transaction_id ON ratings(transaction_id);
```

**Fields:**
- `id`: Unique identifier
- `transaction_id`: Foreign key to transactions table (UNIQUE ensures one rating per transaction)
- `rated_user_id`: User being rated (seller)
- `rater_id`: User giving the rating (buyer)
- `rating`: Star rating from 1 to 5
- `comment`: Optional text feedback
- `created_at`: Timestamp when rating was submitted
- `updated_at`: Timestamp of last modification

### Notifications Table

Stores activity notifications for users.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('view', 'message', 'sale', 'purchase', 'rating', 'friend_request')),
    message TEXT NOT NULL,
    related_id UUID, -- ID of related entity (item, transaction, user, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users table (notification recipient)
- `type`: Notification category
- `message`: Human-readable notification text
- `related_id`: Optional UUID linking to related entity
- `is_read`: Whether user has read the notification
- `read_at`: Timestamp when notification was read
- `created_at`: Timestamp when notification was created

### Friendships Table

Manages bidirectional friend connections between users.

```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: User who initiated the friendship
- `friend_id`: User who received the friendship request
- `status`: Friendship state (pending/active/blocked)
- `created_at`: Timestamp when friendship was created
- `updated_at`: Timestamp of last modification
- **Constraints:**
  - `no_self_friendship`: Prevents users from friending themselves
  - `unique_friendship`: Ensures only one friendship record per user pair

### Database Functions and Triggers

#### Auto-update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Calculate User Statistics

```sql
-- Function to get user's reputation score
CREATE OR REPLACE FUNCTION get_user_reputation(user_uuid UUID)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
    avg_rating DECIMAL(3, 2);
BEGIN
    SELECT COALESCE(AVG(rating), 0.0)
    INTO avg_rating
    FROM ratings
    WHERE rated_user_id = user_uuid;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's total earnings
CREATE OR REPLACE FUNCTION get_user_earnings(user_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(price), 0.0)
    INTO total
    FROM transactions
    WHERE seller_id = user_uuid AND status = 'completed';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's sold items count
CREATE OR REPLACE FUNCTION get_sold_items_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM transactions
    WHERE seller_id = user_uuid AND status = 'completed';
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active listings count
CREATE OR REPLACE FUNCTION get_active_listings_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM items
    WHERE seller_id = user_uuid AND status = 'active';
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's friends count
CREATE OR REPLACE FUNCTION get_friends_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM friendships
    WHERE (user_id = user_uuid OR friend_id = user_uuid) AND status = 'active';
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;
```

### Row Level Security Policies

#### Items Table Policies

```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Anyone can view active items
CREATE POLICY "Anyone can view active items"
ON items FOR SELECT
USING (status = 'active' OR seller_id = auth.uid());

-- Users can insert their own items
CREATE POLICY "Users can create own items"
ON items FOR INSERT
WITH CHECK (seller_id = auth.uid());

-- Users can update their own items
CREATE POLICY "Users can update own items"
ON items FOR UPDATE
USING (seller_id = auth.uid());

-- Users can delete their own items
CREATE POLICY "Users can delete own items"
ON items FOR DELETE
USING (seller_id = auth.uid());
```

#### Transactions Table Policies

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view transactions they're involved in
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- System creates transactions (handled by backend with service role)
CREATE POLICY "Enable insert for authenticated users"
ON transactions FOR INSERT
WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());
```

#### Ratings Table Policies

```sql
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
ON ratings FOR SELECT
USING (true);

-- Users can create ratings for transactions they're involved in
CREATE POLICY "Buyers can rate sellers"
ON ratings FOR INSERT
WITH CHECK (rater_id = auth.uid());

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
ON ratings FOR UPDATE
USING (rater_id = auth.uid());
```

#### Notifications Table Policies

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- System creates notifications (handled by backend with service role)
CREATE POLICY "Enable insert for system"
ON notifications FOR INSERT
WITH CHECK (true);
```

#### Friendships Table Policies

```sql
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're involved in
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Users can create friendships
CREATE POLICY "Users can create friendships"
ON friendships FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update friendships they're involved in
CREATE POLICY "Users can update own friendships"
ON friendships FOR UPDATE
USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Users can delete friendships they're involved in
CREATE POLICY "Users can delete own friendships"
ON friendships FOR DELETE
USING (user_id = auth.uid() OR friend_id = auth.uid());
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Item ownership consistency

*For any* item in the database, the seller_id must reference a valid user in the users table, and only that user can modify or delete the item.

**Validates: Requirements 1.2, 1.4, 1.5**

### Property 2: Transaction integrity

*For any* completed transaction, the associated item must have its status set to 'sold', and the item cannot be involved in multiple completed transactions.

**Validates: Requirements 3.2**

### Property 3: Reputation calculation accuracy

*For any* user with ratings, the reputation score must equal the arithmetic mean of all rating values associated with that user.

**Validates: Requirements 4.2, 4.5**

### Property 4: Dashboard statistics consistency

*For any* user, the count of sold items must equal the number of completed transactions where the user is the seller.

**Validates: Requirements 5.2**

### Property 5: Earnings calculation accuracy

*For any* user, the total earnings must equal the sum of all transaction prices where the user is the seller and status is 'completed'.

**Validates: Requirements 5.3**

### Property 6: Notification creation on events

*For any* transaction that completes, the system must create notifications for both the buyer and seller.

**Validates: Requirements 6.2**

### Property 7: Friendship uniqueness

*For any* pair of users, there can be at most one friendship record between them in either direction.

**Validates: Requirements 7.1, 7.2**

### Property 8: No self-friendships

*For any* friendship record, the user_id and friend_id must reference different users.

**Validates: Requirements 7.1**

### Property 9: Referential integrity preservation

*For any* delete operation on a user, all related records in dependent tables must be handled according to the foreign key constraints (CASCADE or RESTRICT).

**Validates: Requirements 8.5**

### Property 10: Price non-negativity

*For any* item or transaction, the price value must be greater than or equal to zero.

**Validates: Requirements 1.1, 3.1**

## Error Handling

### Database Constraints

- **Foreign Key Violations**: Return error when referencing non-existent users or items
- **Check Constraint Violations**: Return error for invalid status values, negative prices, or out-of-range ratings
- **Unique Constraint Violations**: Return error for duplicate friendships or multiple ratings per transaction
- **NOT NULL Violations**: Return error when required fields are missing

### RLS Policy Violations

- **Unauthorized Access**: Supabase returns empty result set or error when RLS policies block access
- **Permission Denied**: Return error when user attempts to modify data they don't own

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Database function correctness (reputation calculation, earnings calculation, counts)
- Constraint enforcement (price >= 0, rating between 1-5, valid status values)
- Trigger functionality (auto-update timestamps)
- RLS policy behavior (users can only access their own data)

### Property-Based Testing

Property-based tests will use **Hypothesis** (Python) to verify:
- Properties 1-10 listed above hold across randomly generated test data
- Database constraints prevent invalid states
- Calculations remain accurate with various data distributions

Each property-based test will:
- Run a minimum of 100 iterations
- Generate random users, items, transactions, and ratings
- Verify the property holds for all generated data
- Tag tests with format: **Feature: marketplace-backend, Property {number}: {property_text}**

### Integration Testing

Integration tests will verify:
- Complete transaction flows (list item → purchase → rate seller)
- Dashboard data aggregation accuracy
- Notification creation on various events
- Friendship lifecycle (request → accept/reject → unfriend)

## Performance Considerations

### Indexes

Strategic indexes are placed on:
- Foreign keys for join performance
- Frequently filtered columns (status, category)
- Timestamp columns for sorting recent activity
- Boolean flags (is_read) for filtering

### Query Optimization

- Use database functions for complex calculations to reduce round trips
- Implement pagination for large result sets (items, notifications)
- Use SELECT with specific columns rather than SELECT *
- Consider materialized views for expensive dashboard queries if needed

### Scalability

- UUID primary keys allow distributed ID generation
- Timestamps enable time-based partitioning if needed
- Soft deletes preserve data for analytics without impacting active queries
- RLS policies push security logic to database layer for consistency
