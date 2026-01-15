import express from "express";
import { AgentController } from "../controllers/AgentController.js";
import { userContextMiddleware } from "../middleware/authorization.js"

export const agentRouter = express.Router();

agentRouter.post('/agents', userContextMiddleware, async (req, res) => {
    try {
        const result = await AgentController.createAgent(req);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

agentRouter.get('/agent/:id', async (req, res) => {
    try {
      const result = await AgentController.getAgentById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

agentRouter.put('/agent/:id', async (req, res) => {
    try {
        const result = await AgentController.updateAgent(req);
        res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Agente non trovato' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
});

agentRouter.get('/agency-internal/agent/:id/agencyId', async (req, res)  => {
    try {
      const agencyId = await AgentController.getAgencyIdByAgentId(req.params.id);
      res.status(200).json({ agencyId });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

agentRouter.get("/agency-internal/agent/:id/businessId", async (req, res) => {
    try {
        const agent = await AgentController.getAgentId(req);
        res.status(200).json(agent);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});