
/*
import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express(); // creates an express application
const PORT = 3004;

app.use(cors()); 

// Parse incoming requests with a JSON payload
app.use(express.json());

//error handler
app.use( (err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
        code: err.status || 500,
        description: err.message || "An error occurred"
    });
});


app.listen(PORT);
*/

console.log("ciao");

import { Sequelize } from "sequelize";
import { createOfferModel } from "./models/Offer.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env

export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});
console.log("ciao duce");
// Crea i modelli
createOfferModel(database);

// Esporta i modelli
export const { Offer } = database.models;


// Sincronizzazione del database
database.sync({alter: true})
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });