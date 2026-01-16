import { Sequelize } from "sequelize";
import { createListingModel } from "./Listing.js";
import { createAddressModel } from "./Address.js";
import { createPhotoModel } from "./Photo.js";
import { createCategoryModel } from "./Category.js";
import { createPropertyTypeModel } from "./PropertyType.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env


export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createListingModel(database);
createAddressModel(database);
createPhotoModel(database);
createCategoryModel(database);
createPropertyTypeModel(database);

// Esporta i modelli
export const { Listing, Address, Photo, Category, PropertyType } = database.models;


// Address haOne Property (1:1)
Address.hasOne(Listing, {
  foreignKey: 'addressId',
  onDelete: 'SET NULL' // opzionale: se cancelli l'indirizzo, la property sopravvive
});
Listing.belongsTo(Address, {
  foreignKey: 'addressId',
  onDelete: 'CASCADE'
});

Listing.hasMany(Photo, {
    foreignKey: 'listingId',
    onDelete: 'CASCADE' // opzionale: se cancelli la property, le foto vengono cancellate
});
Photo.belongsTo(Listing, { 
    foreignKey: "listingId" 
});

// Definizione della relazione molti-a-molti
Listing.belongsToMany(Category, { 
    through: 'ListingCategories', // Nome della tabella di giunzione nel DB
    foreignKey: 'listingId',      // Chiave che punta a Listing
    otherKey: 'categoryId',       // Chiave che punta a Category
    onDelete: 'CASCADE'           // Se elimini un annuncio, elimina i suoi legami
});

Category.belongsToMany(Listing, { 
    through: 'ListingCategories',
    foreignKey: 'categoryId',
    otherKey: 'listingId'
});

// Relazione: Un PropertyType ha molti Listings
PropertyType.hasMany(Listing, {
    foreignKey: 'propertyTypeId', // Nome della colonna che verrà creata in Listings
    as: 'listings'
});

// Relazione: Ogni Listing appartiene a un solo PropertyType
Listing.belongsTo(PropertyType, {
    foreignKey: 'propertyTypeId',
    as: 'type' // 
});

async function seedCategories() {
   
    // Qui inseriamo i nomi tecnici (che userai come identificativi e icone)
    const defaultCategories = [
        { name: 'school' },
        { name: 'park' },
        { name: 'public_trasport' },
    ];

    try {
        for (const cat of defaultCategories) {
            await Category.findOrCreate({
                where: { name: cat.name },
                defaults: cat
            });
        }
        console.log('[Database] Categorie (icone) inizializzate.');
    } catch (error) {
        console.error('[Database] Errore durante il seeding: (Categorie)', error);
    }
}

async function seedPropertyType() {

    const defaultProperty = [
        { name: 'apartment' },
        { name: 'cottage' },
        { name: 'villa' },
    ];

    try {
        for (const prop of defaultProperty) {
            await PropertyType.findOrCreate({
                where: { name: prop.name },
                defaults: prop
            });
        }
        console.log('[Database] Proprietà inizializzate.');
    } catch (error) {
        console.error('[Database] Errore durante il seeding (Proprietà):', error);
    }
}



seedCategories();
seedPropertyType();

// Sincronizzazione del database
database.sync()  //togliere alter: true (comporta rischi e perdita di dati)
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });