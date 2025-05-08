-- Creazione delle tabelle senza vincoli di foreign key inizialmente
CREATE TABLE "Address" (
    id SERIAL PRIMARY KEY
);

CREATE TABLE "Customers" (
    id SERIAL PRIMARY KEY
);

CREATE TABLE "Admins" (
    id SERIAL PRIMARY KEY,
    Agency_id INTEGER
);

CREATE TABLE "Agencys" (
    id SERIAL PRIMARY KEY,
    ManagerAdmin_id INTEGER,
    Address_id INTEGER
);

CREATE TABLE "Agents" (
    id SERIAL PRIMARY KEY,
    Agency_id INTEGER,
    CreatorAdmin_id INTEGER
);

CREATE TABLE "Propertys" (
    id SERIAL PRIMARY KEY,
    Address_id INTEGER
);

CREATE TABLE "Listings" (
    id SERIAL PRIMARY KEY,
    Agency_id INTEGER,
    Agent_id INTEGER,
    Property_id INTEGER
);

CREATE TABLE "Offers" (
    id SERIAL PRIMARY KEY,
    Customer_id INTEGER NOT NULL,
    AgentAgency_id INTEGER NOT NULL,
    Listing_id INTEGER NOT NULL
);

CREATE TABLE "Photos" (
    id SERIAL PRIMARY KEY,
    Property_id INTEGER
);

-- Aggiunta dei vincoli di foreign key 
ALTER TABLE "Admins"
ADD FOREIGN KEY (Agency_id) REFERENCES "Agencys"(id);

ALTER TABLE "Agencys"
ADD FOREIGN KEY (ManagerAdmin_id) REFERENCES "Admins"(id),
ADD FOREIGN KEY (Address_id) REFERENCES "Address"(id);

ALTER TABLE "Agents"
ADD FOREIGN KEY (CreatorAdmin_id) REFERENCES "Admins"(id),
ADD FOREIGN KEY (Agency_id) REFERENCES "Agencys"(id);

ALTER TABLE "Propertys"
ADD FOREIGN KEY (Address_id) REFERENCES "Address"(id);

ALTER TABLE "Listings"
ADD FOREIGN KEY (Agency_id) REFERENCES "Agencys"(id),
ADD FOREIGN KEY (Agent_id) REFERENCES "Agents"(id),
ADD FOREIGN KEY (Property_id) REFERENCES "Propertys"(id);

ALTER TABLE "Offers"
ADD FOREIGN KEY (Customer_id) REFERENCES "Customers"(id),
ADD FOREIGN KEY (AgentAgency_id) REFERENCES "Agents"(id),
ADD FOREIGN KEY (Listing_id) REFERENCES "Listings"(id);

ALTER TABLE "Photos"
ADD FOREIGN KEY (Property_id) REFERENCES "Propertys"(id);

-- Popolamento di Address
INSERT INTO "Address" (id) VALUES 
(DEFAULT), -- id: 1
(DEFAULT), -- id: 2
(DEFAULT); -- id: 3

-- Popolamento di Customers
INSERT INTO "Customers" (id) VALUES 
(DEFAULT), -- id: 1
(DEFAULT), -- id: 2
(DEFAULT); -- id: 3

-- Popolamento di Admins (Agency_id può essere NULL, quindi lo lasciamo vuoto per ora)
INSERT INTO "Admins" (id, Agency_id) VALUES 
(DEFAULT, NULL), -- id: 1
(DEFAULT, NULL), -- id: 2
(DEFAULT, NULL); -- id: 3

-- Popolamento di Agencys (riferisce a Admins e Address)
INSERT INTO "Agencys" (id, ManagerAdmin_id, Address_id) VALUES 
(DEFAULT, 1, 1), -- id: 1
(DEFAULT, 2, 2), -- id: 2
(DEFAULT, 3, 3); -- id: 3

-- Aggiorniamo Admins per aggiungere Agency_id ora che Agencys esiste
UPDATE "Admins" SET Agency_id = 1 WHERE id = 1;
UPDATE "Admins" SET Agency_id = 2 WHERE id = 2;
UPDATE "Admins" SET Agency_id = 3 WHERE id = 3;

-- Popolamento di Agents (riferisce a Agencys e Admins)
INSERT INTO "Agents" (id, Agency_id, CreatorAdmin_id) VALUES 
(DEFAULT, 1, 1), -- id: 1
(DEFAULT, 2, 2), -- id: 2
(DEFAULT, 3, 3); -- id: 3

-- Popolamento di Propertys (riferisce a Address)
INSERT INTO "Propertys" (id, Address_id) VALUES 
(DEFAULT, 1), -- id: 1
(DEFAULT, 2), -- id: 2
(DEFAULT, 3); -- id: 3

-- Popolamento di Listings (riferisce a Agencys, Agents e Propertys)
INSERT INTO "Listings" (id, Agency_id, Agent_id, Property_id) VALUES 
(DEFAULT, 1, 1, 1), -- id: 1
(DEFAULT, 2, 2, 2), -- id: 2
(DEFAULT, 3, 3, 3); -- id: 3

-- Popolamento di Photos (riferisce a Propertys)
INSERT INTO "Photos" (id, Property_id) VALUES 
(DEFAULT, 1), -- id: 1
(DEFAULT, 1), -- id: 2
(DEFAULT, 2), -- id: 3
(DEFAULT, 3); -- id: 4
