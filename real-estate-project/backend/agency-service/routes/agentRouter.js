import express from "express";
import { AgentController } from "../controllers/AgentController.js";
import { internalOnly } from "../middlewares/authorization.js";

export const agentRouter = express.Router();

agentRouter.post('/agents', async (req, res) => {
    try {
        const result = await AgentController.createAgent(req, res);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

agentRouter.get("/intern/agent/:id/businessId", (req, res, next) => {
    AgentController.getAgentId(req).then(agentId => {
      res.json(agentId);
    }).catch(err => {
      next(err);
    });
});