import { Agency, Address, Admin, database } from '../models/Database.js';
import { createError } from '../utils/errorUtils.js';

export class AgencyController {

    static async getAllAgencies() {
        return await Agency.findAll({
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['id', 'name', 'surname'] }, 
            ],
        });
    }

    static async createFullAgency(data) {
        // Tutti i campi obbligatori sono validati da setupAgencyValidation nel router
        const transaction = await database.transaction();

        try {
            const { 
                credentialsId, 
                name, surname,
                phone, description, vatNumber, website,
                street, houseNumber, city, postalCode, state, country, unitDetail, longitude, latitude
            } = data;

            // 1. Indirizzo
            const address = await Address.create({
                street, houseNumber, city, postalCode, state, country, unitDetail, longitude, latitude
            }, { transaction });

            // 2. Agenzia
            const agency = await Agency.create({
                phone, description, vatNumber, website,
                addressId: address.id,
            }, { transaction });

            // 3. Admin (Manager)
            const admin = await Admin.create({
                credentialsId: credentialsId,
                agencyId: agency.agencyId,
                manager: true,
                role: 'manager',
                name: name || null,       
                surname: surname || null  
            }, { transaction });

            // 4. Link Manager -> Agenzia
            await agency.update({ managerAdminId: admin.id }, { transaction });

            await transaction.commit();

            return { agencyId: agency.agencyId, adminId: admin.id };

        } catch (error) {
            await transaction.rollback();
            console.error('Errore transazione Agency:', error);
            // Preserviamo il messaggio originale ma impostiamo 500
            throw createError('Errore creazione dati agenzia: ' + error.message, 500);
        }
    }

    static async getAgencyById(agencyId) {
        const agency = await Agency.findByPk(agencyId, {
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['id', 'name'] },
            ],
        });
        if (!agency) throw createError('Agenzia non trovata', 404);
        return agency;
    }

    static async getAgencyNameById(agencyId) {
        const agency = await Agency.findByPk(agencyId, { attributes: ['name'] }); 
        if (!agency) throw createError('Agenzia non trovata', 404);
        return agency; 
    }

    static async getAgencyByAdmin(adminId) {
        // adminId è richiesto nei parametri della rotta
        const admin = await Admin.findByPk(adminId);
        if (!admin) throw createError('Admin non trovato', 404);
        
        if (!admin.agencyId) throw createError('Admin senza agenzia associata', 400);

        return { agencyId: admin.agencyId };
    }
}