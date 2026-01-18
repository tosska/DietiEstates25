import express from "express";
import { AgentController } from "../controllers/AgentController.js";
import { userContextMiddleware } from "../middleware/authorization.js";

export const agentRouter = express.Router();

agentRouter.post('/agents', userContextMiddleware, async (req, res, next) => {
    try {
        const result = await AgentController.createAgent(req.body, req.userId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

agentRouter.get('/agent/:id', async (req, res, next) => {
    try {
        const result = await AgentController.getAgentById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

agentRouter.put('/agent/:id', async (req, res, next) => {
    try {
        const result = await AgentController.updateAgent(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

agentRouter.get('/agency-internal/agent/:id/agencyId', async (req, res, next) => {
    try {
        const agencyId = await AgentController.getAgencyIdByAgentId(req.params.id);
        res.status(200).json({ agencyId });
    } catch (error) {
        next(error);
    }
});

agentRouter.get("/agency-internal/agent/:id/businessId", async (req, res, next) => {
    try {
        const agent = await AgentController.getAgentId(req.params.id);
        res.status(200).json(agent);
    } catch (error) {
        next(error);
    }
});