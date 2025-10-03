import { Agency, Address, Admin, database } from '../models/Database.js';
import { createHash } from 'crypto';


export class AgencyController {
    // Recupera tutte le agenzie
    static async getAllAgencies(req, res) {
        const agencies = await Agency.findAll({
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['AdminID', 'Email'] },
            ],
            attributes: ['AgencyID', 'Phone', 'Description', 'VAT_Number', 'Website', 'ManagerAdmin_ID', 'Address_ID'],
        });
        return agencies;
    }

    // Crea una nuova agenzia con il relativo indirizzo
    static async createAgency(req, res) {
        const { email, password, phone, description, vatNumber, website, street, city, postalCode, state, unitDetail, longitude, latitude } = req.body;

        let transaction;
        try {
        console.log('Dati ricevuti per creare agenzia:', { email, phone, description, vatNumber, website, street, city, postalCode, state, unitDetail, longitude, latitude });

        // Verifica che req.database sia definito
        if (!database || typeof database.transaction !== 'function') {
            throw new Error('Database non configurato correttamente');
        }

        // Validazione dei campi obbligatori
        if (!street || !city || !postalCode || !state || !unitDetail) {
            throw new Error('Campi obbligatori mancanti: street, city, postalCode, state, unitDetail');
        }

        // Inizia la transazione
        transaction = await database.transaction();

        // Crea un nuovo indirizzo
        const address = await Address.create({
            street: street,
            city: city,
            postalCode: postalCode,
            state: state,
            unitDetail: unitDetail,
            longitude: longitude,
            latitude: latitude,
        }, { transaction });
        console.log('Indirizzo creato con ID:', address.id);

        // Crea l'agenzia con il nuovo Address_ID
        const agency = await Agency.create({
            Phone: phone,
            Description: description,
            VAT_Number: vatNumber,
            Website: website,
            ManagerAdmin_ID: null,
            Address_ID: address.id,
        }, { transaction });
        console.log('Agenzia creata con ID:', agency.AgencyID);

        // Chiama /register/manager in auth-service
        console.log('Invio richiesta a /register/manager:', { email, password, role: 'admin', agencyId: agency.AgencyID });

        const managerResponse = await fetch('http://localhost:3001/register/manager', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            email,
            password: password,
            role: 'admin',
            agencyId: agency.AgencyID,
            }),
        });

        const managerResponseText = await managerResponse.clone().text();
        console.log('Risposta grezza da /register/manager:', managerResponseText);

        if (!managerResponse.ok) {
            const errorData = await managerResponse.json();
            throw new Error(errorData.message || 'Errore durante la registrazione del manager');
        }

        const managerData = await managerResponse.json();
        const adminId = managerData.userId;

        // Verifica se l'Admin esiste già in agency-service usando AdminID
        const existingAdmin = await Admin.findByPk(adminId, { transaction });
        if (existingAdmin) {
            console.log('Admin esistente trovato con ID:', existingAdmin.AdminID);
            // Aggiorna i dati dell'admin esistente con il nuovo Agency_ID
            await existingAdmin.update({ Agency_ID: agency.AgencyID }, { transaction });
        } else {
            // Crea l'Admin in agency-service solo se non esiste
            await Admin.create({
            AdminID: adminId,
            Manager: true,
            Agency_ID: agency.AgencyID, // Obbligatorio
            role: 'admin',
            credentialsId: managerData.userId, // Potrebbe essere collegato a Credentials in auth-service
            }, { transaction });
            console.log('Admin creato in agency-service con ID:', adminId);
        }

        // Aggiorna ManagerAdmin_ID
        await agency.update({ ManagerAdmin_ID: adminId }, { transaction });
        console.log('Agenzia aggiornata con ManagerAdmin_ID:', adminId);

        // Commit della transazione se tutto è andato bene
        await transaction.commit();

        return {
            agencyId: agency.AgencyID,
            adminId: adminId,
            token: managerData.token,
        };
        } catch (error) {
        // Rollback in caso di errore
        if (transaction) await transaction.rollback();
        console.error('Errore in createAgency:', error);
        throw new Error(`Errore durante la creazione dell'agenzia: ${error.message}`);
        }
    }

}