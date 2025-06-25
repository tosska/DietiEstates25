import { Customer } from '../models/Database.js';

export class CustomerController {
    static async createCustomer(req, res) {
        const { credentialsId, email, password, name, surname, phone } = req.body;
        const fields = ['credentialsId', 'email', 'password', 'name', 'surname']; // Aggiunto credentialsId
        if (!fields.every(field => req.body[field])) {
            throw new Error('Tutti i campi obbligatori (credentialsId, email, password, name, surname) devono essere forniti');
        }

        const customer = await Customer.create({
            CredentialsID: credentialsId,
            Email: email,
            password: password,
            Name: name,
            Surname: surname,
            Phone: phone || null,
            Registration_Date: new Date(),
        });

        return {
            message: 'Customer creato con successo',
            customerId: customer.CustomerID,
        };
    }

    static async getAllCustomers(req, res) {
        const customers = await Customer.findAll({
            attributes: ['CustomerID', 'CredentialsID', 'Email', 'Name', 'Surname', 'Phone', 'Registration_Date'], // Aggiunto CredentialsID
        });
        return customers;
    }

    static async getCustomerById(req, res) {
        const { id } = req.params;
        const customer = await Customer.findByPk(id, {
            attributes: ['CustomerID', 'CredentialsID', 'Email', 'Name', 'Surname', 'Phone', 'Registration_Date'], // Aggiunto CredentialsID
        });
        if (!customer) {
            throw new Error('Customer non trovato');
        }
        return customer;
    }

    static async updateCustomer(req, res) {
        const { id } = req.params;
        const { email, password, name, surname, phone } = req.body;
        const { userId, role } = req.user;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            throw new Error('Customer non trovato');
        }

        // Autorizza admin o il customer stesso (usando CredentialsID per il controllo)
        if (role !== 'admin' && parseInt(userId) !== customer.CredentialsID) {
            throw new Error('Non autorizzato a modificare questo customer');
        }

        await customer.update({
            Email: email || customer.Email,
            password: password || customer.password,
            Name: name || customer.Name,
            Surname: surname || customer.Surname,
            Phone: phone !== undefined ? phone : customer.Phone,
        });

        return { message: 'Customer aggiornato con successo' };
    }

    static async deleteCustomer(req, res) {
        const { id } = req.params;
        const { userId, role } = req.user;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            throw new Error('Customer non trovato');
        }

        // Autorizza admin o il customer stesso (usando CredentialsID per il controllo)
        if (role !== 'admin' && parseInt(userId) !== customer.CredentialsID) {
            throw new Error('Non autorizzato a eliminare questo customer');
        }

        await customer.destroy();
        return { message: 'Customer eliminato con successo' };
    }
}