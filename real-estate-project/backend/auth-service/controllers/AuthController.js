import { createHash } from 'crypto';
import { Credentials } from '../models/Database.js';
import Jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService.js';

// Import Clients
import { AgencyClient } from '../clients/AgencyClient.js';
import { CustomerClient } from '../clients/CustomerClient.js';
import { ProviderClient } from '../clients/ProviderClient.js';
import {createError} from '../utils/errorUtils.js'

export class AuthController {
    
    // --- UTILS ---

    static async isTokenValid(token) {
        try {
            const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
            const credentials = await Credentials.findByPk(decoded.authId);
            if (!credentials) throw new Error('Utente non trovato nel database');
            return { authId: decoded.authId, userId: decoded.userId, role: decoded.role };
        } catch (error) {
            throw new Error('Token non valido o scaduto');
        }
    }

    static issueToken(authId, userId, role) {
        return { 
            token: Jwt.sign({ authId, userId, role }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: '24h', issuer: 'auth-service' }) 
        };
    }

    // --- LOGIN ---

    static async checkCredentials(req) {
        const { usr, pwd } = req.body;
        if (!usr || !pwd) throw new Error('Email e password sono obbligatori');

        const credentials = await Credentials.findOne({ where: { email: usr } });
        if (!credentials) throw new Error('Credenziali non valide');

        const hashedPwd = createHash('sha256').update(pwd).digest('hex');
        if (hashedPwd !== credentials.password) throw new Error('Credenziali non valide');
        
        const businessId = await AuthService.getBusinessId(credentials.id, credentials.role);
        
        return {
            authId: credentials.id,
            userId: businessId,
            role: credentials.role,
            mustChangePassword: credentials.mustChangePassword
        };
    }

    static async checkCredentialsFromSocial(req) {
        const { usr, providerToken, providerName } = req.body;
        console.log("BODY OTTENUTO", req)
        if (!usr || !providerToken || !providerName) throw new Error('Dati social mancanti');

        const payload = await ProviderClient.validateSocialToken(providerName, providerToken);
        if (!payload || payload.email !== usr) throw new Error('Token social non valido');

        const credentials = await Credentials.findOne({ 
            where: { email: usr, providerId: payload.sub, providerName: providerName } 
        });

        if (!credentials) return null;

        const businessId = await AuthService.getBusinessId(credentials.id, credentials.role);
        return { authId: credentials.id, userId: businessId, role: credentials.role };
    }

    // --- REGISTRAZIONI ---

    static async registerCustomer(req) {
        const { email, password, name, surname, phone } = req.body;
        let newCredentials = null;

        try {
            const existing = await Credentials.findOne({ where: { email } });
            if (existing) throw new Error('Email già registrata');

            newCredentials = await Credentials.create({
                email, password, role: 'customer'
            });

            const customerResponse = await CustomerClient.createCustomer({
                credentialsId: newCredentials.id,
                name: name || 'Nuovo',
                surname: surname || 'Cliente',
                phone: phone || null
            });

            return AuthController.issueToken(newCredentials.id, customerResponse.customerId, 'customer');

        } catch (error) {
            console.error('Errore registerCustomer:', error.message);
            if (newCredentials) await newCredentials.destroy();
            throw error;
        }
    }

    static async registerCustomerFromSocial(req) {
        const { email, name, surname, phone, providerToken, providerName } = req.body;
        let newCredentials = null;

        try {
            const payload = await ProviderClient.validateSocialToken(providerName, providerToken);
            if (!payload || payload.email !== email) throw createError('Token social non valido', 400);

            const existing = await Credentials.findOne({ where: { email } });
            if (existing) throw createError('Email già registrata', 400);

            const existingProviderId = await Credentials.findOne({where: {providerId: payload.sub}});
            if (existingProviderId) throw createError("Utente già registrato", 400);

            newCredentials = await Credentials.create({
                email, password: null, role: 'customer', providerName, providerId: payload.sub
            });

            const customerResponse = await CustomerClient.createCustomer({
                credentialsId: newCredentials.id,
                name: name || payload.given_name,
                surname: surname || payload.family_name,
                phone
            });

            return AuthController.issueToken(newCredentials.id, customerResponse.customerId, 'customer');

        } catch (error) {
            if (newCredentials) await newCredentials.destroy();
            throw error;
        }
    }

    static async registerCompany(req) {
        const { email, password, ...agencyData } = req.body;
        let newCredentials = null;

        try {
            const existing = await Credentials.findOne({ where: { email } });
            if (existing) throw new Error('Email già registrata');

            newCredentials = await Credentials.create({ email, password, role: 'manager' });

            const agencyResult = await AgencyClient.setupAgency({
                credentialsId: newCredentials.id,
                ...agencyData
            });

            const tokenData = AuthController.issueToken(newCredentials.id, agencyResult.adminId, 'manager');

            return {
                message: 'Registrazione completata',
                token: tokenData.token,
                role: 'manager',
                userId: agencyResult.adminId,
                agencyId: agencyResult.agencyId
            };

        } catch (error) {
            console.error('Errore registerCompany:', error.message);
            if (newCredentials) await newCredentials.destroy();
            throw error;
        }
    }

    static async registerAgent(req) {
        const { email, password, ...agentData } = req.body;
        let newCredentials = null;

        try {
            const { role } = req.user; 
            if (role !== 'admin' && role !== 'manager') throw new Error('Non autorizzato');

            newCredentials = await Credentials.create({
                email, password, role: 'agent', mustChangePassword: true
            });

            const agentResponse = await AgencyClient.createAgent(req.headers.authorization, {
                credentialsId: newCredentials.id,
                ...agentData
            });

            return {
                message: 'Agent registrato con successo',
                userId: newCredentials.id,
                agentId: agentResponse.agentId,
            };

        } catch (error) {
            if (newCredentials) await newCredentials.destroy();
            throw error;
        }
    }

    static async registerAdmin(req) {
        const { email, password, ...adminData } = req.body;
        let newCredentials = null;

        try {
            const { role } = req.user;
            if (role !== 'manager') throw new Error('Non autorizzato');

            newCredentials = await Credentials.create({
                email, password, role: 'admin', mustChangePassword: true
            });

            const adminResponse = await AgencyClient.createAdmin(req.headers.authorization, {
                credentialsId: newCredentials.id,
                ...adminData
            });

            return {
                message: 'Admin registrato con successo',
                userId: newCredentials.id,
                adminId: adminResponse.adminId,
            };

        } catch (error) {
            if (newCredentials) await newCredentials.destroy();
            throw error;
        }
    }

    // --- CRUD CREDENTIALS ---

    static async validateToken(req) {
        const { token } = req.body;
        if (!token) throw new Error('Token mancante');
        const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
        return { authId: decoded.authId, userId: decoded.userId, role: decoded.role };
    }

    static async getCredentialsById(req) {
        const credentials = await Credentials.findByPk(req.params.id);
        if (!credentials) throw new Error('Credenziali non trovate');
        // Ritorniamo solo i dati sicuri
        return { 
            id: credentials.id, 
            email: credentials.email, 
            role: credentials.role 
        };
    }

    static async getCredentialsByIds(req) {
        const { authIds } = req.body;
        return await Credentials.findAll({
            where: { id: authIds }
        });
    }

    static async updateCredentials(req) {
        const { email, password } = req.body;
        const credentials = await Credentials.findByPk(req.params.id);
        
        if (!credentials) {
            throw new Error('Credenziali non trovate');
        }

        if (email) credentials.email = email;
        if (password) credentials.password = password; 
        
        await credentials.save();
        return { message: 'Credenziali aggiornate' };
    }

    static async deleteCredentials(req) {
        const { id } = req.params;
        const { authId, role } = req.user;
        
        const credentials = await Credentials.findByPk(id);
        if (!credentials) {
            throw new Error('Credenziali non trovate');
        }

        // Controllo: Solo Admin o il proprietario dell'account possono cancellare
        if (role !== 'admin' && parseInt(authId) !== parseInt(id)) {
            throw new Error('Non autorizzato');
        }

        await credentials.destroy();
        return { message: 'Credenziali eliminate' };
    }

    static async checkUser(id) {
        const user = await Credentials.findByPk(id);
        if (!user) throw new Error("User not found");
        return true;
    }

    static async changePasswordFirstLogin(id, pwd) {
        const credentials = await Credentials.findByPk(id);
        if (!credentials) throw new Error('Utente non trovato');
        credentials.password = pwd;
        credentials.mustChangePassword = false;
        await credentials.save();
    }
}