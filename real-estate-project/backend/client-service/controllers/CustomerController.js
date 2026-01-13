import { Customer } from '../models/Database.js';

export class CustomerController {
    
    static async createCustomer(credentialsId, name, surname, phone) {

        if (!credentialsId || !name || !surname) {
            throw new Error('Tutti i campi obbligatori (credentialsId, name, surname) devono essere forniti');
        }   

        const customer = await Customer.create({
            credentialsId: credentialsId,
            name: name,
            surname: surname,
            phone: phone || null,
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

        if(phone) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
            if(!phoneRegex.test(phone)) {
                throw new Error('Invalid phone number format');
            }
        }

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
    }

    static async getAllCustomers(req, res) {
        const customers = await Customer.findAll({
            attributes: ['id', 'credentialsId', 'name', 'surname', 'phone', 'registrationDate'],
        });
        return customers;
    }

    // MODIFICATO: Rimosso il recupero dell'email. Ritorna solo i dati del DB locale.
    static async getCustomerById(customerId) {
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            throw new Error('Customer non trovato');
        }
        return customer;
    }

    static async getCustomersByIds(customerIds) {
        const customers = await Customer.findAll({
            where: {
                id: customerIds
            }});

        return customers;
    }

    static async updateCustomer(req, res) {
        let responseSent = false;

        try {
            const { id } = req.params; 
            const { name, surname, phone } = req.body;

            const customer = await Customer.findOne({
                where: { id: id }
            });
            
            if (!customer) {
                res.status(404).json({ error: 'Customer non trovato' });
                responseSent = true;
                return;
            }

            const updateData = {
                name: name || customer.name,
                surname: surname || customer.surname,
                phone: phone !== undefined ? phone : customer.phone
            };
            
            await customer.update(updateData);
            
            // Nessuna gestione email/password qui

            res.status(200).json({ message: 'Profilo aggiornato con successo' });
            responseSent = true;
        } catch (error) {
            if (!responseSent) {
                console.error('Errore update customer:', error);
                res.status(500).json({ error: error.message || 'Errore interno' });
            }
        }
    }

    static async deleteCustomer(req, res) {
        let responseSent = false;
        try {
            const { id } = req.params; 
            const { userId, role } = req;

            const customer = await Customer.findOne({
                where: { id: id }
            });
            if (!customer) {
                res.status(404).json({ error: 'Customer non trovato' });
                responseSent = true;
                return;
            }

            if (role !== 'admin' && parseInt(userId) !== customer.id) {
                res.status(403).json({ error: 'Non autorizzato' });
                responseSent = true;
                return;
            }


            await customer.destroy();
            res.status(200).json({ message: 'Customer eliminato con successo' });
            responseSent = true;
        } catch (error) {
            if (!responseSent) {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async getCustomerId(req){
        const credentialsId = req.params.id;
        const customerId = await Customer.findOne({
            where: { credentialsId: credentialsId },
            attributes: ['id'],
        });

        if (!customerId) {
            throw new Error('Customer not found');
        }
        return customerId
    }
}