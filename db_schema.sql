
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_accounts (
    email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL,
    id  INT, --the user that the email account belongs to
    FOREIGN KEY (id) REFERENCES users(id)
);

-- Insert default data (if necessary here)

-- Set up three users
INSERT INTO users ('user_name', 'password', 'salt') VALUES ('Simon Star', 'password1', 'salt1');
INSERT INTO users ('user_name', 'password', 'salt') VALUES ('Dianne Dean', 'password2', 'salt2');
INSERT INTO users ('user_name', 'password', 'salt') VALUES ('Harry Hilbert', 'password3', 'salt3');

-- Give Simon two email addresses and Diane one, but Harry has none
INSERT INTO email_accounts ('email_address', 'id') VALUES ('simon@gmail.com', 1);
INSERT INTO email_accounts ('email_address', 'id') VALUES ('simon@hotmail.com', 1);
INSERT INTO email_accounts ('email_address', 'id') VALUES ('dianne@yahoo.co.uk', 2);

COMMIT;

