import express from "express";
import { OfferController } from "../controllers/OfferController.js";
import { userContextMiddleware,  enforceAuthenticationByAgent, enforceOfferAuthenticationByCustomer, restrictOfferAccess} from "../middleware/authorization.js";


export const offerRouter = new express.Router();

//offerRouter.use(enforceAuthentication);

// Recupero offerta
offerRouter.get("/offer/:offerId", userContextMiddleware, (req, res, next) => {
    OfferController.getOfferById(req.params.offerId)
        .then(offerItem => res.json(offerItem))
        .catch(next);
});

// Cancellazione offerta
offerRouter.delete("/offer/:offerId", userContextMiddleware, enforceOfferAuthenticationByCustomer, (req, res, next) => {
    OfferController.deleteOffer(req.params.offerId)
        .then(offerItem => res.json(offerItem))
        .catch(next);
});

// Lista offerte ricevute dall'agente raggruppate per annuncio
offerRouter.get("/offers/active", userContextMiddleware, enforceAuthenticationByAgent, (req, res, next) => {
    OfferController.getActiveOffersByAgent(req.userId)
        .then(offerItems => res.json(offerItems))
        .catch(next);
});

// Creazione offerta
offerRouter.post("/offer", userContextMiddleware, (req, res, next) => {
    OfferController.createOffer(req.body)
        .then(offerItem => res.status(201).json(offerItem.id))
        .catch(next);
});

// Agente risponde ad un'offerta (in pending)
offerRouter.put("/offer/:offerId/response", userContextMiddleware, restrictOfferAccess, (req, res, next) => {
    OfferController.respondToOffer(req.params.offerId, req.body.response, req.token)
        .then(() => res.status(200).json({ message: 'Response submitted successfully' }))
        .catch(next);
});

offerRouter.post("/offer/:offerId/counteroffer", userContextMiddleware, restrictOfferAccess, (req, res, next) => {
    OfferController.createCounteroffer(req.params.offerId, req.body)
        .then(() => res.status(201).json({ message: 'Counteroffer created successfully' }))
        .catch(err => console.log(err));
});

// Offerte pending per annuncio
offerRouter.get("/offers/pending/listing/:listingId", userContextMiddleware, (req, res, next) => {
    OfferController.getAllPendingOffersByListingId(req.params.listingId)
        .then(offerItems => res.json(offerItems))
        .catch(next);
});

// Conteggio offerte pending raggruppate per annuncio
offerRouter.get("/offers/pending/count-by-listing", userContextMiddleware, enforceAuthenticationByAgent, (req, res, next) => {
    OfferController.getCountOfPendingOffersGroupListing(req.userId)
        .then(counts => res.json(counts))
        .catch(next);
});

// Storico offerte per annuncio
offerRouter.get("/offers/history/listing/:listingId", userContextMiddleware, (req, res, next) => {
    OfferController.getOfferHistoryForListing(req.params.listingId, req.role, req.userId)
        .then(offerItems => res.json(offerItems))
        .catch(next);
});
