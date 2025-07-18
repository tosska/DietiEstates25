import { Agent, Admin, Agency } from '../models/Database.js';

export class AgentController {
    static async createAgent(req, res) {
        const { credentialsId, agencyId, creatorAdminId } = req.body;
        const fields = ['credentialsId', 'agencyId', 'creatorAdminId'];
        if (!fields.every(field => req.body[field])) {
            throw new Error('Tutti i campi obbligatori (credentialsId, agencyId, creatorAdminId) devono essere forniti');
        }

        // Verifica che l'agenzia esista
        const agency = await Agency.findByPk(agencyId);
        if (!agency) {
            throw new Error('Agenzia non trovata');
        }

        // Verifica che il creatorAdminId esista e sia un admin
        const creatorAdmin = await Admin.findByPk(creatorAdminId);
        if (!creatorAdmin) {
            throw new Error('Admin creatore non trovato');
        }

        const agent = await Agent.create({
            CredentialsID: credentialsId,
            Agency_ID: agencyId,
            CreatorAdmin_ID: creatorAdminId,
            role: 'agent',
        });

        return {
            message: 'Agent creato con successo',
            agentId: agent.AgentID,
        };
    }
}