import { Sequelize } from "sequelize";
import { createListingModel } from "./Listing.js";
import { createAddressModel } from "./Address.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env

export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createListingModel(database);
createAddressModel(database);

// Esporta i modelli
export const { Listing, Address } = database.models;


// Address haOne Property (1:1)
Address.hasOne(Listing, {
  foreignKey: 'addressId',
  onDelete: 'SET NULL' // opzionale: se cancelli l'indirizzo, la property sopravvive
});
Listing.belongsTo(Address, {
  foreignKey: 'addressId'
});

// Sincronizzazione del database
database.sync()  //togliere alter: true (comporta rischi e perdita di dati)
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });