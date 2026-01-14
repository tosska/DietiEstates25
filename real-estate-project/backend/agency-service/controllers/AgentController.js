import { Agent, Admin, Agency } from '../models/Database.js';

export class AgentController {

    /**
     * Crea un nuovo Agente.
     * Logica:
     * 1. Verifica che chi fa la richiesta sia un Admin.
     * 2. Verifica che l'Admin abbia un'agenzia.
     * 3. Crea l'agente collegato all'agenzia.
     */
    static async createAgent(req) { // Nota: non passiamo 'res'
        try {
            const { credentialsId, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;

            if (!credentialsId) throw new Error('credentialsId mancante');

            // Recupera admin loggato (dal middleware)
            const creatorAdmin = await Admin.findOne({ where: { id: req.userId } });
            if (!creatorAdmin) throw new Error('Admin non trovato');

            // Ricava agencyId dall'admin
            const agencyId = creatorAdmin.agencyId;
            if (!agencyId) throw new Error('Admin non ha agenzia associata');

            // Controlla che l'agenzia esista
            const agency = await Agency.findByPk(agencyId);
            if (!agency) throw new Error('Agenzia non trovata');

            // Crea agente
            const agent = await Agent.create({
                credentialsId,
                agencyId,
                name,
                surname,
                phone,
                vatNumber,
                yearsExperience,
                urlPhoto
            });

            console.log('Agente creato:', agent.id);

            return {
                message: 'Agent creato con successo',
                agentId: agent.id,
            };

        } catch (err) {
            console.error('Errore createAgent:', err);
            throw err; // Rilancia al router
        }
    }

    /**
     * Aggiorna i dati di un Agente esistente.
     */
    static async updateAgent(req) {
        try {
            const { id } = req.params;
            const { name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;

            const agent = await Agent.findByPk(id);
            if (!agent) throw new Error('Agente non trovato');

            await agent.update({
                name: name !== undefined ? name : agent.name,
                surname: surname !== undefined ? surname : agent.surname,
                phone: phone !== undefined ? phone : agent.phone,
                vatNumber: vatNumber !== undefined ? vatNumber : agent.vatNumber,
                yearsExperience: yearsExperience !== undefined ? yearsExperience : agent.yearsExperience,
                urlPhoto: urlPhoto !== undefined ? urlPhoto : agent.urlPhoto
            });

            return { message: 'Profilo agente aggiornato', agent };
        } catch (error) {
            console.error('Errore updateAgent:', error);
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

    // Usato per recuperare l'ID interno partendo dal credentialsId (comunicazione tra microservizi)
    static async getAgentId(req) {
        const credential_id = req.params.id;
        const agent = await Agent.findOne({
            where: { credentialsId: credential_id },
            attributes: ['id'],
        });
        
        if (!agent) throw new Error('Agente non trovato per queste credenziali');
        return agent;
    }
}