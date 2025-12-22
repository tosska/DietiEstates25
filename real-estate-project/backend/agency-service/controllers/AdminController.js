// agency-service/controllers/AdminController.js
import { Admin } from '../models/Database.js';

export class AdminController {
    static async createAdmin(req, res) {
        const { credentialsId, agencyId, manager } = req.body;
        const fields = ['credentialsId'];
        if (!fields.every(field => req.body[field])) {
            throw new Error('Tutti i campi obbligatori (credentialsId) devono essere forniti');
        }

        const admin = await Admin.create({
            credentialsId: credentialsId,
            Agency_ID: agencyId || null,
            Manager: manager || false,
            role: 'admin',
        });

        return {
            message: 'Admin creato con successo',
            adminId: admin.AdminID,
        };
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
    
}