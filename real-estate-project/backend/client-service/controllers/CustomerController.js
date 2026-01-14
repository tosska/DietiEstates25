import { Customer } from '../models/Database.js';

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

    static async getAllCustomers() {
        return await Customer.findAll({
            attributes: ['id', 'credentialsId', 'name', 'surname', 'phone', 'registrationDate'],
        });
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