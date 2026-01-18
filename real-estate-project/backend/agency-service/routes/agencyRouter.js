import express from "express";
import { AgencyController } from "../controllers/AgencyController.js";

export const agencyRouter = express.Router();

agencyRouter.get('/agencies', async (req, res, next) => {
    try {
        const agencies = await AgencyController.getAllAgencies();
        res.status(200).json(agencies);
    } catch (error) {
        next(error);
    }
});

// Setup interno (Auth -> Agency)
agencyRouter.post('/agency', async (req, res, next) => {
    try {
        const result = await AgencyController.createFullAgency(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// GET Agency by Admin ID
agencyRouter.get('/admin/:adminId', async (req, res, next) => {
    try {
        const result = await AgencyController.getAgencyByAdmin(req.params.adminId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// GET Agency by ID
agencyRouter.get('/agency/:agencyId', async (req, res, next) => {
    try {
        const agency = await AgencyController.getAgencyById(req.params.agencyId);      
        res.status(200).json(agency);
    } catch (error) {
        next(error);
    }       
});

agencyRouter.get('/agency/:agencyId/name', async (req, res, next) => {
    try {
        const agency = await AgencyController.getAgencyNameById(req.params.agencyId);  
        res.status(200).json(agency);
    } catch (error) {
        next(error);
    }       
});