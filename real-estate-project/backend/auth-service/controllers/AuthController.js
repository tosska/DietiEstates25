import { createHash } from 'crypto';
import { Credentials } from '../models/Database.js';
import { AgencyClient } from '../clients/agencyClient.js';
import Jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService.js';
import { ProviderClient } from '../clients/ProviderClient.js';
import { auth } from 'google-auth-library';

export class AuthController {
    static async checkCredentials(req) {
        const { usr, pwd } = req.body;

        if (!usr || !pwd) {
            throw new Error('Email e password sono obbligatori');
        }

        // 1️⃣ Cerca SOLO per email
        const credentials = await Credentials.findOne({
            where: { email: usr }
        });

        if (!credentials) {
            throw new Error('Invalid credentials 1');
        }

        // 2️⃣ Verifica password
        const hashedPwd = createHash('sha256').update(pwd).digest('hex');

        console.log('Password hashata:', hashedPwd);
        console.log('Credentiali memorizzate password:', credentials.password);
        if (hashedPwd !== credentials.password) {
            throw new Error('Invalid credentials 2');
        }

        console.log('Credenziali trovate:', {
            id: credentials.id,
            role: credentials.role,
            mustChangePassword: credentials.mustChangePassword
        });

        // 3️⃣ Recupera businessId
        const businessId = await AuthService.getBusinessId(
            credentials.id,
            credentials.role
        );

        if (!businessId) {
            throw new Error('Impossibile recuperare l\'ID business per le credenziali fornite');
        }

        return {
            authId: credentials.id,
            userId: businessId,
            role: credentials.role,
            mustChangePassword: credentials.mustChangePassword
        };
    }



    static async checkCredentialsFromSocial(req) {

        console.log("HO RICEVUTO CHIAMATA A CHECKCREDENTIALS FROM SOCIAL")

        const { usr, providerToken, providerName } = req.body;

        if (!usr || !providerToken || !providerName) {
            throw new Error('Email, providerId e providerName sono obbligatori');
        }
        console.log('Verifica credenziali social per email:', usr, 'con provider:', providerName);
        const payload = await ProviderClient.validateSocialToken(providerName, providerToken);

        console.log('Payload ricevuto dal provider:', payload);

        if (!payload) {
            throw new Error('Token social non valido');
        }

        if(payload.email !== usr) {
            throw new Error('L\'account social non corrisponde all\'email fornita');
        }

        const credentials = await Credentials.findOne({
            where: { email: usr, providerId: payload.sub, providerName: providerName },
        });

        if (!credentials) {
            return null;
        }

        console.log('Credenziali social trovate:', { id: credentials.id, role: credentials.role });

        const businessId = await AuthService.getBusinessId(credentials.id, credentials.role);
        if (!businessId) {
            throw new Error('Impossibile recuperare l\'ID business per le credenziali fornite');
        }

        console.log("token pre ", { authId: credentials.id, userId: businessId, role: credentials.role });

        return { authId: credentials.id, userId: businessId, role: credentials.role };
    }



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
        console.log('Richiesta registerCustomer:', req.body);
        const { email, password, name, surname, phone, providerToken, providerName } = req.body;
        if (!email || !password) {
            throw new Error('Email e password sono obbligatori');
        }
        const existingCredentials = await Credentials.findOne({ where: { email: email } });
        if (existingCredentials) {
            console.log('Email già registrata:', email);
            throw new Error('Email già registrata');
        }

        const newCredentials = await Credentials.create({
            email: email,
            password: password, 
            role: 'customer',
        });

