import { Admin } from '../models/Database.js';
import { createError } from '../utils/errorUtils.js';

export class AdminController {

    static async createAdmin(adminData, creatorId) {
        // credentialsId validato dal middleware
        const { credentialsId, name, surname, phone, vatNumber, yearsExperience, urlPhoto } = adminData;

        // Verifica che chi crea l'admin sia un manager/admin con agenzia
        const creatorAdmin = await Admin.findOne({ where: { id: creatorId } });
        if (!creatorAdmin) {
            throw createError('Admin creatore non trovato', 404);
        }
        
        const agencyId = creatorAdmin.agencyId;
        if (!agencyId) {
            throw createError('Admin non ha agenzia associata', 400);
        }

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
    }

    static async createManager(managerData) {
        // credentialsId validato dal middleware
        const { credentialsId, agencyId } = managerData;
        
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
        if (!admin) throw createError('Admin non trovato', 404);
        return admin;
    }

    static async updateAdmin(id, updateData) {
        const { name, surname, phone, vatNumber, yearsExperience, urlPhoto } = updateData;

        const admin = await Admin.findByPk(id);
        if (!admin) throw createError('Admin non trovato', 404);

        await admin.update({
            name: name !== undefined ? name : admin.name,
            surname: surname !== undefined ? surname : admin.surname,
            phone: phone !== undefined ? phone : admin.phone,
            vatNumber: vatNumber !== undefined ? vatNumber : admin.vatNumber,
            yearsExperience: yearsExperience !== undefined ? yearsExperience : admin.yearsExperience,
            urlPhoto: urlPhoto !== undefined ? urlPhoto : admin.urlPhoto
        });

        return { message: 'Profilo aggiornato', admin };
    }

    static async getAdminId(credentialId) {
        const admin = await Admin.findOne({
            where: { credentialsId: credentialId },
            attributes: ['id'],
        });
        if (!admin) throw createError('Admin non trovato per queste credenziali', 404);
        return admin;
    }
}