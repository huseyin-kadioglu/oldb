-- Optional manual seed when you prefer SQL over AdminBootstrap.
-- Same users table used by web + mobile (via Spring Boot API).
-- Password: test  (BCrypt)

INSERT INTO users (
  username, email, password, role, contribution_point, full_name, status, yearly_book_goal
)
VALUES (
  'huseyin',
  'huseyinavnikadioglu@gmail.com',
  '$2b$10$sjfnX6G6vTe6ouuORKLdK.8AY93VW5ucGMGqNH..8MSqZduQdR8Ra',
  'ADMIN',
  0,
  'Huseyin Avni Kadioglu',
  true,
  52
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  status = true,
  role = 'ADMIN',
  activation_token = NULL,
  token_expiry = NULL;
