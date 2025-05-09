import express from "express";
import { CustomerController } from "../controllers/CustomerController.js";

export const customerRouter = express.Router();

// Route per creare un nuovo Customer
customerRouter.post('/register/customer', async (req, res) => {
    try {
      const result = await CustomerController.createCustomer(req, res);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: `Errore durante la creazione del cliente: ${error.message}` });
    }
  });