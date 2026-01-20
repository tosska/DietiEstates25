-- ========================================================
-- SCRIPT CREAZIONE SCHEMA (PostgreSQL)
-- Basato sui modelli Sequelize e ER Diagram 
-- ========================================================

BEGIN;

-- 1. Creazione dei Tipi Enumerativi (ENUMs)
-- Sequelize mappa gli ENUM come tipi custom in Postgres
CREATE TYPE "enum_listing_type" AS ENUM ('Sale', 'Rent');
CREATE TYPE "enum_listing_status" AS ENUM ('Active', 'Closed');
CREATE TYPE "enum_energy_class" AS ENUM ('A4','A3','A2','A1', 'A', 'B', 'C', 'D', 'E', 'F', 'G');
CREATE TYPE "enum_offer_status" AS ENUM ('Accepted', 'Rejected', 'Pending');

-- ========================================================
-- 2. Tabelle "Foglia" o Indipendenti
-- ========================================================

-- Tabella: Credentials (Auth)
CREATE TABLE "Credentials" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "providerName" VARCHAR(255) DEFAULT 'local' NOT NULL,
    "providerId" VARCHAR(255),
    "password" VARCHAR(255),
    "role" VARCHAR(255) DEFAULT 'admin' NOT NULL,
    "mustChangePassword" BOOLEAN DEFAULT FALSE NOT NULL
);

-- Tabella: PropertyTypes (Listing)
CREATE TABLE "PropertyTypes" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL
);

-- Tabella: Categories (Listing)
CREATE TABLE "Categories" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL
);

-- Tabella: Addresses
-- Nota: Il diagramma mostra un'unica tabella Address. 
-- Ho unificato i campi dei modelli 'listing/Address.js' e 'agency/Address.js'.
CREATE TABLE "Addresses" (
    "id" SERIAL PRIMARY KEY,
    "street" VARCHAR(255) NOT NULL,
    "houseNumber" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "unitDetail" VARCHAR(255) NOT NULL,
    "postalCode" VARCHAR(255) NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    -- Vincolo di unicità basato sul modello Listing/Address.js
    CONSTRAINT "unique_address" UNIQUE ("street", "city", "houseNumber", "postalCode", "state", "unitDetail")
);

-- ========================================================
-- 3. Tabelle con Dipendenze di Primo Livello
-- ========================================================

-- Tabella: Customers
CREATE TABLE "Customers" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(255) NOT NULL,
    "registrationDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "credentialsId" INTEGER NOT NULL UNIQUE
);

-- Tabella: Agencies
-- Nota: managerAdminId è nullable inizialmente per risolvere la dipendenza circolare
CREATE TABLE "Agencies" (
    "agencyId" SERIAL PRIMARY KEY,
    "phone" VARCHAR(105) NOT NULL,
    "description" TEXT NOT NULL,
    "vatNumber" VARCHAR(255),
    "website" VARCHAR(255),
    "managerAdminId" INTEGER, -- FK aggiunta dopo
    "addressId" INTEGER NOT NULL
);

-- Tabella: Admins
CREATE TABLE "Admins" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255),
    "surname" VARCHAR(255),
    "urlPhoto" VARCHAR(255),
    "manager" BOOLEAN DEFAULT FALSE NOT NULL,
    "agencyId" INTEGER NOT NULL,
    "credentialsId" INTEGER UNIQUE
);

-- Tabella: Agents
CREATE TABLE "Agents" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255),
    "surname" VARCHAR(255),
    "phone" VARCHAR(255),
    "vatNumber" VARCHAR(255),
    "yearsExperience" INTEGER,
    "urlPhoto" VARCHAR(255),
    "agencyId" INTEGER NOT NULL,
    "credentialsId" INTEGER NOT NULL UNIQUE
);

-- ========================================================
-- 4. Tabelle Principali (Listings, Offers, ecc)
-- ========================================================

