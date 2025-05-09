import { Op } from "sequelize";
import Jwt from "jsonwebtoken";

// URL dei microservizi (da configurare in .env o hardcoded per ora)
const CLIENT_SERVICE_URL = 'http://localhost:3002';
const AGENCY_SERVICE_URL = 'http://agency-service:3000';

/**
 * Controller for handling authentication related operations.
 */
export class AuthController { 

    // Validazione dei campi obbligatori
    static validateRequiredFields(req, fields) {
        return fields.every(field => req.body[field]);
    }

    // Registrazione di un Customer
    static async registerCustomer(req, res) {
        const fields = ['email', 'password', 'name', 'surname', 'phone'];
        if (!this.validateRequiredFields(req, fields)) {
        throw new Error('Tutti i campi sono obbligatori');
        }

        const { email, password, name, surname, phone } = req.body;

        const payload = {
            email: email,
            password: password,
            name: name,
            surname: surname,
            phone: phone,
        };

        console.log('Invio richiesta a:', `${CLIENT_SERVICE_URL}/register/customer`, 'con payload:', payload);
        try {
            const response = await fetch(`${CLIENT_SERVICE_URL}/register/customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Risposta da client-service:', data);

            if (!response.ok) throw new Error(data.message);

            return { message: 'Cliente registrato con successo', userId: data.userId };
        } catch (error) {
            console.error('Errore fetch:', error.message);
            throw error;
        }
    }


    // Verifica che l'utente sia un admin
    static async verifyAdmin(token) {
        const response = await fetch(`${AGENCY_SERVICE_URL}/admins/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok || data.role !== 'admin') {
            throw new Error('Solo un admin può creare un agent');
        }

        return true;
    }

    // Registrazione di un Agent
    static async registerAgent(req, res) {
        const fields = ['email', 'password', 'name', 'surname'];
        if (!this.validateRequiredFields(req, fields)) {
        throw new Error('Tutti i campi sono obbligatori');
        }

        await this.verifyAdmin(req.headers.authorization?.split(' ')[1]);

        const { email, password, name, surname } = req.body;

        const payload = {
        Email: email,
        password: password, // Password in chiaro, sarà criptata da agency-service
        Name: name,
        Surname: surname,
        };

        const response = await fetch(`${AGENCY_SERVICE_URL}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        return { message: 'Agent registrato con successo', userId: data.userId };
    }

    // Verifica che l'utente sia un Manager della stessa agenzia
    static async verifyManager(token, agencyId) {
        const response = await fetch(`${AGENCY_SERVICE_URL}/admins/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        });
        const data = await response.json();

        if (!response.ok || !data.Manager || data.Agency_ID !== parseInt(agencyId)) {
        throw new Error('Solo un Manager della stessa agenzia può creare un admin');
        }

        return true;
    }

    // Registrazione di un Admin
    static async registerAdmin(req, res) {
        const fields = ['email', 'password', 'name', 'agencyId'];
        if (!this.validateRequiredFields(req, fields)) {
        throw new Error('Tutti i campi sono obbligatori');
        }

        await this.verifyManager(req.headers.authorization?.split(' ')[1], req.body.agencyId);

        const { email, password, name, agencyId } = req.body;

        const payload = {
        Email: email,
        password: password, // Password in chiaro, sarà criptata da agency-service
        Manager: name,
        Agency_ID: agencyId,
        };

        const response = await fetch(`${AGENCY_SERVICE_URL}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        return { message: 'Admin registrato con successo', userId: data.userId };
    }

    // Validazione del token
    static async validateToken(req, res) {
        const { token } = req.body;
        if (!token) {
        throw new Error('Token mancante nel corpo della richiesta');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        };
    }
    

  
    static issueToken(username) {
        return Jwt.sign({user:username}, process.env.TOKEN_SECRET, {expiresIn: `${24*60*60}s`});
    }

    static isTokenValid(token, callback) {
        Jwt.verify(token, process.env.TOKEN_SECRET, callback);
    }

}