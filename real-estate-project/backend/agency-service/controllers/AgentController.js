import { Agent, Admin, Agency } from '../models/Database.js';

export class AgentController {
    static async createAgent(req, res) {
        try {
            const { credentialsId, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;

            if (!credentialsId) {
                throw new Error('credentialsId mancante');
            }

            

            // Recupera admin loggato
            const creatorAdmin = await Admin.findOne({
                where: { id: req.userId }
            });

            if (!creatorAdmin) {
                throw new Error('Admin non trovato');
            }


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

            console.log('Agente creato con successo:', agent.toJSON());

            return res.status(201).json({
                message: 'Agent creato con successo',
                agentId: agent.id,
            });

        } catch (err) {
            console.error('Errore createAgent:', err);
            return res.status(500).json({ message: err.message });
        }
    }




    static async getAgentById(agentId) {
        

        const agent = await Agent.findByPk(agentId);
        if (!agent) {
            throw new Error('Agente non trovato');
        }

        return agent;

    }

    static async getAgencyIdByAgentId(agentId) {

        const agent = await Agent.findByPk(agentId);
        if (!agent) {
            throw new Error('Agente non trovato');
        }

        return agent.dataValues.agencyId;


    }
        


    static async getAgentId(req) {

        const credential_id = req.params.id;

        return Agent.findOne({
            where: { credentialsId: credential_id },
            attributes: ['id'],
        });
    }
}