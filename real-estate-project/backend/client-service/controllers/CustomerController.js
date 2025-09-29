import { Customer } from '../models/Database.js';

export class CustomerController {
    static async createCustomer(req, res) {
        const { credentialsId, name, surname, phone } = req.body;
        const fields = ['credentialsId', 'name', 'surname']; // Aggiunto credentialsId
        if (!fields.every(field => req.body[field])) {
            throw new Error('Tutti i campi obbligatori (credentialsId, name, surname) devono essere forniti');
        }

        const customer = await Customer.create({
            CredentialsID: credentialsId,
            Name: name,
            Surname: surname,
            Phone: phone || null,
            Registration_Date: new Date(),
        });

        return {
            message: 'Customer creato con successo',
            customerId: customer.id,
        };
    }

    static async getAllCustomers(req, res) {
        const customers = await Customer.findAll({
            attributes: ['id', 'CredentialsID', 'Name', 'Surname', 'Phone', 'Registration_Date'], // Aggiunto CredentialsID
        });
        return customers;
    }

    static async getCustomerById(req, res) {
        const { id } = req.params;
        const customer = await Customer.findOne({
            where: { CredentialsID: id },
            attributes: ['id', 'CredentialsID', 'Name', 'Surname', 'Phone', 'Registration_Date'], // Aggiunto CredentialsID
        });
        if (!customer) {
            throw new Error('Customer non trovato');
        }
        return customer;
    }

    static async updateCustomer(req, res) {
        let responseSent = false;

        try {
            const { id } = req.params; // Questo è CredentialsID
            const { email, password, name, surname, phone } = req.body;
            const { userId, role } = req.user;

            console.log('Richiesta updateCustomer - ID:', id, 'Body:', req.body, 'User:', { userId, role });

            // Cerca il customer usando CredentialsID
            const customer = await Customer.findOne({
                where: { CredentialsID: id }
            });
            if (!customer) {
                console.log('Customer non trovato per CredentialsID:', id);
                res.status(404).json({ error: 'Customer non trovato' });
                responseSent = true;
                return;
            }

            // Autorizza admin o il customer stesso
            if (role !== 'admin' && parseInt(userId) !== customer.CredentialsID) {
                console.log('Autorizzazione fallita per userId:', userId, 'e CredentialsID:', customer.CredentialsID);
                res.status(403).json({ error: 'Non autorizzato a modificare questo customer' });
                responseSent = true;
                return;
            }

            // Aggiorna i campi del Customer
            const updateData = {
                Name: name || customer.Name,
                Surname: surname || customer.Surname,
                Phone: phone !== undefined ? phone : customer.Phone
            };
            console.log('Dati da aggiornare in Customer:', updateData);
            const updatedCustomer = await customer.update(updateData); // Restituisce l'istanza aggiornata
            console.log('Customer aggiornato:', updatedCustomer.toJSON());

            // Se email o password sono forniti, chiama l'auth-service
            if (email || password) {
                const authServiceUrl = 'http://localhost:3001/credentials/' + id;
                const credentialsUpdateData = {};
                if (email) credentialsUpdateData.Email = email;
                if (password) credentialsUpdateData.password = password;

                console.log('Chiamata a auth-service per CredentialsID:', id, 'Dati:', credentialsUpdateData);
                const fetchResponse = await fetch(authServiceUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentialsUpdateData)
                });

                if (!fetchResponse.ok) {
                    const errorData = await fetchResponse.json();
                    console.error('Errore dal auth-service:', fetchResponse.status, errorData);
                    res.status(fetchResponse.status).json({ error: errorData.error || 'Errore nella sincronizzazione con auth-service' });
                    responseSent = true;
                    return;
                }
                console.log('Risposta dal auth-service:', await fetchResponse.json());
            }

            // Successo
            res.status(200).json({ message: 'Customer aggiornato con successo' });
            responseSent = true;
        } catch (error) {
            if (!responseSent) {
                console.error('Errore nell\'aggiornamento del customer:', error);
                res.status(500).json({ error: error.message || 'Errore interno del server' });
            }
        }
    }

    static async deleteCustomer(req, res) {
        let responseSent = false;

        try {
            const { id } = req.params; // Questo è CredentialsID
            const { userId, role } = req.user;

            console.log('Richiesta deleteCustomer - ID:', id, 'User:', { userId, role }, 'Header Authorization ricevuto:', req.headers.authorization);

            // Cerca il customer usando CredentialsID
            const customer = await Customer.findOne({
                where: { CredentialsID: id }
            });
            if (!customer) {
                console.log('Customer non trovato per CredentialsID:', id);
                res.status(404).json({ error: 'Customer non trovato' });
                responseSent = true;
                return;
            }

            // Autorizza admin o il customer stesso
            if (role !== 'admin' && parseInt(userId) !== customer.CredentialsID) {
                console.log('Autorizzazione fallita per userId:', userId, 'e CredentialsID:', customer.CredentialsID);
                res.status(403).json({ error: 'Non autorizzato a eliminare questo customer' });
                responseSent = true;
                return;
            }

            // Elimina prima le credenziali dal auth-service
            const authServiceUrl = 'http://localhost:3001/credentials/' + id;
            const authToken = req.headers.authorization; // Usa il token ricevuto
            if (!authToken || !authToken.startsWith('Bearer ')) {
                console.error('Token mancante o formato errato nel deleteCustomer:', authToken);
                res.status(401).json({ error: 'Token mancante o formato errato' });
                responseSent = true;
                return;
            }

            console.log('Chiamata DELETE a auth-service:', authServiceUrl, 'con token:', authToken);
            const fetchResponse = await fetch(authServiceUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken // Passa il token originale
                }
            });

            if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json().catch(() => ({ error: 'Errore sconosciuto dal auth-service' }));
                console.error('Errore dal auth-service:', fetchResponse.status, errorData);
                res.status(fetchResponse.status).json({ error: errorData.error || 'Errore nella sincronizzazione con auth-service' });
                responseSent = true;
                return;
            }
            console.log('Risposta dal auth-service:', await fetchResponse.json());

            // Elimina il customer
            console.log('Eliminazione del customer con CustomerID:', customer.id);
            await customer.destroy();
            console.log('Customer eliminato con successo');

            res.status(200).json({ message: 'Customer eliminato con successo' });
            responseSent = true;
        } catch (error) {
            if (!responseSent) {
                console.error('Errore nell\'eliminazione del customer:', error);
                res.status(500).json({ error: error.message || 'Errore interno del server' });
            }
        }
    }

    static async getCustomerId(req){

        const credentialsId = req.params.id;

        const customerId = await Customer.findOne({
            where: { CredentialsID: credentialsId },
            attributes: ['id'],
        });

        if (!customerId) {
            throw new Error('Customer not found');
        }

        return customerId
    }
}