import { Sequelize } from "sequelize";
import { createModel as createCredentialsModel } from "./Credentials.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env

export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createCredentialsModel(database);

// Esporta i modelli
export const { Credentials } = database.models;

if(!Credentials.findByPk(0)) {
    let externalUser = {id: 0, email: 'email', password: 'password', role: 'customer'};
    externalUser= Credentials.build(externalUser);
    externalUser.save();
}

// Sincronizzazione del database
database.sync()
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });
