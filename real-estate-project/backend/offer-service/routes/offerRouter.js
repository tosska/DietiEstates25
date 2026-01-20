import { Router } from "express"; // Importazioni unite
import { OfferController } from "../controllers/OfferController.js";
import { 
    userContextMiddleware,  
    enforceAuthenticationByAgent, 
    enforceOfferAuthenticationByCustomer, 
    restrictOfferAccess
} from "../middleware/authorization.js";
import { 
    validateParamId, 
    createOfferValidation, 
    offerResponseValidation, 
    counterOfferValidation 
} from "../middleware/validation.js"; // Assumo che il file sia in utils/ o validation.js

export const offerRouter = new Router();

// Recupero offerta
offerRouter.get("/offer/:offerId", 
    userContextMiddleware, 
    validateParamId('offerId'), // Validazione ID
    (req, res, next) => {
        OfferController.getOfferById(req.params.offerId)
            .then(offerItem => res.json(offerItem))
            .catch(next);
});

// Cancellazione offerta
offerRouter.delete("/offer/:offerId", 
    userContextMiddleware, 
    enforceOfferAuthenticationByCustomer, 
    validateParamId('offerId'), // Validazione ID
    (req, res, next) => {
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
offerRouter.post("/offer", 
    userContextMiddleware, 
    createOfferValidation, // Validazione Body
    (req, res, next) => {
        OfferController.createOffer(req.body, req.userId, req.role)
            .then(offerItem => res.status(201).json(offerItem.id))
            .catch(next);
});

// Agente risponde ad un'offerta (in pending)
offerRouter.put("/offer/:offerId/response", 
    userContextMiddleware, 
    restrictOfferAccess, 
    offerResponseValidation, // Validazione ID + Body Response
    (req, res, next) => {
        OfferController.respondToOffer(req.params.offerId, req.body.response, req.token)
            .then(() => res.status(200).json({ message: 'Response submitted successfully' }))
            .catch(next);
});

// Creazione controfferta
offerRouter.post("/offer/:offerId/counteroffer", 
    userContextMiddleware, 
    restrictOfferAccess, 
    counterOfferValidation, // Validazione ID + Body Value
    (req, res, next) => {
        OfferController.createCounteroffer(req.params.offerId, req.body, req.role)
            .then(() => res.status(201).json({ message: 'Counteroffer created successfully' }))
            .catch(next);
});

// Offerte pending per annuncio
offerRouter.get("/offers/pending/listing/:listingId", 
    userContextMiddleware, 
    validateParamId('listingId'), // Validazione ID listing
    (req, res, next) => {
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

// Storico offerte per annuncio (agente)
offerRouter.get("/agent/offers/history/listing/:listingId", 
    userContextMiddleware, 
    validateParamId('listingId'), // Validazione ID listing
    (req, res, next) => {
        OfferController.getOfferHistoryForListingByAgent(req.params.listingId, req.userId)
            .then(offerItems => res.json(offerItems))
            .catch(next);
});

// Storico offerte per annuncio (customer)
offerRouter.get("/customer/offers/history/listing/:listingId", 
    userContextMiddleware, 
    validateParamId('listingId'), // Validazione ID listing
    (req, res, next) => {
        OfferController.getOfferHistoryForListingByCustomer(req.params.listingId, req.userId)
            .then(offerItems => res.json(offerItems))
            .catch(next);
});

offerRouter.get("/offers/all/listing-ids", userContextMiddleware, (req, res, next) => {
    OfferController.getListingIdFromOffers(req.userId)
        .then(listingIds => res.json(listingIds))
        .catch(next);
});