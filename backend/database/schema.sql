CREATE DATABASE IF NOT EXISTS resume_ai_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE resume_ai_platform;


-- =========================================================
-- users
-- =========================================================

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    icon TEXT,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role ENUM('applicant', 'hr', 'admin') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY username (email),
    UNIQUE KEY phone (phone)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- posts
-- =========================================================

CREATE TABLE posts (
    id INT NOT NULL AUTO_INCREMENT,
    owner_id INT NOT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    title VARCHAR(100) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    model_provider ENUM('gemini', 'openai', 'claude') DEFAULT NULL,
    deadline DATETIME NOT NULL,
    icon TEXT,
    posts_status ENUM('open', 'closed') DEFAULT 'open',

    PRIMARY KEY (id),

    KEY owner_id (owner_id),

    CONSTRAINT posts_ibfk_1
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- members
-- =========================================================

CREATE TABLE members (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',

    PRIMARY KEY (id),

    UNIQUE KEY unique_member (user_id, post_id),

    KEY post_id (post_id),

    CONSTRAINT members_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT members_ibfk_2
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- resume
-- =========================================================

CREATE TABLE resume (
    member_id INT NOT NULL,
    resume_url TEXT NOT NULL,
    transcript_url TEXT NOT NULL,
    ai_score DECIMAL(5,2) DEFAULT NULL,
    storytelling_score TEXT,
    overall_confidence DECIMAL(5,2) DEFAULT NULL,
    skills TEXT,
    ai_reason TEXT,
    specific_strengths TEXT,
    faculty_match TEXT,

    PRIMARY KEY (member_id),

    CONSTRAINT resume_ibfk_1
        FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;
