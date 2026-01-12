import { Sequelize } from "sequelize";
import { createModel as createAgentModel } from "./Agent.js";
import { createModel as createAdminModel } from "./Admin.js";
import { createModel as createAgencyModel } from "./Agency.js";
import { createModel as createAddressModel } from "./Address.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env

export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createAgentModel(database);
createAdminModel(database);
createAgencyModel(database);
createAddressModel(database);

// Esporta i modelli
export const { Agent } = database.models;
export const { Admin } = database.models;
export const { Agency } = database.models;
export const { Address } = database.models;

// Relazioni
Agent.belongsTo(Agency, { foreignKey: 'agencyId' });
Agency.belongsTo(Admin, { foreignKey: 'managerAdminId', as: 'ManagerAdmin' });
Agency.belongsTo(Address, { foreignKey: 'addressId' });

// Sincronizzazione del database
database.sync()
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });
