-- Run this SINGLE query in the Neon Dashboard SQL Editor
-- Then copy the JSON result and save it as migration-data/neon-export.json

SELECT json_build_object(
  'admins',               COALESCE((SELECT json_agg(row_to_json(t)) FROM "Admin" t), '[]'::json),
  'adminTokens',          COALESCE((SELECT json_agg(row_to_json(t)) FROM "PasswordResetToken" t), '[]'::json),
  'categories',           COALESCE((SELECT json_agg(row_to_json(t)) FROM "Category" t), '[]'::json),
  'tours',                COALESCE((SELECT json_agg(row_to_json(t)) FROM "Tour" t), '[]'::json),
  'tourImages',           COALESCE((SELECT json_agg(row_to_json(t)) FROM "TourImage" t), '[]'::json),
  'hotels',               COALESCE((SELECT json_agg(row_to_json(t)) FROM "Hotel" t), '[]'::json),
  'hotelImages',          COALESCE((SELECT json_agg(row_to_json(t)) FROM "HotelImage" t), '[]'::json),
  'destinations',         COALESCE((SELECT json_agg(row_to_json(t)) FROM "Destination" t), '[]'::json),
  'destinationTours',     COALESCE((SELECT json_agg(row_to_json(t)) FROM "DestinationTour" t), '[]'::json),
  'destinationHotels',    COALESCE((SELECT json_agg(row_to_json(t)) FROM "DestinationHotel" t), '[]'::json),
  'testimonials',         COALESCE((SELECT json_agg(row_to_json(t)) FROM "Testimonial" t), '[]'::json),
  'contactMessages',      COALESCE((SELECT json_agg(row_to_json(t)) FROM "ContactMessage" t), '[]'::json),
  'tripRequests',         COALESCE((SELECT json_agg(row_to_json(t)) FROM "TripRequest" t), '[]'::json),
  'users',                COALESCE((SELECT json_agg(row_to_json(t)) FROM "User" t), '[]'::json),
  'userTokens',           COALESCE((SELECT json_agg(row_to_json(t)) FROM "UserPasswordResetToken" t), '[]'::json),
  'orders',               COALESCE((SELECT json_agg(row_to_json(t)) FROM "Order" t), '[]'::json),
  'orderItems',           COALESCE((SELECT json_agg(row_to_json(t)) FROM "OrderItem" t), '[]'::json),
  'transactions',         COALESCE((SELECT json_agg(row_to_json(t)) FROM "Transaction" t), '[]'::json),
  'newsletterSubscribers',COALESCE((SELECT json_agg(row_to_json(t)) FROM "NewsletterSubscriber" t), '[]'::json),
  'newsletters',          COALESCE((SELECT json_agg(row_to_json(t)) FROM "Newsletter" t), '[]'::json),
  'reviews',              COALESCE((SELECT json_agg(row_to_json(t)) FROM "Review" t), '[]'::json)
) as data;
