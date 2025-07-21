-- 1. Create database
CREATE DATABASE IF NOT EXISTS car_auction_db;
USE car_auction_db;

-- 2. Users table (sellers & dealers)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('seller','dealer') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from users;

-- 3. Cars table
CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  year YEAR,
  mileage INT,
  reserve_price DECIMAL(10,2),
  status ENUM('open','closed') DEFAULT 'open',
  winner_id INT NULL,
  winning_bid DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- 4. Bids table
CREATE TABLE IF NOT EXISTS bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  car_id INT NOT NULL,
  dealer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id),
  FOREIGN KEY (dealer_id) REFERENCES users(id)
);
