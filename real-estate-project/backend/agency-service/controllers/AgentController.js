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


    static async getAgentById(agentId) {

        const agent = await Agent.findByPk(agentId);
        if (!agent) {
            throw new Error('Agente non trovato');
        }

        return agent;

    }
        


    static async getAgentId(req) {

        const credential_id = req.params.id;

        return Agent.findOne({
            where: { CredentialsID: credential_id },
            attributes: ['AgentID'],
        });
    }
}