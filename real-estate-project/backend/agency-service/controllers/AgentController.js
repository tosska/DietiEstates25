import { Agent, Admin, Agency } from '../models/Database.js';

export class AgentController {

    static async createAgent(req) {
        try {
            const { credentialsId, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;
            if (!credentialsId) throw new Error('credentialsId mancante');

            const creatorAdmin = await Admin.findOne({ where: { id: req.userId } });
            if (!creatorAdmin) throw new Error('Admin non trovato');

            const agencyId = creatorAdmin.agencyId;
            if (!agencyId) throw new Error('Admin non ha agenzia associata');

            const agent = await Agent.create({
                credentialsId, agencyId, name, surname, phone, vatNumber, yearsExperience, urlPhoto
            });

            return {
                message: 'Agent creato con successo',
                agentId: agent.id,
            };
        } catch (err) {
            console.error('Errore createAgent:', err);
            throw err;
        }
    }

    static async updateAgent(req) {
        try {
            const { id } = req.params;
            const { name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;

            const agent = await Agent.findByPk(id);
            if (!agent) throw new Error('Agente non trovato');

            await agent.update({
                name: name || agent.name,
                surname: surname || agent.surname,
                phone: phone || agent.phone,
                vatNumber: vatNumber || agent.vatNumber,
                yearsExperience: yearsExperience || agent.yearsExperience,
                urlPhoto: urlPhoto || agent.urlPhoto
            });

            return { message: 'Profilo agente aggiornato', agent };
        } catch (error) {
            throw error;
        }
    }

    static async getAgentById(agentId) {
        const agent = await Agent.findByPk(agentId);
        if (!agent) throw new Error('Agente non trovato');
        return agent;
    }

    static async getAgencyIdByAgentId(agentId) {
        const agent = await Agent.findByPk(agentId);
        if (!agent) throw new Error('Agente non trovato');
        return agent.dataValues.agencyId;
    }

    static async getAgentId(req) {
        const credential_id = req.params.id;
        const agent = await Agent.findOne({
            where: { credentialsId: credential_id },
            attributes: ['id'],
        });
        if (!agent) throw new Error('Agente non trovato');
        return agent;
    }
}