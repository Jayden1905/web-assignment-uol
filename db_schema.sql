-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;
-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS blog_posts (
    blog_post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    --the user that wrote the blog post
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    --the user that wrote the comment
    user_id INT,
    --the blog post that the comment is on
    blog_post_id INT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts (blog_post_id)
);
CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT,
    --the user that liked the blog post
    user_id INT,
    --the blog post that the like is on
    blog_post_id INT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts (blog_post_id)
);
COMMIT;