`CREATE TABLE users(
  id serial PRIMARY KEY,
  name VARCHAR (50) UNIQUE NOT NULL,
  passwordHash VARCHAR (500) NOT NULL,
  email VARCHAR (55) UNIQUE NOT NULL,
  registrationDate TIMESTAMP NOT NULL,
  phone VARCHAR (50) NOT NULL,
  isAdmin boolean not NULL
 );

 CREATE TABLE orders(
  id serial PRIMARY KEY,
  origin VARCHAR (50) NOT NULL,
  destination VARCHAR (50) NOT NULL,
  presentLocation VARCHAR (50) ,
  recipientPhone VARCHAR (35) NULL,
  orderDate TIMESTAMP NOT NULL,
  deliveryDate TIMESTAMP,
  comments VARCHAR (350) ,
  status VARCHAR(50) NOT NULL,
  initiatorId INTEGER,
  weight INTEGER,
  CONSTRAINT order_initiator_id_fk FOREIGN KEY (initiatorId)
       REFERENCES users (id) MATCH SIMPLE
       ON UPDATE NO ACTION ON DELETE NO ACTION
 );`;
