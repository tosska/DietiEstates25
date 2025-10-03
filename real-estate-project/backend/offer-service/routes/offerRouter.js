import express from "express";
import { OfferController } from "../controllers/OfferController.js";
import { enforceAuthentication,  enforceAuthenticationByAgent, enforceOfferAuthenticationByCustomer, restrictOfferAccess} from "../middleware/authorization.js";


export const offerRouter = new express.Router();

//offerRouter.use(enforceAuthentication);

// Recupero offerta
offerRouter.get("/offer/:offerId", enforceAuthentication, (req, res, next) => {
    OfferController.getOfferById(req.params.offerId)
        .then(offerItem => res.json(offerItem))
        .catch(next);
});

// Cancellazione offerta
offerRouter.delete("/offer/:offerId", enforceAuthentication, enforceOfferAuthenticationByCustomer, (req, res, next) => {
    OfferController.deleteOffer(req.params.offerId)
        .then(offerItem => res.json(offerItem))
        .catch(next);
});

// Lista offerte ricevute dall'agente raggruppate per annuncio
offerRouter.get("/offers/active", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    OfferController.getActiveOffersByAgent(req.userId)
        .then(offerItems => res.json(offerItems))
        .catch(next);
});

// Creazione offerta
offerRouter.post("/offer", enforceAuthentication, (req, res, next) => {
    OfferController.createOffer(req.body)
        .then(offerItem => res.status(201).json(offerItem.id))
        .catch(next);
});

// Agente risponde ad un'offerta (in pending)
offerRouter.put("/offer/:offerId/response", enforceAuthentication, restrictOfferAccess, (req, res, next) => {
    OfferController.respondToOffer(req.params.offerId, req.body.response)
        .then(() => res.status(200).json({ message: 'Response submitted successfully' }))
        .catch(next);
});

offerRouter.post("/offer/:offerId/counteroffer", enforceAuthentication, restrictOfferAccess, (req, res, next) => {
    OfferController.createCounteroffer(req.params.offerId, req.body)
        .then(() => res.status(201).json({ message: 'Counteroffer created successfully' }))
        .catch(next);
});

// Offerte pending per annuncio
offerRouter.get("/offers/pending/listing/:listingId", enforceAuthentication, (req, res, next) => {
    OfferController.getAllPendingOffersByListingId(req.params.listingId)
        .then(offerItems => res.json(offerItems))
        .catch(next);
});

// Conteggio offerte pending raggruppate per annuncio
offerRouter.get("/offers/pending/count-by-listing", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    OfferController.getCountOfPendingOffersGroupListing(req.userId)
        .then(counts => res.json(counts))
        .catch(next);
});

// Storico offerte per annuncio
offerRouter.get("/offers/history/listing/:listingId", enforceAuthentication, (req, res, next) => {
    OfferController.getOfferHistoryForListing(req.params.listingId, req.userRole, req.userId)
        .then(offerItems => res.json(offerItems))
        .catch(next);
});

// Da cancellare (test)
offerRouter.post("/verify-token", (req, res, next) => {
    let data = { id: 2, role: "agent" };
    res.json(data);
});

