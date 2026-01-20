import { Customer } from '../models/Database.js';
import { createError } from '../utils/errorUtils.js';

export class CustomerController {
    
    /**
     * Crea un nuovo Customer.
     * Chiamato da Auth-Service durante la registrazione.
     */
    static async createCustomer(req) {
        const { credentialsId, name, surname, phone } = req.body;
        
        if (!credentialsId || !name || !surname) {
            throw new Error('Campi obbligatori mancanti: credentialsId, name, surname');
        }

        // Verifica duplicati (opzionale, basato su credentialsId che è unique)
        const existing = await Customer.findOne({ where: { credentialsId } });
        if (existing) {
             // Se esiste già, ritorniamo l'ID esistente per idempotenza o lanciamo errore
             // Qui lanciamo errore per sicurezza
             throw new Error('Profilo cliente già esistente per queste credenziali');
        }

        if (!credentialsId || !name || !surname) {
            throw new Error('Tutti i campi obbligatori (credentialsId, name, surname) devono essere forniti');
        }   

        const customer = await Customer.create({
            credentialsId,
            name,
            surname,
            phone: phone || 'N/A', // Gestione valore di default
            registrationDate: new Date(),
        });

        return {
            message: 'Customer creato con successo',
            customerId: customer.id,
        };
    }

    static async createCustomerT(credentialsId, name, surname, phone) {

        if (!credentialsId || !name || !surname) {
            throw new Error('Tutti i campi obbligatori (credentialsId, name, surname) devono essere forniti');
        }

        if (phone) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
            if (!phoneRegex.test(phone)) {
                throw new Error('Invalid phone number format');
            }
        }

        try {
            const customer = await Customer.create({
                credentialsId: credentialsId,
                name: name,
                surname: surname,
                phone: phone || null,
                registrationDate: new Date(),
            });

            return {
                message: 'Customer created successfully',
                customerId: customer.id,
            };

        } catch (error) {
            //Intercettiamo l'errore di duplicato
            //(es. SequelizeUniqueConstraintError per Sequelize)
            if (
                error.name === 'SequelizeUniqueConstraintError' ||
                (error.message && error.message.toLowerCase().includes('unique'))
            ) {
                throw createError('Il numero di telefono è già registrato nel sistema', 400);
            }

            throw error;
        }
}

    static async getAllCustomers(req, res) {
        const customers = await Customer.findAll({
            attributes: ['id', 'credentialsId', 'name', 'surname', 'phone', 'registrationDate'],
        });
        return customers;
    }

    static async getCustomerById(customerId) {
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            throw new Error('Customer non trovato');
        }
        return customer;
    }

    static async getCustomersByIds(customerIds) {
        if (!Array.isArray(customerIds)) throw new Error('customerIds deve essere un array');
        return await Customer.findAll({
            where: { id: customerIds }
        });
    }

    static async updateCustomer(req) {
        const { id } = req.params; 
        const { name, surname, phone } = req.body;

        const customer = await Customer.findByPk(id);
        if (!customer) throw new Error('Customer non trovato');

        await customer.update({
            name: name || customer.name,
            surname: surname || customer.surname,
            phone: phone !== undefined ? phone : customer.phone
        });

        return { message: 'Profilo aggiornato con successo', customer };
    }

    static async deleteCustomer(req) {
        const { id } = req.params; 
        const { userId, role } = req; // Dal middleware

        const customer = await Customer.findByPk(id);
        if (!customer) throw new Error('Customer non trovato');

        // Controllo permessi: Solo Admin o il proprietario del profilo
        if (role !== 'admin' && parseInt(userId) !== parseInt(customer.id)) {
            throw new Error('Non autorizzato'); 
        }

        await customer.destroy();
        return { message: 'Customer eliminato con successo' };
    }

    // Metodo interno per recuperare ID dal credentialsId
    static async getCustomerIdByCredentials(credentialsId) {
        const customer = await Customer.findOne({
            where: { credentialsId: credentialsId },
            attributes: ['id'],
        });

        if (!customer) throw new Error('Customer not found for these credentials');
        return customer;
    }
}