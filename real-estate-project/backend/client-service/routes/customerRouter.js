import express from "express";
import { CustomerController } from "../controllers/CustomerController.js";
import { userContextMiddleware } from "../middleware/authMiddleware.js";

export const customerRouter = express.Router();

// POST /customers (Registrazione interna)
customerRouter.post('/customers', async (req, res) => {
    try {
        const result = await CustomerController.createCustomer(req);
        res.status(201).json(result);
    } catch (error) {
        // Se il customer esiste già o mancano dati, torniamo 400
        const status = error.message.includes('esistente') ? 409 : 400;
        res.status(status).json({ message: error.message });
    }
});

// GET /customers (Richiede Auth)
customerRouter.get('/customers', userContextMiddleware, async (req, res) => {
    try {
        const customers = await CustomerController.getAllCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /customer/:id
customerRouter.get('/customer/:id', userContextMiddleware, async (req, res) => {
    try {
        const customer = await CustomerController.getCustomerById(req.params.id);
        res.status(200).json(customer);
    } catch (error) {
        const status = error.message === 'Customer non trovato' ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
});

// INTERNAL POST: Get by IDs
customerRouter.post("/customer-internal/customers/by-ids", async (req, res) => {
    try {
        const { customerIds } = req.body;
        const customers = await CustomerController.getCustomersByIds(customerIds);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /customers/:id
customerRouter.put('/customers/:id', userContextMiddleware, async (req, res) => {
    try {
        const result = await CustomerController.updateCustomer(req);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Customer non trovato' ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
});

// DELETE /customers/:id
customerRouter.delete('/customers/:id', userContextMiddleware, async (req, res) => {
    try {
        const result = await CustomerController.deleteCustomer(req);
        res.status(200).json(result);
    } catch (error) {
        let status = 500;
        if (error.message === 'Customer non trovato') status = 404;
        if (error.message === 'Non autorizzato') status = 403;
        res.status(status).json({ message: error.message });
    }
});

// INTERNAL GET: Get ID by Credentials
customerRouter.get('/customer-internal/customer/:id/businessId', async (req, res) => {
    try {
        // req.params.id qui è il credentialsId
        const customerId = await CustomerController.getCustomerIdByCredentials(req.params.id);
        res.status(200).json(customerId); 
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});