# Requirements Document

## Introduction

This document defines the requirements for the Acad Swap marketplace backend system. The system enables university students to list items for sale, make purchases, communicate with other users, build reputation, and track their marketplace activity through a comprehensive dashboard.

## Glossary

- **System**: The Acad Swap marketplace backend application
- **User**: A registered university student who can buy or sell items
- **Item**: A product listed for sale on the marketplace
- **Transaction**: A completed sale between a buyer and seller
- **Listing**: An active item available for purchase
- **Reputation Score**: A numerical rating (0-5) representing seller trustworthiness
- **Engagement Rate**: Percentage metric of user activity and responsiveness
- **Notification**: A system-generated message about marketplace activity
- **Friendship**: A bidirectional connection between two users

## Requirements

### Requirement 1

**User Story:** As a seller, I want to list items for sale, so that I can sell my academic materials to other students.

#### Acceptance Criteria

1. WHEN a user creates a new listing THEN the System SHALL store the item with title, description, price, category, condition, and images
2. WHEN a user creates a listing THEN the System SHALL associate the listing with the user's account and set status to active
3. WHEN a user views their listings THEN the System SHALL return all items created by that user with current status
4. WHEN a user updates a listing THEN the System SHALL modify the item details and update the timestamp
5. WHEN a user deletes a listing THEN the System SHALL mark the item as inactive and preserve transaction history

### Requirement 2

**User Story:** As a buyer, I want to browse available items, so that I can find academic materials I need.

#### Acceptance Criteria

1. WHEN a user requests marketplace items THEN the System SHALL return all active listings with seller information
2. WHEN a user filters by category THEN the System SHALL return only items matching the specified category
3. WHEN a user searches by keyword THEN the System SHALL return items where title or description contains the search term
4. WHEN a user views an item THEN the System SHALL increment the view count for that listing
5. WHEN a user requests item details THEN the System SHALL return complete item information including seller reputation

### Requirement 3

**User Story:** As a user, I want to complete transactions, so that I can buy and sell items securely.

#### Acceptance Criteria

1. WHEN a buyer purchases an item THEN the System SHALL create a transaction record with buyer, seller, item, and price
2. WHEN a transaction is created THEN the System SHALL update the item status to sold and record the sale timestamp
3. WHEN a transaction completes THEN the System SHALL update the seller's total earnings and sold items count
4. WHEN a transaction completes THEN the System SHALL create notifications for both buyer and seller
5. WHEN a user requests transaction history THEN the System SHALL return all transactions where the user is buyer or seller

### Requirement 4

**User Story:** As a seller, I want to build my reputation, so that buyers trust me and purchase my items.

#### Acceptance Criteria

1. WHEN a transaction completes THEN the System SHALL allow the buyer to rate the seller from 1 to 5 stars
2. WHEN a rating is submitted THEN the System SHALL recalculate the seller's average reputation score
3. WHEN a user views a seller profile THEN the System SHALL display the reputation score and total number of ratings
4. WHEN a seller has no ratings THEN the System SHALL display a default reputation score of 0
5. WHEN calculating reputation THEN the System SHALL compute the arithmetic mean of all received ratings

### Requirement 5

**User Story:** As a user, I want to see my dashboard statistics, so that I can track my marketplace activity.

#### Acceptance Criteria

1. WHEN a user requests dashboard data THEN the System SHALL return count of currently active listings
2. WHEN a user requests dashboard data THEN the System SHALL return count of sold items
3. WHEN a user requests dashboard data THEN the System SHALL return sum of total earnings from completed transactions
4. WHEN a user requests dashboard data THEN the System SHALL return the user's current reputation score
5. WHEN a user requests dashboard data THEN the System SHALL return count of friends
6. WHEN a user requests dashboard data THEN the System SHALL calculate engagement rate based on response time and activity

### Requirement 6

**User Story:** As a user, I want to receive notifications, so that I stay informed about marketplace activity.

#### Acceptance Criteria

1. WHEN an item receives a view THEN the System SHALL create a notification for the seller
2. WHEN a transaction completes THEN the System SHALL create notifications for buyer and seller
3. WHEN a user receives a message THEN the System SHALL create a notification for the recipient
4. WHEN a user requests notifications THEN the System SHALL return all notifications ordered by timestamp descending
5. WHEN a user marks notifications as read THEN the System SHALL update the read status and timestamp

### Requirement 7

**User Story:** As a user, I want to connect with other students, so that I can build a trusted network for trading.

#### Acceptance Criteria

1. WHEN a user sends a friend request THEN the System SHALL create a pending friendship record
2. WHEN a user accepts a friend request THEN the System SHALL update the friendship status to active
3. WHEN a user rejects a friend request THEN the System SHALL delete the friendship record
4. WHEN a user requests their friends list THEN the System SHALL return all active friendships with user details
5. WHEN a user unfriends another user THEN the System SHALL delete the friendship record

### Requirement 8

**User Story:** As a user, I want my data to persist reliably, so that my marketplace information is never lost.

#### Acceptance Criteria

1. WHEN any data modification occurs THEN the System SHALL use database transactions to ensure atomicity
2. WHEN a database error occurs THEN the System SHALL rollback changes and return an error message
3. WHEN creating records THEN the System SHALL validate all required fields are present and correctly formatted
4. WHEN updating records THEN the System SHALL verify the user has permission to modify the data
5. WHEN deleting records THEN the System SHALL preserve referential integrity across related tables
