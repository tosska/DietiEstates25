import express from "express";
import { OfferController } from "../controllers/OfferController.js";
import { enforceAuthentication,  enforceOfferAuthenticationByAgent} from "../middleware/authorization.js";


export const offerRouter = new express.Router();



offerRouter.get("/offers/history/:idListing", enforceAuthentication, (req, res, next) => {
    OfferController.getOffersHistory(req).then(offerItems => {
      res.json(offerItems)
    }).catch(err => {
      next(err);
    });
});

offerRouter.get("/offer/:id", enforceAuthentication, (req, res, next) => {
    OfferController.getOfferById(req).then(offerItem => {
      res.json(offerItem)
    }).catch(err => {
      next(err);
    });
});


offerRouter.get("/offers/active/agents/:agentId/listings/:listingId", enforceAuthentication, enforceOfferAuthenticationByAgent, (req, res, next) => {
    OfferController.getActiveOffersForListingByAgent(req).then(offerItems => {
      res.json(offerItems)
    }).catch(err => {
      next(err);
    });
});

//valutare come funziona l'autenticazione: al momento qualunque utente autenticato può creare un offerta
offerRouter.post("/offer", enforceAuthentication, (req, res, next) => {
    OfferController.createOffer(req).then(offerItem => {
      res.status(201).json(offerItem.id);
    }).catch(err => {
      next(err);
    });
});

//da cancellare (test)
offerRouter.post("/verify-token", (req, res, next) => {
    //Jwt.verify(token, process.env.TOKEN_SECRET, callback);
    console.log("ho ricevuto una chiamata");
    let data = { id: 2, role: "agent" };
    res.json(data);
    //return res.status(401).json({ error: "Invalid token"})
});





