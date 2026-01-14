import { createHash } from 'crypto';
import { Credentials } from '../models/Database.js';
import Jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService.js';
import { AgencyClient } from '../clients/AgencyClient.js';
import { CustomerClient } from '../clients/CustomerClient.js'; 
import { ProviderClient } from '../clients/ProviderClient.js';

export class AuthController {
    
    // --- LOGIN E CONTROLLI (Logica invariata) ---

    static async checkCredentials(req) {
        const { usr, pwd } = req.body;
        if (!usr || !pwd) throw new Error('Email e password sono obbligatori');

        const credentials = await Credentials.findOne({ where: { email: usr } });
        if (!credentials) throw new Error('Invalid credentials 1');

        const hashedPwd = createHash('sha256').update(pwd).digest('hex');
        if (hashedPwd !== credentials.password) throw new Error('Invalid credentials 2');

        const businessId = await AuthService.getBusinessId(credentials.id, credentials.role);
        if (!businessId) throw new Error('Impossibile recuperare l\'ID business');

        return {
            authId: credentials.id,
            userId: businessId,
            role: credentials.role,
            mustChangePassword: credentials.mustChangePassword
        };
    }

    static async checkCredentialsFromSocial(req) {
        const { usr, providerToken, providerName } = req.body;
        if (!usr || !providerToken || !providerName) throw new Error('Dati social mancanti');

        const payload = await ProviderClient.validateSocialToken(providerName, providerToken);
        if (!payload || payload.email !== usr) throw new Error('Token social non valido');

        const credentials = await Credentials.findOne({
            where: { email: usr, providerId: payload.sub, providerName: providerName },
        });

        if (!credentials) return null;

        const businessId = await AuthService.getBusinessId(credentials.id, credentials.role);
        if (!businessId) throw new Error('Impossibile recuperare l\'ID business');

        return { authId: credentials.id, userId: businessId, role: credentials.role };
    }

    // --- REGISTRAZIONI (REFATTORIZZATE) ---

    // 1. REGISTRAZIONE CLIENTE

    static async updateCredentials(credentialId, email, password) {
        

        const credentials = await Credentials.findByPk(credentialId);
        if (!credentials) {
            throw new Error('Credentials not found');
        }

        const updateData = {};
        if (email) updateData.email = email;
        if (password) updateData.password = password; // Verrà hashatto dal set hook
        await credentials.update(updateData);

        return { message: 'Credenziali aggiornate con successo' };
        
    }

    static async updateCredentialsT(credentialId, email, password) {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if(!email || !password){
            throw new Error('Email and/or Password missing');
        }

        if (!emailRegex.test(email)) {
            throw new Error('Formato email non valido');
        }

        if(!passwordRegex.test(password)) {
            throw new Error('Password debole: deve contenere almeno 8 caratteri, una lettera e un numero');
        }

        const credentials = await Credentials.findByPk(credentialId);
        if (!credentials) {
            throw new Error('Credentials not found');
        }
        
        const updateData = {};
        updateData.email = email;
        updateData.password = password;
        
        await credentials.update(updateData);

        return { message: 'Credenziali aggiornate con successo' };
        
    }

    static async deleteCredentials(req, res) {
        let responseSent = false;

        try {
            const { id } = req.params;
            // Estraiamo authId dal token decodificato (req.user)
            const { userId, role, authId } = req.user; 

            console.log('Richiesta deleteCredentials - ID:', id, 'Token AuthID:', authId);

            const credentials = await Credentials.findByPk(id);
            if (!credentials) {
                res.status(404).json({ message: 'Credenziali non trovate' });
                responseSent = true;
                return;
            }

            // CORREZIONE FONDAMENTALE:
            // Confrontiamo l'authId del token (es. 80) con l'ID richiesto (es. 80).
            // NON usare userId (es. 7) qui.
            if (role !== 'admin' && parseInt(authId) !== parseInt(id)) {
                console.log(`Accesso negato: Token AuthID ${authId} vs Richiesto ${id}`);
                res.status(403).json({ message: 'Non autorizzato' });
                responseSent = true;
                return;
            }

            // Elimina SOLO le credenziali.
            // La cancellazione a cascata del Customer deve essere gestita dal DB (ON DELETE CASCADE).
            await credentials.destroy();
            console.log('Credenziali eliminate con successo.');

            res.status(200).json({ message: 'Credenziali eliminate con successo' });
            responseSent = true;
        } catch (error) {
            if (!responseSent) {
                console.error('Errore nell\'eliminazione delle credenziali:', error);
                res.status(500).json({ message: `Errore durante l'eliminazione: ${error.message}` });
            }
        }
    }