-- Tabella: Listings
CREATE TABLE "Listings" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(50) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "listingType" "enum_listing_type" NOT NULL,
    "status" "enum_listing_status",
    "publicationDate" TIMESTAMP WITH TIME ZONE,
    "endPublicationDate" TIMESTAMP WITH TIME ZONE,
    "description" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "numberRooms" INTEGER NOT NULL,
    "constructionYear" INTEGER NOT NULL,
    "energyClass" "enum_energy_class",
    "agencyId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,
    "addressId" INTEGER,
    "propertyTypeId" INTEGER
);

-- Tabella: Photos
CREATE TABLE "Photos" (
    "id" SERIAL PRIMARY KEY,
    "url" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,
    "listingId" INTEGER
);

-- Tabella: ListingCategories (Pivot Table N:M)
CREATE TABLE "ListingCategories" (
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "listingId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    PRIMARY KEY ("listingId", "categoryId")
);

-- Tabella: Offers
CREATE TABLE "Offers" (
    "id" SERIAL PRIMARY KEY,
    "amount" DECIMAL(10, 2) NOT NULL,
    "message" VARCHAR(255),
    "status" "enum_offer_status" NOT NULL,
    "offerDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "response_Date" TIMESTAMP WITH TIME ZONE, -- Rispetto case-sensitive del modello JS
    "counteroffer" BOOLEAN DEFAULT FALSE,
    "externalName" VARCHAR(255),
    "customer_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "listing_id" INTEGER NOT NULL
);

-- ========================================================
-- 5. Definizione Foreign Keys e Relazioni
-- ========================================================

-- Relazioni Customers
ALTER TABLE "Customers"
    ADD CONSTRAINT "fk_customers_credentials"
    FOREIGN KEY ("credentialsId") REFERENCES "Credentials"("id") ON DELETE CASCADE;

-- Relazioni Agencies
ALTER TABLE "Agencies"
    ADD CONSTRAINT "fk_agencies_address"
    FOREIGN KEY ("addressId") REFERENCES "Addresses"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- Relazioni Admins
ALTER TABLE "Admins"
    ADD CONSTRAINT "fk_admins_agency"
    FOREIGN KEY ("agencyId") REFERENCES "Agencies"("agencyId") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_admins_credentials"
    FOREIGN KEY ("credentialsId") REFERENCES "Credentials"("id") ON DELETE SET NULL;

-- Relazione Circolare Agency -> Admin (Manager)
ALTER TABLE "Agencies"
    ADD CONSTRAINT "fk_agencies_manager"
    FOREIGN KEY ("managerAdminId") REFERENCES "Admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Relazioni Agents
ALTER TABLE "Agents"
    ADD CONSTRAINT "fk_agents_agency"
    FOREIGN KEY ("agencyId") REFERENCES "Agencies"("agencyId") ON DELETE NO ACTION ON UPDATE CASCADE,
    ADD CONSTRAINT "fk_agents_credentials"
    FOREIGN KEY ("credentialsId") REFERENCES "Credentials"("id") ON DELETE CASCADE;

-- Relazioni Listings
ALTER TABLE "Listings"
    ADD CONSTRAINT "fk_listings_agency" -- Relazione logica (se agencyId non è FK strict, rimuovere)
    FOREIGN KEY ("agencyId") REFERENCES "Agencies"("agencyId") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_listings_agent"
    FOREIGN KEY ("agentId") REFERENCES "Agents"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_listings_address"
    FOREIGN KEY ("addressId") REFERENCES "Addresses"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_listings_propertytype"
    FOREIGN KEY ("propertyTypeId") REFERENCES "PropertyTypes"("id") ON DELETE SET NULL;

-- Relazioni Photos
ALTER TABLE "Photos"
    ADD CONSTRAINT "fk_photos_listing"
    FOREIGN KEY ("listingId") REFERENCES "Listings"("id") ON DELETE CASCADE;

-- Relazioni ListingCategories (Pivot)
ALTER TABLE "ListingCategories"
    ADD CONSTRAINT "fk_lc_listing"
    FOREIGN KEY ("listingId") REFERENCES "Listings"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_lc_category"
    FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE;

