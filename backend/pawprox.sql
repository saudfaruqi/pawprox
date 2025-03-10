-- Create the database
DROP DATABASE IF EXISTS pawprox;
CREATE DATABASE pawprox;
USE pawprox;

-- ================================
-- Table: users
-- ================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'vendor', 'admin') NOT NULL DEFAULT 'user',
  phone VARCHAR(20) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  profilePic VARCHAR(255) DEFAULT '/default/path/to/profilePic.png',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

SELECT * FROM users;


DROP TABLE IF EXISTS pets;
CREATE TABLE pets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('Dog', 'Cat') NOT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  age INT DEFAULT NULL,
  sex ENUM('Male', 'Female', 'Unknown') DEFAULT 'Unknown',
  weight DECIMAL(5,2) DEFAULT NULL,
  color VARCHAR(100) DEFAULT NULL,
  health_status TEXT DEFAULT NULL,
  vaccinations TEXT DEFAULT NULL, -- store as JSON string or comma-separated list
  allergies TEXT DEFAULT NULL,
  lost_status BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,
  photo MEDIUMTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


SELECT * FROM pets;

-- ================================
-- Table: vendors
-- ================================
DROP TABLE IF EXISTS vendors;
CREATE TABLE vendors (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  services TEXT,
  description TEXT,
  approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_vendor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

SELECT * FROM vendors;


-- ================================
-- Table: lost_pets
-- ================================
DROP TABLE IF EXISTS lost_pets;
CREATE TABLE lost_pets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED,  -- Optional: if you want to link to registered users
  petName VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,  -- e.g., "lost" or "found"
  contactInfo VARCHAR(255) NOT NULL,
  lastSeen DATE NOT NULL,
  image MEDIUMTEXT,  -- URL or file path to the uploaded image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_lost_pets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


SELECT * FROM lost_pets;

-- ================================
-- Table: marketplace
-- ================================
DROP TABLE IF EXISTS marketplace;
CREATE TABLE marketplace (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  details TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255) DEFAULT 'https/image.com',
  detail_images TEXT,
  sku VARCHAR(100) DEFAULT 'N/A',
  dimensions VARCHAR(100) DEFAULT 'N/A',
  weight VARCHAR(100) DEFAULT 'N/A',
  materials VARCHAR(255) DEFAULT 'N/A',
  rating INT DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  features TEXT,           -- New column for features
  benefits TEXT,           -- New column for benefits
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_marketplace_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;



SELECT * FROM marketplace;


CREATE TABLE product_reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating INT NOT NULL,         -- Rating from 1 to 5
  comment TEXT,                -- The review text
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_product_review_product 
    FOREIGN KEY (product_id) REFERENCES marketplace(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_review_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT * FROM product_reviews;

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  buyer_id INT UNSIGNED NOT NULL,
  vendor_id INT UNSIGNED NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  order_status ENUM('processing', 'ready', 'shipped', 'out for delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'processing',
  shipping_address VARCHAR(255) NOT NULL DEFAULT 'N/A',
  payment_method VARCHAR(255) NOT NULL DEFAULT 'Not available',
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tracking_number VARCHAR(255) DEFAULT NULL,
  carrier_slug VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB;


SELECT * FROM orders;

DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES marketplace(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT * FROM order_items;

-- ================================
-- Table: petcare_services
-- ================================
DROP TABLE IF EXISTS petcare_services;
CREATE TABLE petcare_services (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price VARCHAR(100) NOT NULL,
  availability VARCHAR(255) NOT NULL,
  features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO petcare_services (name, description, price, availability, features)
VALUES
  (
    'Pet Sitting',
    'Professional in-home pet sitting services for your pet, including feeding, walking, and medication administration.',
    '$30/hour',
    'Available 24/7',
    '["Feeding", "Walking", "Medication administration", "Daily updates"]'
  ),
  (
    'Dog Walking',
    'Reliable dog walking service to provide exercise and socialization for your dog.',
    '$25/hour',
    'Mon-Sun, 6am-8pm',
    '["Group walks", "Individual walks", "Park visits", "Exercise routines"]'
  ),
  (
    'Pet Grooming',
    'Comprehensive grooming services including bathing, nail trimming, and fur styling for all types of pets.',
    'From $45',
    'Mon-Sat, 9am-5pm',
    '["Bathing", "Nail trimming", "Ear cleaning", "Style trimming"]'
  ),
  (
    'Veterinary Services',
    'Basic health check-ups, vaccinations, deworming, and minor treatments provided by licensed veterinarians.',
    'From $75',
    'Mon-Fri, 9am-6pm',
    '["Health checks", "Vaccinations", "Deworming", "Minor treatments"]'
  );

-- ================================
-- Table: bookings
-- ================================
DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  pet_name VARCHAR(255) NOT NULL,
  pet_type VARCHAR(100) NOT NULL,
  pet_weight VARCHAR(50),
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT,
  emergency_contact VARCHAR(50),
  veterinarian VARCHAR(100),
  vaccination VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Pending',
  booking_identifier VARCHAR(50),
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES petcare_services(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ================================
-- Table: veterinarians
-- ================================
DROP TABLE IF EXISTS veterinarians;
CREATE TABLE veterinarians (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  experience VARCHAR(50) NOT NULL,        -- e.g., "12 years"
  image VARCHAR(255) DEFAULT 'https://via.placeholder.com/80',
  availability VARCHAR(255) NOT NULL,       -- e.g., "Mon-Fri" or "Tue-Sun"
  location VARCHAR(255) NOT NULL,
  rating DECIMAL(3,1) DEFAULT 0,             -- e.g., 4.8
  reviews INT DEFAULT 0,
  languages JSON,                           -- e.g., '["English", "Spanish"]'
  certifications JSON,                      -- e.g., '["ABVP Certified", "Fear Free Certified"]'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;


-- ================================
-- Table: medical_bookings
-- ================================
DROP TABLE IF EXISTS medical_bookings;
CREATE TABLE medical_bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  vet_id INT UNSIGNED NOT NULL,
  petName VARCHAR(255) NOT NULL,
  petType VARCHAR(100) NOT NULL,
  reason TEXT,
  ownerName VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  booking_identifier VARCHAR(50),
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_medical_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_medical_bookings_vet FOREIGN KEY (vet_id) REFERENCES veterinarians(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ================================
-- Table: Posts
-- ================================
DROP TABLE IF EXISTS Posts;
CREATE TABLE IF NOT EXISTS Posts (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  profilePic VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  image MEDIUMTEXT DEFAULT NULL,
  `like` INT NOT NULL DEFAULT 0,
  love INT NOT NULL DEFAULT 0,
  haha INT NOT NULL DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;



DROP TABLE IF EXISTS PostReactions;
CREATE TABLE PostReactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId INT NOT NULL,
    userId INT UNSIGNED NOT NULL,
    type ENUM('like', 'love', 'haha') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (postId, userId),
    CONSTRAINT fk_post_reactions_post FOREIGN KEY (postId) REFERENCES Posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_post_reactions_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


SELECT * FROM Posts;

-- ================================
-- Table: Comments
-- ================================
DROP TABLE IF EXISTS Comments;
CREATE TABLE IF NOT EXISTS Comments (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  profilePic VARCHAR(255) NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  postId INT NOT NULL,
  parentCommentId INT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_comments_post FOREIGN KEY (postId) REFERENCES Posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


select * from Comments;


drop table Messages;
CREATE TABLE Messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  likes INT DEFAULT 0,
  reply_to INT NULL,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);


select * from Messages;

CREATE TABLE MessageLikes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  message_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (message_id, user_id),
  CONSTRAINT fk_messagelikes_message FOREIGN KEY (message_id)
    REFERENCES Messages(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_messagelikes_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);




drop table FriendRequests;
CREATE TABLE FriendRequests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'removed') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_request (sender_id, receiver_id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB;


select * from FriendRequests;