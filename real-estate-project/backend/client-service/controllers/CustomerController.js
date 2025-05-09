import { Op } from "sequelize";
import Jwt from "jsonwebtoken";
import { Customer } from "../models/Database.js"


export class CustomerController { 

  // Validazione dei campi obbligatori (ignora maiuscole/minuscole)
  static validateRequiredFields(req, fields) {
    return fields.every(field => {
      const normalizedField = field.toLowerCase();
      return req.body[normalizedField] !== undefined && req.body[normalizedField] !== '';
    });
  }

  // Creazione di un nuovo Customer
  static async createCustomer(req, res) {
    const fields = ['email', 'password', 'name', 'surname', 'phone'];
    if (!this.validateRequiredFields(req, fields)) {
      throw new Error('Tutti i campi sono obbligatori');
    }

    const { email, password, name, surname, phone } = req.body;

    // Creazione del cliente nel database
    // Registration_Date sarà impostato automaticamente dal modello
    const customer = await Customer.create({
      email: email,
      password: password,
      name: name,
      surname: surname,
      phone: phone,
    });

    return { message: 'Cliente creato con successo', userId: customer.customerId };
  }
}