-- Relazioni Offers
ALTER TABLE "Offers"
    ADD CONSTRAINT "fk_offers_customer"
    FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_offers_agent"
    FOREIGN KEY ("agent_id") REFERENCES "Agents"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_offers_listing"
    FOREIGN KEY ("listing_id") REFERENCES "Listings"("id") ON DELETE CASCADE;

COMMIT;


-- ========================================================
-- SEZIONE 6: TRIGGER PER UNICITÀ GLOBALE TELEFONO
-- ========================================================

BEGIN;

-- 1. Aggiungiamo vincoli UNIQUE locali
-- Questo impedisce duplicati all'interno della stessa tabella
ALTER TABLE "Customers" ADD CONSTRAINT "unique_phone_customers" UNIQUE ("phone");
ALTER TABLE "Agencies" ADD CONSTRAINT "unique_phone_agencies" UNIQUE ("phone");
ALTER TABLE "Agents" ADD CONSTRAINT "unique_phone_agents" UNIQUE ("phone");

-- 2. Creazione della Funzione di Controllo Globale
CREATE OR REPLACE FUNCTION check_global_phone_uniqueness()
RETURNS TRIGGER AS $$
DECLARE
    conflict_found BOOLEAN := FALSE;
    conflict_table TEXT := '';
BEGIN
    -- Se stiamo inserendo/aggiornando Customers, controlliamo le altre tabelle
    IF TG_TABLE_NAME = 'Customers' THEN
        IF EXISTS (SELECT 1 FROM "Agencies" WHERE "phone" = NEW."phone") THEN
            conflict_found := TRUE;
            conflict_table := 'Agencies';
        ELSIF EXISTS (SELECT 1 FROM "Agents" WHERE "phone" = NEW."phone") THEN
            conflict_found := TRUE;
            conflict_table := 'Agents';
        END IF;
    
    -- Se stiamo inserendo/aggiornando Agencies, controlliamo le altre tabelle
    ELSIF TG_TABLE_NAME = 'Agencies' THEN
        IF EXISTS (SELECT 1 FROM "Customers" WHERE "phone" = NEW."phone") THEN
            conflict_found := TRUE;
            conflict_table := 'Customers';
        ELSIF EXISTS (SELECT 1 FROM "Agents" WHERE "phone" = NEW."phone") THEN
            conflict_found := TRUE;
            conflict_table := 'Agents';
        END IF;

    -- Se stiamo inserendo/aggiornando Agents, controlliamo le altre tabelle
    ELSIF TG_TABLE_NAME = 'Agents' THEN
        IF EXISTS (SELECT 1 FROM "Customers" WHERE "phone" = NEW."phone") THEN
            conflict_found := TRUE;
            conflict_table := 'Customers';
        ELSIF EXISTS (SELECT 1 FROM "Agencies" WHERE "phone" = NEW."phone") THEN
            conflict_found := TRUE;
            conflict_table := 'Agencies';
        END IF;
    END IF;

    -- Se è stato trovato un conflitto, blocca l'operazione
    IF conflict_found THEN
        RAISE EXCEPTION 'Il numero di telefono % è già in uso nella tabella %.', NEW."phone", conflict_table
        USING ERRCODE = 'unique_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Applicazione dei Trigger alle tabelle

CREATE TRIGGER trg_check_phone_customers
BEFORE INSERT OR UPDATE OF "phone" ON "Customers"
FOR EACH ROW EXECUTE FUNCTION check_global_phone_uniqueness();

CREATE TRIGGER trg_check_phone_agencies
BEFORE INSERT OR UPDATE OF "phone" ON "Agencies"
FOR EACH ROW EXECUTE FUNCTION check_global_phone_uniqueness();

CREATE TRIGGER trg_check_phone_agents
BEFORE INSERT OR UPDATE OF "phone" ON "Agents"
FOR EACH ROW EXECUTE FUNCTION check_global_phone_uniqueness();

COMMIT;