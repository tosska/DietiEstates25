import { Admin, Agency } from '../models/Database.js';

export class AdminController {

    static async createAdmin(req) {
        try {
            const { credentialsId, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;
            if (!credentialsId) throw new Error('credentialsId mancante');

            // Verifica che chi crea l'admin sia un manager/admin con agenzia
            const creatorAdmin = await Admin.findOne({ where: { id: req.userId } });
            if (!creatorAdmin) throw new Error('Admin creatore non trovato');
            
            const agencyId = creatorAdmin.agencyId;
            if (!agencyId) throw new Error('Admin non ha agenzia associata');

            const admin = await Admin.create({
                credentialsId,
                agencyId,
                name,
                surname,
                phone,
                vatNumber,
                yearsExperience,
                urlPhoto,
                manager: false,
                role: 'admin'
            });
    
            return {
                message: 'Admin creato con successo',
                adminId: admin.id,
            };
        } catch (err) {
            console.error('Errore createAdmin:', err);
            throw err;
        }
    }

    static async createManager(req) {
        const { credentialsId, agencyId } = req.body;
        if (!credentialsId) throw new Error('credentialsId mancante');

        const admin = await Admin.create({
            credentialsId,
            agencyId: agencyId || null,
            manager: true,
            role: 'manager',
        });

        return {
            message: 'Manager creato con successo',
            adminId: admin.id,
        };
    }

    static async getAdminById(id) {
        const admin = await Admin.findByPk(id);
        if (!admin) {
            throw new Error('Admin non trovato');
        }
        return admin;
    }

    static async updateAdmin(req) {
        try {
            const { id } = req.params;
            const { name, surname, phone, vatNumber, yearsExperience, urlPhoto } = req.body;

            const admin = await Admin.findByPk(id);
            if (!admin) throw new Error('Admin non trovato');

            await admin.update({
                name: name !== undefined ? name : admin.name,
                surname: surname !== undefined ? surname : admin.surname,
                phone: phone !== undefined ? phone : admin.phone,
                vatNumber: vatNumber !== undefined ? vatNumber : admin.vatNumber,
                yearsExperience: yearsExperience !== undefined ? yearsExperience : admin.yearsExperience,
                urlPhoto: urlPhoto !== undefined ? urlPhoto : admin.urlPhoto
            });

            return { message: 'Profilo aggiornato', admin };
        } catch (error) {
            console.error('Errore updateAdmin:', error);
            throw error;
        }
    }

    static async getAdminId(req) {
        const credential_id = req.params.id;
        const admin = await Admin.findOne({
            where: { credentialsId: credential_id },
            attributes: ['id'],
        });
        if (!admin) throw new Error('Admin non trovato per queste credenziali');
        return admin;
    }
}