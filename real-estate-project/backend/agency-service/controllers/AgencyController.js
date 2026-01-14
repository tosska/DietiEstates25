import { Agency, Address, Admin, database } from '../models/Database.js';

export class AgencyController {

    // Recupera tutte le agenzie con indirizzo e manager
    static async getAllAgencies() {
        return await Agency.findAll({
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['id', 'name', 'surname'] }, // Nota: AdminID corretto in 'id' se il model è 'id'
            ],
            // attributes: [...] // Seleziona solo se necessario, altrimenti *
        });
    }

    /**
     * TRANSACTIONAL: Crea Indirizzo -> Agenzia -> Admin(Manager) -> Aggiorna Agenzia
     * Chiamato internamente da Auth-Service durante la registrazione
     */
    static async createFullAgency(data) {
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
                role: 'manager', // Aggiunto per chiarezza nel DB
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
            throw new Error('Errore creazione dati agenzia: ' + error.message);
        }
    }

    static async getAgencyById(agencyId) {
        const agency = await Agency.findByPk(agencyId, {
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['id', 'name'] },
            ],
        });
        if (!agency) throw new Error('Agenzia non trovata');
        return agency;
    }

    static async getAgencyNameById(agencyId) {
        const agency = await Agency.findByPk(agencyId, { attributes: ['name'] }); // Assicurati che il campo 'name' esista in Agency se lo usi, altrimenti 'description' o altro
        // Se nel model Agency non c'è 'name', usa description o rimuovi questo metodo se non serve
        if (!agency) throw new Error('Agenzia non trovata');
        return agency; // o agency.name
    }

    // Refattorizzato: Ritorna dati, non usa res
    static async getAgencyByAdmin(req) {
        const { adminId } = req.params;
        if (!adminId) throw new Error('adminId mancante');

        const admin = await Admin.findByPk(adminId);
        if (!admin) throw new Error('Admin non trovato');
        if (!admin.agencyId) throw new Error('Admin senza agenzia associata');

        return { agencyId: admin.agencyId };
    }

    static async getMyAgency(req) {
        const adminId = req.user.userId; // dal token JWT decodificato nel middleware
        if (!adminId) throw new Error('Admin non autenticato');

        const agency = await Agency.findOne({ where: { managerAdminId: adminId } });
        if (!agency) throw new Error('Agenzia non trovata per questo manager');

        return agency;
    }
}