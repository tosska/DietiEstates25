import express from "express";
import { AgencyController } from "../controllers/AgencyController.js";
import { userContextMiddleware } from "../middleware/authorization.js"; // Aggiungi se serve proteggere getMyAgency

export const agencyRouter = express.Router();

// GET all
agencyRouter.get('/agencies', async (req, res) => {
    try {
        const agencies = await AgencyController.getAllAgencies();
        res.status(200).json(agencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Internal (Setup)
agencyRouter.post('/agency', async (req, res) => { // o /internal/setup-agency
    try {
        const result = await AgencyController.createFullAgency(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET Agency by Admin
agencyRouter.get('/admin/:adminId', async (req, res) => {
    try {
        const result = await AgencyController.getAgencyByAdmin(req);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message.includes('non trovato') ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
});

// GET Agency by ID
agencyRouter.get('/agency/:agencyId', async (req, res) => {
    try {
        const agency = await AgencyController.getAgencyById(req.params.agencyId);      
        res.status(200).json(agency);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }       
});

// GET Agency Name
agencyRouter.get('/agency/:agencyId/name', async (req, res) => {
    try {
        const agency = await AgencyController.getAgencyNameById(req.params.agencyId);  
        res.status(200).json(agency.name); // o agency.description se name non esiste
    } catch (error) {
        res.status(404).json({ message: error.message });
    }       
});