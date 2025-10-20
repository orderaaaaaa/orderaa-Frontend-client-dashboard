// TODO: Create order.ts file in the lib/api directory with the orders api functions
// TODO: First, integrate the search functionality in the dashboard layout header to filter orders globally.
// TODO: Second, inside the orders segment pages, implement the top filter buttons functionality to filter orders based on status, these statuses are:
//   TRIED_TO_REACH_CUSTOMER
//   WAITING_FOR_PAYMENT
//   ON_HOLD
//   CALLED_CUSTOMER_AGAIN
//   CANCELLED
//   CONFIRMED
//   PREPARED
//   SHIPPED
//   RETURNED
//   DELIVERED
//   DOWN_PAYMENT
//   MISSING
// By saying implementing buttons functionality, I mean Frontend part like onClick handlers and state management and also Backend part like api functions to fetch filtered data from the server based on the selected status.

// TODO: Don't do anything regard the FilterSection component for now, just leave it as is.

// TODO: Finally, populate the orders data from the backend instead of using dummy data in the OrderCard components.
// TODO: Last but not least, implement pagination for the orders list to enhance performance and user experience.
// TODO: Create the necessary types and interfaces for orders, filters, and pagination if they don't already exist or anything you want that doesn't exist.

// Also this is the Order and Product DB models

// model Order {
//   id                   Int         @id @default(autoincrement())
//   code                 String      @unique
//   status               OrderStatus @default(TRIED_TO_REACH_CUSTOMER)
//   totalCost            Float
//   numberOfTriesToReach Int         @default(0)
//   notes                String?

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   // Relation: Order belongs to a Merchant
//   merchant   Merchant @relation(fields: [merchantId], references: [id])
//   merchantId Int

//   // Relation: Order belongs to a Customer
//   customer   Customer @relation(fields: [customerId], references: [id])
//   customerId Int

//   // Relation: Order can have many Products through OrderProduct
//   orderProducts OrderProduct[]

// }

// model Product {
//   id                 Int     @id @default(autoincrement())
//   name               String
//   size               String?
//   color              String?
//   material           String?
//   weight             String?
//   manufactureCompany String?

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   // Relation: Product can belong to many Orders through OrderProduct
//   orderProducts OrderProduct[]

// }
