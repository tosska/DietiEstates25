import { Agent, Admin } from '../models/Database.js';
import { createError } from '../utils/errorUtils.js';

export class AgentController {

    static async createAgent(agentData, creatorId) {
        // credentialsId e altri campi obbligatori sono già validati da validation.js
        const { credentialsId, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = agentData;

        const creatorAdmin = await Admin.findOne({ where: { id: creatorId } });
        if (!creatorAdmin) {
            throw createError('Admin creatore non trovato', 404);
        }

        const agencyId = creatorAdmin.agencyId;
        if (!agencyId) {
            throw createError('Admin non ha agenzia associata', 400);
        }

        const agent = await Agent.create({
            credentialsId, agencyId, name, surname, phone, vatNumber, yearsExperience, urlPhoto
        });

        return {
            message: 'Agent creato con successo',
            agentId: agent.id,
        };
    }

    static async updateAgent(id, updateData) {
        const { name, surname, phone, vatNumber, yearsExperience, urlPhoto } = updateData;

        const agent = await Agent.findByPk(id);
        if (!agent) throw createError('Agente non trovato', 404);

        await agent.update({
            name: name || agent.name,
            surname: surname || agent.surname,
            phone: phone || agent.phone,
            vatNumber: vatNumber || agent.vatNumber,
            yearsExperience: yearsExperience || agent.yearsExperience,
            urlPhoto: urlPhoto || agent.urlPhoto
        });

        return { message: 'Profilo agente aggiornato', agent };
    }

    static async getAgentById(agentId) {
        const agent = await Agent.findByPk(agentId);
        if (!agent) throw createError('Agente non trovato', 404);
        return agent;
    }

    static async getAgencyIdByAgentId(agentId) {
        const agent = await Agent.findByPk(agentId);
        if (!agent) throw createError('Agente non trovato', 404);
        return agent.dataValues.agencyId;
    }

    static async getAgentId(credentialId) {
        const agent = await Agent.findOne({
            where: { credentialsId: credentialId },
            attributes: ['id'],
        });
        if (!agent) throw createError('Agente non trovato', 404);
        return agent;
    }
}