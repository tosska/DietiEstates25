import { Agency, Address, Admin, database } from '../models/Database.js';
import { createHash } from 'crypto';


export class AgencyController {
    // Recupera tutte le agenzie
    static async getAllAgencies(req, res) {
        const agencies = await Agency.findAll({
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['AdminID', 'Email'] },
            ],
            attributes: ['AgencyId', 'Phone', 'Description', 'VAT_Number', 'Website', 'ManagerAdmin_ID', 'Address_ID'],
        });
        return agencies;
    }

    // Crea una nuova agenzia con il relativo indirizzo
    static async createAgency(req, res) {
        console.log('REQ.BODY COMPLETO:', req.body);

        const {
            email, password, phone, description,
            vatNumber, website,
            street, houseNumber, city, postalCode, state, country,
            unitDetail, longitude, latitude
        } = req.body;

        let transaction;

        try {
            transaction = await database.transaction();

            // 1️⃣ CREA ADDRESS
            const address = await Address.create({
            street,
            houseNumber,
            city,
            postalCode,
            state,
            country,
            unitDetail,
            longitude,
            latitude,
            }, { transaction });

            console.log('Indirizzo creato con ID:', address.id);

            // 2️⃣ CREA AGENCY
            const agency = await Agency.create({
            phone,
            description,
            vatNumber,
            website,
            addressId: address.id,
            managerAdminId: null, // ✅ campo corretto
            }, { transaction });

            console.log('Agenzia creata con ID:', agency.agencyId);

            // 3️⃣ REGISTRA MANAGER (AUTH SERVICE)
            const managerResponse = await fetch('http://localhost:3001/register/manager', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                role: 'admin',
                agencyId: agency.agencyId,
            }),
            });

            if (!managerResponse.ok) {
            const err = await managerResponse.json();
            throw new Error(err.message);
            }

            const managerData = await managerResponse.json();
            const adminId = managerData.userId;

            // 4️⃣ COLLEGA MANAGER ALL’AGENCY
            await agency.update(
            { managerAdminId: adminId },
            { transaction }
            );

            // 5️⃣ COMMIT
            await transaction.commit();

            return {
            agencyId: agency.agencyId,
            adminId,
            token: managerData.token,
            };

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('Errore in createAgency:', error);
            throw error;
        }
        }



    static async getAgencyById(req, res) {
        const agencyId = req.params.agencyId;
        return Agency.findByPk(agencyId, {
            include: [
                { model: Address, as: 'Address' },
                { model: Admin, as: 'ManagerAdmin', attributes: ['AdminID', 'Email'] },
            ],
        });
    }

    static async getAgencyNameById(agencyId) {

        console.log("sono arricato")
        return Agency.findByPk(agencyId, {
            attributes: ['name'],
        });
    }

    static async getAgencyByAdmin(req, res) {
        const { adminId } = req.params;

        if (!adminId) {
        return res.status(400).json({ message: 'adminId mancante' });
        }

        const admin = await Admin.findByPk(adminId);

        if (!admin) {
        return res.status(404).json({ message: 'Admin non trovato' });
        }

        if (!admin.agencyId) {
        return res.status(404).json({ message: 'Admin senza agenzia associata' });
        }

        return res.status(200).json({
        agencyId: admin.agencyId
        });
    }

    static async getMyAgency(req) {
        const adminId = req.user.userId; // dal token JWT

        if (!adminId) {
            throw new Error('Admin non autenticato');
        }

        const agency = await Agency.findOne({
            where: { managerAdminId: adminId }
        });

        if (!agency) {
            throw new Error('Agenzia non trovata');
        }

        return agency;
    }



}