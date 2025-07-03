// agency-service/controllers/AdminController.js
import { Admin } from '../models/Database.js';

export class AdminController {
    static async createAdmin(req, res) {
        const { credentialsId, email, password, agencyId, manager } = req.body;
        const fields = ['credentialsId', 'email', 'password'];
        if (!fields.every(field => req.body[field])) {
            throw new Error('Tutti i campi obbligatori (credentialsId, email, password) devono essere forniti');
        }

        const admin = await Admin.create({
            CredentialsID: credentialsId,
            Email: email,
            password: password,
            Agency_ID: agencyId || null,
            Manager: manager || false,
            role: 'admin',
        });

        return {
            message: 'Admin creato con successo',
            adminId: admin.AdminID,
        };
    }

    static async getAdminById(req, res) {
        const { id } = req.params;
        const admin = await Admin.findByPk(id, {
            attributes: ['AdminID', 'CredentialsID', 'Email', 'Agency_ID', 'Manager', 'role'],
        });

        if (!admin) {
            throw new Error('Admin non trovato');
        }

        return admin;
    }
}