import { Agency, Address, Admin } from '../models/Database.js';

export class AgencyController {
    // Recupera tutte le agenzie
    static async getAllAgencies(req, res) {
        const agencies = await Agency.findAll({
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['AdminID', 'Email'] },
            ],
            attributes: ['AgencyID', 'Phone', 'Description', 'VAT_Number', 'Website', 'ManagerAdmin_ID', 'Address_ID'],
        });
        return agencies;
    }

    // Crea una nuova agenzia con il relativo indirizzo
    static async createAgency(req, res) {
        const { phone, description, vatNumber, website, managerAdminId, address } = req.body;
        const requiredFields = ['phone', 'description', 'managerAdminId', 'address'];
        if (!requiredFields.every(field => req.body[field])) {
            throw new Error('Tutti i campi obbligatori (phone, description, managerAdminId, address) devono essere forniti');
        }

        // Verifica che il ManagerAdmin_ID esista
        const admin = await Admin.findByPk(managerAdminId);
        if (!admin) {
            throw new Error('Manager Admin non trovato');
        }

        // Crea il nuovo indirizzo
        const newAddress = await Address.create({
            Street: address.street,
            City: address.city,
            Postal_Code: address.postalCode,
            State: address.state,
            Unit_Detail: address.unitDetail,
            Longitude: address.longitude || null,
            Latitude: address.latitude || null,
        });

        // Crea la nuova agenzia
        const agency = await Agency.create({
            Phone: phone,
            Description: description,
            VAT_Number: vatNumber || null,
            Website: website || null,
            ManagerAdmin_ID: managerAdminId,
            Address_ID: newAddress.AddressID,
        });

        return {
            message: 'Agenzia creata con successo',
            agencyId: agency.AgencyID,
        };
    }
}