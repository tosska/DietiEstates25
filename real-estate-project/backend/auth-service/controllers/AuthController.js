import { createHash } from 'crypto';
import { Credentials } from '../models/Database.js';
import Jwt from 'jsonwebtoken';

export class AuthController {
    static async checkCredentials(req) {
        const { usr, pwd } = req.body;
        if (!usr || !pwd) {
            throw new Error('Email e password sono obbligatori');
        }

        const hashedPwd = createHash('sha256').update(pwd).digest('hex');
        const credentials = await Credentials.findOne({
            where: { Email: usr, password: hashedPwd },
        });

        if (!credentials) {
            return null;
        }

        return { userId: credentials.ID, role: credentials.role };
    }

    static issueToken(userId, role) {
        return { token: Jwt.sign({ userId, role }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s` }) };
    }

    static async validateToken(req, res) {
        const { token } = req.body;
        if (!token) {
            throw new Error('Token mancante nel corpo della richiesta');
        }
        const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
        return {
            userId: decoded.userId,
            role: decoded.role,
        };
    }

    static async registerCustomer(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error('Email e password sono obbligatori');
        }

        const newCredentials = await Credentials.create({
            Email: email,
            password: password,
            role: 'customer',
        });

        const response = await fetch('http://localhost:3002/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credentialsId: newCredentials.ID, // Aggiunto
                email: email,
                password: password,
                name: req.body.name || 'Nuovo',
                surname: req.body.surname || 'Cliente',
                phone: req.body.phone || null,
            }),
        });

        if (!response.ok) {
            await newCredentials.destroy();
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore durante la creazione del customer');
        }

        return { userId: newCredentials.ID, role: 'customer', token: Jwt.sign({ userId: newCredentials.ID, role: 'customer' }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s` }) };
    }

    static async registerAgent(req, res) {
        const { role } = req.user;
        if (role !== 'admin') {
            throw new Error('Solo un admin può registrare un agent');
        }

        const { email, password, agencyId } = req.body;
        if (!email || !password || !agencyId) {
            throw new Error('Email, password e agencyId sono obbligatori');
        }

        const newCredentials = await Credentials.create({
            Email: email,
            password: password,
            role: 'agent',
        });

        const response = await fetch('http://localhost:3000/agents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
            },
            body: JSON.stringify({
                credentialsId: newCredentials.ID,
                email: email,
                password: password,
                agencyId: agencyId,
                creatorAdminId: req.user.userId,
            }),
        });

        if (!response.ok) {
            await newCredentials.destroy();
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore durante la creazione dell\'agent');
        }

        return { userId: newCredentials.ID, role: 'agent', token: Jwt.sign({ userId: newCredentials.ID, role: 'agent' }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s` }) };
    }

    static async registerAdmin(req, res) {
        const { role, userId } = req.user;
        if (role !== 'admin') {
            throw new Error('Solo un admin può registrare un admin');
        }

        const adminResponse = await fetch(`http://localhost:3000/admins/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': req.headers.authorization,
            },
        });

        if (!adminResponse.ok) {
            const errorData = await adminResponse.json();
            throw new Error(errorData.message || 'Errore nel verificare lo stato di Manager');
        }

        const adminData = await adminResponse.json();
        if (!adminData.Manager) {
            throw new Error('Solo un Manager può registrare un admin');
        }

        const { email, password, agencyId } = req.body;
        if (!email || !password) {
            throw new Error('Email e password sono obbligatori');
        }

        const newCredentials = await Credentials.create({
            Email: email,
            password: password,
            role: 'admin',
        });

        const response = await fetch('http://localhost:3000/admins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
            },
            body: JSON.stringify({
                credentialsId: newCredentials.ID,
                email: email,
                password: password,
                agencyId: agencyId || null,
                manager: req.body.manager || false,
            }),
        });

        if (!response.ok) {
            await newCredentials.destroy();
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore durante la creazione dell\'admin');
        }

        return { userId: newCredentials.ID, role: 'admin', token: Jwt.sign({ userId: newCredentials.ID, role: 'admin' }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s` }) };
    }




    static async isTokenValid(token) {
          try {
              const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
              const credentials = await Credentials.findByPk(decoded.userId);
              if (!credentials) {
                  throw new Error('Utente non trovato');
              }
              return { userId: decoded.userId, role: decoded.role };
          } catch (error) {
              throw new Error('Token non valido');
          }
      }
}