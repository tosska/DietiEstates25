-- Creazione delle tabelle con tutti i campi
CREATE TABLE "Address" (
    id SERIAL PRIMARY KEY,
    Street varchar(255) NOT NULL,
    City varchar(255)  NOT NULL,
    Postal_Code varchar(255)  NOT NULL,
    State varchar(255)  NOT NULL,
    Unit_Detail varchar(255)  NOT NULL,
    Longitude float(10),
    Latitude float(10)
);

CREATE TABLE "Customers" (
    id SERIAL PRIMARY KEY,
    Email varchar(255) UNIQUE NOT NULL,
    Name varchar(255) NOT NULL,
    Surname varchar(255) NOT NULL,
    Registration_Date date NOT NULL,
    Phone varchar(255) NOT NULL
);

CREATE TABLE "Admins" (
    id SERIAL PRIMARY KEY,
    Email varchar(255) UNIQUE NOT NULL,
    Manager BOOLEAN,
    Agency_id INTEGER
);

CREATE TABLE "Agencys" (
    id SERIAL PRIMARY KEY,
    Phone varchar(255) NOT NULL,
    Description clob,
    VAT_Number varchar(255) NOT NULL,
    Website varchar(255),
    ManagerAdmin_id INTEGER,
    Address_id INTEGER
);

CREATE TABLE "Agents" (
    id SERIAL PRIMARY KEY,
    Email varchar(255) UNIQUE NOT NULL,
    Name varchar(255) NOT NULL,
    Surname varchar(255) NOT NULL,
    VAT_Number varchar(255) NOT NULL,
    Years_Experience integer(10) NOT NULL,
    Agency_id INTEGER NOT NULL,
    CreatorAdmin_id INTEGER NOT NULL
);

CREATE TABLE "Propertys" (
    id SERIAL PRIMARY KEY,
    Area float(10) NOT NULL,
    Number_Rooms integer(10) NOT NULL,
    Property_Type varchar(255) NOT NULL,
    Construction_Year integer(10) NOT NULL,
    Energy_Class varchar(255) NOT NULL,
    Description clob NOT NULL,
    Address_id INTEGER NOT NULL
);

CREATE TABLE "Listings" (
    id SERIAL PRIMARY KEY,
    Title varchar(255) NOT NULL,
    Price float(10) NOT NULL,
    Listing_Type varchar(255) NOT NULL,
    Status varchar(255) NOT NULL,
    Publication_Date date  NOT NULL,
    End_Publication_Date date,
    Agency_id INTEGER NOT NULL,
    Agent_id INTEGER NOT NULL,
    Property_id INTEGER NOT NULL
);

CREATE TABLE "Offers" (
    id SERIAL PRIMARY KEY,
    Amount float(10) NOT NULL,
    Status varchar(255)  NOT NULL,
    Offer_Date date  NOT NULL,
    Response_Date date,
    Counteroffer bit  NOT NULL,
    Customer_id INTEGER NOT NULL,
    AgentAgency_id INTEGER NOT NULL,
    Listing_id INTEGER NOT NULL
);

CREATE TABLE "Photos" (
    id SERIAL PRIMARY KEY,
    Photo_Url varchar(255),
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