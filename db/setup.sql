-- Drop the existing databases if they exist
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP DATABASE IF EXISTS nc_news_test;
DROP DATABASE IF EXISTS nc_news;

-- Create the nc_news_test database
CREATE DATABASE nc_news_test;

-- Create the nc_news database
CREATE DATABASE nc_news;
