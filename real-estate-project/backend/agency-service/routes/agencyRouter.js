import express from "express";
import { AgencyController } from "../controllers/AgencyController.js";

export const agencyRouter = express.Router();

// Recupera tutte le agenzie
agencyRouter.get('/agencies', async (req, res) => {
    try {
        const agencies = await AgencyController.getAllAgencies(req, res);
        res.status(200).json(agencies);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Crea una nuova agenzia
agencyRouter.post('/agency', async (req, res) => {
    try {
        console.log('Dati ricevuti nel backend per la creazione dell\'agenzia:', req.body);

        const result = await AgencyController.createAgency(req, res);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

