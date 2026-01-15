import express from "express";
import { AdminController } from "../controllers/AdminController.js";
import { userContextMiddleware } from "../middleware/authorization.js";

export const adminRouter = express.Router();

// Create Admin
adminRouter.post('/admins', userContextMiddleware, async (req, res) => {
    try {
        const result = await AdminController.createAdmin(req);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create Manager (Internal/Legacy)
adminRouter.post('/manager', async (req, res) => {
    try {
        const result = await AdminController.createManager(req);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET Admin by ID (Fondamentale per il login Manager)
adminRouter.get('/admin/:id', async (req, res) => {
    try {
        const result = await AdminController.getAdminById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Admin non trovato' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
});

// Update Admin
adminRouter.put('/admin/:id', userContextMiddleware, async (req, res) => {
    try {
        const result = await AdminController.updateAdmin(req);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Admin non trovato' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
});

// Internal: Get ID by Credentials
adminRouter.get("/agency-internal/admin/:id/businessId", async (req, res) => {
    try {
        const admin = await AdminController.getAdminId(req);
        res.status(200).json(admin);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});