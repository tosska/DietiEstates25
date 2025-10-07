import express from "express";
import { CustomerController } from "../controllers/CustomerController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

export const customerRouter = express.Router();

// Create: Crea un nuovo customer (richiede autenticazione)
customerRouter.post('/customers', async (req, res) => {
    try {
        const result = await CustomerController.createCustomer(req, res);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Read: Ottieni tutti i customer (richiede autenticazione)
customerRouter.get('/customers', verifyAuth, async (req, res) => {
    try {
        const customers = await CustomerController.getAllCustomers(req, res);
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Read: Ottieni un customer per ID (richiede autenticazione)
customerRouter.get('/customer/:id', verifyAuth, async (req, res) => {
    try {
        const customerId = req.params.id;
        const customer = await CustomerController.getCustomerById(customerId);
        res.status(200).json(customer);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Update: Aggiorna un customer (richiede autenticazione)
customerRouter.put('/customers/:id', verifyAuth, async (req, res) => {
    try {
        const result = await CustomerController.updateCustomer(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete: Elimina un customer (richiede autenticazione)
customerRouter.delete('/customers/:id', verifyAuth, async (req, res) => {
    try {
        const result = await CustomerController.deleteCustomer(req, res);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

customerRouter.get('/intern/customer/:id/businessId', async (req, res) => {
    try {
        const customerId = await CustomerController.getCustomerId(req);
        res.status(200).json(customerId); 
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});