        const response = await fetch('http://localhost:3002/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credentialsId: newCredentials.id,
                name: name || 'Nuovo',
                surname: surname || 'Cliente',
                phone: phone || null,
            }),
            timeout: 10000, // Aggiunto timeout
        });

        if (!response.ok) {
            await newCredentials.destroy();
            const errorData = await response.json();
            console.log('Errore da customer-service:', errorData);
            throw new Error(errorData.message || 'Errore durante la creazione del customer');
        }

        const customerResponse = await response.json();

        return this.issueToken(newCredentials.id, customerResponse.customerId, 'customer');
    }

    static async registerCustomerFromSocial(req, res) {
        const { email, name, surname, phone, providerToken, providerName } = req.body;


        console.log('Richiesta registerCustomerFromSocial:', req.body);

        // 1. Validazione input minimi
        if (!email || !providerToken || !providerName) {
            throw new Error('Email e token social sono obbligatori');
        }

        // 2. Controllo se l'email esiste già
        const existingCredentials = await Credentials.findOne({ where: { email } });
        if (existingCredentials) {
            throw new Error('Email già registrata nel sistema');
        }

        // 3. Validazione del token tramite il provider scelto
        const payload = await ProviderClient.validateSocialToken(providerName, providerToken);

        console.log('Payload ricevuto dal provider:', payload);

        // Verifichiamo che l'email del token corrisponda a quella dichiarata
        if (!payload || payload.email !== email) {
            throw new Error('L\'account social non corrisponde all\'email fornita');
        }

        console.log("payload.sub:", payload.sub);

        // 4. Creazione Credenziali (password null e providerId salvato)
   
        const newCredentials = await Credentials.create({
            email: email,
            password: null, // Importante: nessuna password locale
            role: 'customer',
            providerName: providerName,
            providerId: payload.sub // Il 'sub' di Google è l'ID univoco permanente
        });    

        console.log('Nuove credenziali create con ID:', newCredentials);

        try {
            // 5. Creazione profilo nel customer-service
            const customerResponse = await fetch('http://localhost:3002/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credentialsId: newCredentials.id,
                    name: name || payload.given_name,
                    surname: surname || payload.family_name,
                    phone: phone 
                })
            });

            if (!customerResponse.ok) {
                throw new Error('Errore nella creazione del profilo cliente');
            }

            // 6. Generazione Token di sessione per l'app
            return this.issueToken(newCredentials.id, customerResponse.customerId, 'customer');

        } catch (error) {
            // Rollback se il servizio esterno fallisce
            await newCredentials.destroy();
            throw error;
        }
    }

    static async registerAgent(req, res) {
        try {
            const { role } = req.user;
            if (role !== 'admin' && role !== 'manager') {
                return res.status(403).json({ message: 'Solo un admin può registrare un agent' });
            }

            const { email, password, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email e password sono obbligatori' });
            }

            // Crea le credenziali per l'agente
            const newCredentials = await Credentials.create({
                email,
                password,
                role: 'agent',
                mustChangePassword: true,
            });

            console.log('Nuove credenziali create:', newCredentials.toJSON());

            // Chiama il microservizio agent-service per creare l'agente
            const response = await fetch('http://localhost:8000/agency-service/agents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization, // Passa il token
                },
                body: JSON.stringify({
                    credentialsId: newCredentials.id,
                    name,
                    surname,
                    phone,
                    vatNumber,
                    yearsExperience,
                    urlPhoto
                }),
            });

            if (!response.ok) {
                const errorData = response.statusText;
                await newCredentials.destroy(); // rollback credenziali
                throw new Error(errorData || 'Errore durante la creazione dell\'agent');
            }

            const data = await response.json();

            return res.status(201).json({
                message: 'Agent registrato con successo',
                userId: newCredentials.id,
                agentId: data.agentId,
            });

        } catch (err) {
            console.error('Errore registerAgent:', err);
            return res.status(500).json({ message: err.message });
        }
    }


    static async registerAdmin(req, res) {
        try {
            const { role } = req.user;
            if (role !== 'manager') {
                return res.status(403).json({ message: 'Solo un manager può registrare un admin' });
            }

            const { email, password, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email e password sono obbligatori' });
            }

            // Crea le credenziali per l'admin
            const newCredentials = await Credentials.create({
                email,
                password,
                role: 'admin',
                mustChangePassword: true,
            });

            console.log('Nuove credenziali create:', newCredentials.toJSON());

            // Chiama il microservizio agent-service per creare l'agente
            const response = await fetch('http://localhost:8000/agency-service/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization, // Passa il token
                },
                body: JSON.stringify({
                    credentialsId: newCredentials.id,
                    name,
                    surname,
                    phone,
                    vatNumber,
                    yearsExperience,
                    urlPhoto
                }),
            });

            if (!response.ok) {
                const errorData = response.statusText;
                await newCredentials.destroy(); // rollback credenziali
                throw new Error(errorData || 'Errore durante la creazione dell\'admin');
            }

            const data = await response.json();

            return res.status(201).json({
                message: 'Admin registrato con successo',
                userId: newCredentials.id,
                agentId: data.agentId,
            });

        } catch (err) {
            console.error('Errore registerAdmin:', err);
            return res.status(500).json({ message: err.message });
        }
    }

    static async registerManager(req, res) {

        const { email, password, agencyId } = req.body;
        if (!email || !password) {
            throw new Error('Email e password sono obbligatori');
        }

        const newCredentials = await Credentials.create({
        email: email,
        password: password,
        role: 'manager', 
        });

        const response = await fetch('http://localhost:3000/manager', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
            },
            body: JSON.stringify({
                credentialsId: newCredentials.id,
                agencyId: agencyId || null,
                manager: true, // Imposta Manager a true
            }),
        });

        if (!response.ok) {
            await newCredentials.destroy();
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore durante la creazione del manager');
        }

        const token = Jwt.sign({ userId: newCredentials.ID, role: 'admin' }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s` });
        return { userId: newCredentials.id, role: 'admin', token };
    }

    static async registerCompany(req, res) {
        const { email, password, phone, description, vatNumber, website, street, houseNumber, city, postalCode, state, country, unitDetail, longitude, latitude } = req.body;

        try {
            console.log('Invio richiesta a agency-service:', {
                email,
                password,
                phone,
                description,
                vatNumber,
                website,
                street,
                houseNumber,
                city,
                postalCode,
                state,
                country,
                unitDetail,
                longitude,
                latitude
            });

            const response = await fetch('http://localhost:3000/agency', { // Corretto il percorso a /api/agency/agency
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    phone,
                    description,
                    vatNumber,
                    website,
                    street,
                    houseNumber,
                    city,
                    postalCode,
                    state,
                    country,
                    unitDetail,
                    longitude,
                    latitude
                }),
            });

            const responseText = await response.clone().text(); // Clona la risposta per il log
            console.log('Risposta grezza da agency-service:', responseText);

            if (!response.ok) {
                const errorData = await response.json(); // Elabora il JSON
                throw new Error(errorData.message || `Errore ${response.status}: ${responseText}`);
            }

            const result = await response.json();
            return {
                message: 'Company and manager registered successfully',
                agencyId: result.agencyId,
                adminId: result.adminId,
                token: result.token,
            };
        } catch (error) {
            console.error('Errore in registerCompany:', error);
            throw new Error(`Failed to register company: ${error.message}`);
        }
    }



    //da cancellare
    static async isTokenValid(token) {
        try {
            const decoded = Jwt.verify(token, process.env.TOKEN_SECRET || 'your-secret-key');
            const credentials = await Credentials.findByPk(decoded.authId);
            if (!credentials) {
                throw new Error('Utente non trovato');
            }
            return { authId: decoded.authId, userId: decoded.userId, role: decoded.role };
        } catch (error) {
            throw new Error('Token non valido');
        }
    }


    static async checkUser(credentialId) {

        let user = await Credentials.findByPk(credentialId);

        if (!user) {
            throw new Error("User not found");
        }

        return true;
    }

    static async changePasswordFirstLogin(authId, newPassword) {
        const credentials = await Credentials.findByPk(authId);

        if (!credentials) {
            throw new Error('Utente non trovato');
        }

        credentials.password = newPassword;
        credentials.mustChangePassword = false;

        await credentials.save();
    }


    static async getCredentialsById(req, res) {
        try {
            const { id } = req.params;
            const credentials = await Credentials.findByPk(id);
            
            if (!credentials) {
                return res.status(404).json({ error: 'Credenziali non trovate' });
            }

            // Restituiamo solo dati sicuri
            return res.status(200).json({
                id: credentials.id,
                email: credentials.email,
                role: credentials.role
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }



}