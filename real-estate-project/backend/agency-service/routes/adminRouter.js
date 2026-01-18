import express from "express";
import { AdminController } from "../controllers/AdminController.js";
import { userContextMiddleware } from "../middleware/authorization.js";

export const adminRouter = express.Router();

// Create Admin
adminRouter.post('/admins', userContextMiddleware, async (req, res, next) => {
    try {
        const result = await AdminController.createAdmin(req.body, req.userId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Create Manager
adminRouter.post('/manager', async (req, res, next) => {
    try {
        const result = await AdminController.createManager(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// GET Admin by ID
adminRouter.get('/admin/:id', async (req, res, next) => {
    try {
        const result = await AdminController.getAdminById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// Update Admin
adminRouter.put('/admin/:id', userContextMiddleware, async (req, res, next) => {
    try {
        const result = await AdminController.updateAdmin(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// Internal: Get ID by Credentials
adminRouter.get("/agency-internal/admin/:id/businessId", async (req, res, next) => {
    try {
        const admin = await AdminController.getAdminId(req.params.id);
        res.status(200).json(admin);
    } catch (error) {
        next(error);
    }
});