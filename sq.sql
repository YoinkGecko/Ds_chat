CREATE DATABASE wechat;

USE wechat;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(15),
  username VARCHAR(50) UNIQUE,
  password VARCHAR(100)
);

select * from users;