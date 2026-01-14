import express from "express";
import { AdminController } from "../controllers/AdminController.js";
import { userContextMiddleware } from "../middleware/authorization.js";

export const adminRouter = express.Router();

adminRouter.post('/admins', userContextMiddleware, async (req, res) => {
    try {
        const result = await AdminController.createAdmin(req);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

adminRouter.post('/manager', async (req, res) => {
    try {
        const result = await AdminController.createManager(req);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

adminRouter.get('/admin/:id', async (req, res) => {
    try {
        const admin = await AdminController.getAdminById(req.params.id);
        res.status(200).json(admin);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

adminRouter.put('/admin/:id', async (req, res) => {
    try {
        const result = await AdminController.updateAdmin(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRouter.get("/agency-internal/admin/:id/businessId", async (req, res) => {
    try {
        const admin = await AdminController.getAdminId(req);
        res.status(200).json(admin);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});