// agency-service/controllers/AdminController.js
import { Admin, Agency } from '../models/Database.js';

export class AdminController {

    static async createAdmin(req, res) {
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
    
            // Crea admin
            const admin = await Admin.create({
                credentialsId,
                agencyId,
                name,
                surname,
                phone,
                vatNumber,
                yearsExperience,
                urlPhoto
            });
    
            console.log('Admin creato con successo:', admin.toJSON());
    
            return res.status(201).json({
                message: 'Admin creato con successo',
                adminId: admin.id,
            });
    
        } catch (err) {
            console.error('Errore createAdmin:', err);
            return res.status(500).json({ message: err.message });
        }
    }

    static async createManager(req, res) {
        const { credentialsId, agencyId } = req.body;
        const fields = ['credentialsId'];
        if (!fields.every(field => req.body[field])) {
            throw new Error('Tutti i campi obbligatori (credentialsId) devono essere forniti');
        }

        const admin = await Admin.create({
            credentialsId: credentialsId,
            agencyId: agencyId || null,
            manager: true,
            role: 'admin',
        });

        return {
            message: 'Manager creato con successo',
            adminId: admin.AdminID,
        };
    }

    static async getAdminById(req, res) {
        const { id } = req.params;
        const admin = await Admin.findByPk(id, {
            attributes: ['id', 'credentialsId', 'Agency_ID', 'Manager', 'role'],
        });

        if (!admin) {
            throw new Error('Admin non trovato');
        }

        return admin;
    }

    static async getAdminId(req) {

        const credential_id = req.params.id;

        return Admin.findOne({
            where: { credentialsId: credential_id },
            attributes: ['id'],
        });
    }
    
}