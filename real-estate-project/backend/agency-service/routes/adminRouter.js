// agency-service/routes/adminRoutes.js
import express from "express";
import { AdminController } from "../controllers/AdminController.js";

export const adminRouter = express.Router();

adminRouter.post('/admins', async (req, res) => {
    try {
        const result = await AdminController.createAdmin(req, res);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

adminRouter.get('/admins/:id', async (req, res) => {
    try {
        const admin = await AdminController.getAdminById(req, res);
        res.status(200).json(admin);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});