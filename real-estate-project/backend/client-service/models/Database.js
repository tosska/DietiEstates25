// import { Sequelize } from "sequelize";
// import { createModel as createCustomerModel } from "./Customer.js";

// import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env

// export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
//     dialect: process.env.DIALECT
// });

// // Crea i modelli
// createCustomerModel(database);

// // Esporta i modelli
// export const { Customer } = database.models;

// if(!Customer.findByPk(0)){
//     console.log("Creazione customer esterno di default con ID 0");
//     let externalCustomer = {
//         id: 0, 
//         name: "External",
//         surname: "Customer",
//         registrationDate: new Date(0),
//         phone: "N/A",
//         credentialsId: 0
//     };
//     externalCustomer = Customer.build(externalCustomer);
//     externalCustomer.save();
// }

// // Sincronizzazione del database
// database.sync()
//     .then(() => {
//         console.log("Database sincronizzato correttamente");
//     })
//     .catch(err => {
//         console.error("Errore nella sincronizzazione del database: " + err.message);
//     });

import { Sequelize } from "sequelize";
import { createModel as createCustomerModel } from "./Customer.js";
import 'dotenv/config.js';

export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createCustomerModel(database);

// Esporta i modelli
export const { Customer } = database.models;

async function initDatabase() {
    try {
        await database.sync();
        console.log("Database sincronizzato correttamente");

        const existingCustomer = await Customer.findByPk(0);

        if (!existingCustomer) {
            console.log("Creazione customer esterno di default con ID 0");

            await Customer.create({
                id: 0,
                name: "External",
                surname: "Customer",
                registrationDate: new Date(0),
                phone: "N/A",
                credentialsId: 0
            });
        } else {
            console.log("Customer esterno già presente");
        }

    } catch (err) {
        console.error("Errore nella sincronizzazione del database:", err.message);
    }
}

initDatabase();
