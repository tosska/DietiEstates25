import { Sequelize } from "sequelize";
import { createListingModel } from "./Listing.js";
import { createAddressModel } from "./Address.js";
import { createPhotoModel } from "./Photo.js";
import { createCategoryModel } from "./Category.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env


export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createListingModel(database);
createAddressModel(database);
createPhotoModel(database);
createCategoryModel(database);

// Esporta i modelli
export const { Listing, Address, Photo, Category } = database.models;


// Address haOne Property (1:1)
Address.hasOne(Listing, {
  foreignKey: 'addressId',
  onDelete: 'SET NULL' // opzionale: se cancelli l'indirizzo, la property sopravvive
});
Listing.belongsTo(Address, {
  foreignKey: 'addressId'
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




// Sincronizzazione del database
database.sync()  //togliere alter: true (comporta rischi e perdita di dati)
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });