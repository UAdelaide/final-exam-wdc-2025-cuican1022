-- Question 5: SQL Insertion statement
-- Make sure to use the correct database
USE DogWalkService;

-- Insert five users
INSERT INTO Users (username, email, password_hash, role) VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('davidowner', 'david@example.com', 'hashed321', 'owner'),
('sarahwalker', 'sarah@example.com', 'hashed654', 'walker');

-- Insert five dogs
INSERT INTO Dogs (name, size, owner_id) VALUES
('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Charlie', 'large', (SELECT user_id FROM Users WHERE username = 'davidowner')),
('Luna', 'small', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Rocky', 'medium', (SELECT user_id FROM Users WHERE username = 'carol123'));

-- Insert five dog-walking requests
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
(
    (SELECT dog_id FROM Dogs WHERE name = 'Max'),
    '2025-06-10 08:00:00',
    30,
    'Parklands',
    'open'
),
(
    (SELECT dog_id FROM Dogs WHERE name = 'Bella'),
    '2025-06-10 09:30:00',
    45,
    'Beachside Ave',
    'accepted'
),
(
    (SELECT dog_id FROM Dogs WHERE name = 'Charlie'),
    '2025-06-10 14:00:00',
    60,
    'Central Park',
    'open'
),
(
    (SELECT dog_id FROM Dogs WHERE name = 'Luna'),
    '2025-06-10 16:30:00',
    30,
    'Downtown Plaza',
    'completed'
),
(
    (SELECT dog_id FROM Dogs WHERE name = 'Rocky'),
    '2025-06-10 18:00:00',
    45,
    'Green Valley Park',
    'open'
);