    static issueToken(authId, userId, role) {
        try {
            return { token: Jwt.sign({ authId, userId, role }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s`, issuer: 'auth-service' }) };
        } catch (error) {
            console.log(error);
        }
    }

    static async validateToken(req, res) {
        const { token } = req.body;
        if (!token) {
            throw new Error('Token mancante nel corpo della richiesta');
        }
        const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
        return {
            authId: decoded.authId,
            userId: decoded.userId,
            role: decoded.role,
        };
    }

    static async registerCustomer(req, res) {
        const { email, password, name, surname, phone } = req.body;
        if (!email || !password) throw new Error('Email e password obbligatori');
        
        const existing = await Credentials.findOne({ where: { email } });
        if (existing) throw new Error('Email già registrata');

        const newCredentials = await Credentials.create({ email, password, role: 'customer' });

        try {
            // Uso il Client invece della fetch manuale
            const customerResponse = await CustomerClient.createCustomer({
                credentialsId: newCredentials.id,
                name: name || 'Nuovo',
                surname: surname || 'Cliente',
                phone: phone || null,
            });

            return AuthController.issueToken(newCredentials.id, customerResponse.customerId, 'customer');

        } catch (error) {
            await newCredentials.destroy(); // Rollback
            throw error;
        }
    }

    // 2. REGISTRAZIONE CLIENTE SOCIAL
    static async registerCustomerFromSocial(req, res) {
        const { email, name, surname, phone, providerToken, providerName } = req.body;
        
        if (!email || !providerToken || !providerName) throw new Error('Dati social mancanti');
        const existing = await Credentials.findOne({ where: { email } });
        if (existing) throw new Error('Email già registrata');

        const payload = await ProviderClient.validateSocialToken(providerName, providerToken);
        if (!payload || payload.email !== email) throw new Error('Token social non valido');

        const newCredentials = await Credentials.create({
            email, password: null, role: 'customer', providerName, providerId: payload.sub
        });    

        try {
            // Uso il Client
            const customerResponse = await CustomerClient.createCustomer({
                credentialsId: newCredentials.id,
                name: name || payload.given_name,
                surname: surname || payload.family_name,
                phone
            });

            return AuthController.issueToken(newCredentials.id, customerResponse.customerId, 'customer');

        } catch (error) {
            await newCredentials.destroy(); // Rollback
            throw error;
        }
    }

    // 3. REGISTRAZIONE AGENTE
    static async registerAgent(req, res) {
        try {
            const { role } = req.user;
            if (role !== 'admin' && role !== 'manager') {
                return res.status(403).json({ message: 'Solo un admin può registrare un agent' });
            }

            const { email, password, ...agentData } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'Email e password obbligatori' });

            const newCredentials = await Credentials.create({
                email, password, role: 'agent', mustChangePassword: true,
            });

            try {
                // Uso il Client passando il token
                const data = await AgencyClient.createAgent(req.headers.authorization, {
                    credentialsId: newCredentials.id,
                    ...agentData
                });

                return res.status(201).json({
                    message: 'Agent registrato con successo',
                    userId: newCredentials.id,
                    agentId: data.agentId,
                });
            } catch (err) {
                await newCredentials.destroy(); // Rollback
                throw err;
            }

        } catch (err) {
            console.error('Errore registerAgent:', err);
            return res.status(500).json({ message: err.message });
        }
    }

    // 4. REGISTRAZIONE ADMIN
    static async registerAdmin(req, res) {
        try {
            const { role } = req.user;
            if (role !== 'manager') return res.status(403).json({ message: 'Solo un manager può registrare un admin' });

            const { email, password, ...adminData } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'Email e password obbligatori' });

            const newCredentials = await Credentials.create({
                email, password, role: 'admin', mustChangePassword: true,
            });

            try {
                // Uso il Client
                const data = await AgencyClient.createAdmin(req.headers.authorization, {
                    credentialsId: newCredentials.id,
                    ...adminData
                });

                return res.status(201).json({
                    message: 'Admin registrato con successo',
                    userId: newCredentials.id,
                    agentId: data.agentId,
                });
            } catch (err) {
                await newCredentials.destroy(); // Rollback
                throw err;
            }

        } catch (err) {
            console.error('Errore registerAdmin:', err);
            return res.status(500).json({ message: err.message });
        }
    }

    // 5. REGISTRAZIONE MANAGER (Legacy)
    static async registerManager(req, res) {
        const { email, password, agencyId } = req.body;
        if (!email || !password) throw new Error('Email e password obbligatori');

        const newCredentials = await Credentials.create({ email, password, role: 'manager' });

        try {
            // Uso il Client
            await AgencyClient.createManager(req.headers.authorization, {
                credentialsId: newCredentials.id,
                agencyId: agencyId || null,
                manager: true
            });
            
            const token = Jwt.sign({ userId: newCredentials.id, role: 'admin' }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: '24h' });
            return { userId: newCredentials.id, role: 'admin', token };
        } catch (err) {
            await newCredentials.destroy();
            throw err;
        }
    }

    // 6. REGISTRAZIONE AGENZIA (Orchestratore)
    static async registerCompany(req) { // Nota: Ritorna i dati, non usa 'res'
        const { email, password, ...agencyData } = req.body;
        let newCredentials = null;

        try {
            const existing = await Credentials.findOne({ where: { email } });
            if (existing) throw new Error('Email già registrata');

            newCredentials = await Credentials.create({ email, password, role: 'manager' });

            // Uso il Client
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
            if (newCredentials) {
                console.log('Rollback: elimino credenziali...');
                await newCredentials.destroy();
            }
            throw error;
        }
    }

    // --- HELPER METHODS (Invariati) ---

    static async isTokenValid(token) {
        try {
            // 1. Verifica firma JWT
            const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
            
            // 2. Verifica se l'utente esiste ancora nel DB
            const credentials = await Credentials.findByPk(decoded.authId);
            if (!credentials) {
                throw new Error('Utente non trovato nel database');
            }

            // 3. Ritorna il payload decodificato per il middleware
            return { 
                authId: decoded.authId, 
                userId: decoded.userId, 
                role: decoded.role 
            };
        } catch (error) {
            throw new Error('Token non valido o scaduto');
        }
    }

    static issueToken(authId, userId, role) {
        try {
            return { token: Jwt.sign({ authId, userId, role }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: '24h', issuer: 'auth-service' }) };
        } catch (error) { console.log(error); }
    }

    static async validateToken(req, res) {
        const { token } = req.body;
        if (!token) throw new Error('Token mancante');
        const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
        return { authId: decoded.authId, userId: decoded.userId, role: decoded.role };
    }

    static async getCredentialsById(req, res) {
        try {
            const credentials = await Credentials.findByPk(req.params.id);
            if (!credentials) return res.status(404).json({ error: 'Credenziali non trovate' });
            return res.status(200).json({ id: credentials.id, email: credentials.email, role: credentials.role });
        } catch (error) { return res.status(500).json({ error: error.message }); }
    }

    static async updateCredentials(req, res) {
        try {
            const { email, password } = req.body;
            const credentials = await Credentials.findByPk(req.params.id);
            if (!credentials) return res.status(404).json({ error: 'Credenziali non trovate' });
            if (email) credentials.email = email;
            if (password) credentials.password = password;
            await credentials.update({ email, password });
            return res.status(200).json({ message: 'Credenziali aggiornate' });
        } catch (error) { return res.status(500).json({ error: 'Errore interno' }); }
    }

    static async deleteCredentials(req, res) {
        try {
            const { id } = req.params;
            const { role, authId } = req.user;
            const credentials = await Credentials.findByPk(id);
            if (!credentials) return res.status(404).json({ message: 'Credenziali non trovate' });
            if (role !== 'admin' && parseInt(authId) !== parseInt(id)) return res.status(403).json({ message: 'Non autorizzato' });
            await credentials.destroy();
            return res.status(200).json({ message: 'Credenziali eliminate' });
        } catch (error) { return res.status(500).json({ message: error.message }); }
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