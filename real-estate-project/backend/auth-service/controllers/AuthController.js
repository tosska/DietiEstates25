import { createHash } from 'crypto';
import { Credentials } from '../models/Database.js';
import { AgencyClient } from '../clients/agencyClient.js';
import Jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService.js';

export class AuthController {
    static async checkCredentials(req) {
        const { usr, pwd } = req.body;
        if (!usr || !pwd) {
            throw new Error('Email e password sono obbligatori');
        }

        const hashedPwd = createHash('sha256').update(pwd).digest('hex');
        const credentials = await Credentials.findOne({
            where: { email: usr, password: hashedPwd },
        });

        if (!credentials) {
            return null;
        } 

        console.log('Credenziali trovate:', { id: credentials.id, role: credentials.role });

        const businessId = await AuthService.getBusinessId(credentials.id, credentials.role);
        if(!businessId) {
            throw new Error('Impossibile recuperare l\'ID business per le credenziali fornite');
        }

        console.log("token pre ", {authId: credentials.id, userId: businessId, role: credentials.role });
        
        return {authId: credentials.id, userId: businessId, role: credentials.role };
    }


    static async updateCredentials(req, res) {
        try {
            const { id } = req.params;
            const { email, password } = req.body;

            const credentials = await Credentials.findByPk(id);
            if (!credentials) {
                return res.status(404).json({ error: 'Credenziali non trovate' });
            }

            const updateData = {};
            if (email) updateData.Email = email;
            if (password) updateData.password = password; // Verrà hashatto dal set hook
            await credentials.update(updateData);

            return res.status(200).json({ message: 'Credenziali aggiornate con successo' });
        } catch (error) {
            console.error('Errore nell\'aggiornamento delle credenziali:', error);
            return res.status(500).json({ error: 'Errore interno del server' });
        }
    }

    static async deleteCredentials(req, res) {
        let responseSent = false;

        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            console.log('Richiesta deleteCredentials - ID:', id, 'User:', { userId, role });

            // Cerca le credenziali
            const credentials = await Credentials.findByPk(id);
            if (!credentials) {
                console.log('Credenziali non trovate per ID:', id);
                res.status(404).json({ message: 'Credenziali non trovate' });
                responseSent = true;
                return;
            }

            // Autorizza admin o il proprietario delle credenziali
            if (role !== 'admin' && parseInt(userId) !== parseInt(id)) {
                console.log('Autorizzazione fallita per userId:', userId, 'e ID:', id);
                res.status(403).json({ message: 'Non autorizzato a eliminare queste credenziali' });
                responseSent = true;
                return;
            }

            // Elimina le credenziali
            console.log('Eliminazione delle credenziali con ID:', id);
            await credentials.destroy();
            console.log('Credenziali eliminate con successo');

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
             return { token: Jwt.sign({authId, userId, role }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s` , issuer: 'auth-service'}) };
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
        const { email, password, name, surname, phone } = req.body;
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
            password: password, // Considera di hashare la password come negli altri metodi
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

        return { userId: newCredentials.id, role: 'customer', token: Jwt.sign({ userId: newCredentials.id, role: 'customer' }, process.env.TOKEN_SECRET || 'your-secret-key', { expiresIn: `${24 * 60 * 60}s` }) };
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

    static async registerManager(req, res) {

        const { email, password, agencyId } = req.body;
        if (!email || !password) {
        throw new Error('Email e password sono obbligatori');
        }

        const newCredentials = await Credentials.create({
        email: email,
        password: password,
        role: 'admin', // Ruolo admin per il manager
        });

        const response = await fetch('http://localhost:3000/manager', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization,
        },
        body: JSON.stringify({
            credentialsId: newCredentials.ID,
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
        return { userId: newCredentials.ID, role: 'admin', token };
    }

    static async registerCompany(req, res) {
        const { email, password, phone, description, vatNumber, website, street, city, postalCode, state, unitDetail, longitude, latitude } = req.body;

        try {
            console.log('Invio richiesta a agency-service:', {
            email,
            password,
            phone,
            description,
            vatNumber,
            website,
            street,
            city,
            postalCode,
            state,
            unitDetail,
            longitude,
            latitude,
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
                city,
                postalCode,
                state,
                unitDetail,
                longitude,
                latitude,
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

        if(!user) {
            throw new Error("User not found");
        }

        return true;
    }


}