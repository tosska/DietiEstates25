import express from "express";
import { OfferController } from "../controllers/OfferController.js";
import { enforceAuthentication,  enforceAuthenticationByAgent, enforceOfferAuthenticationByCustomer, restrictOfferAccess} from "../middleware/authorization.js";


export const offerRouter = new express.Router();

//offerRouter.use(enforceAuthentication);

//goal: recupero offerta
offerRouter.get("/offer/:offerId", enforceAuthentication, (req, res, next) => {
    OfferController.getOfferById(req).then(offerItem => {
      res.json(offerItem)
    }).catch(err => {
      next(err);
    });
});

//goal: cancellazione offerta
offerRouter.delete("/offer/:offerId", enforceAuthentication, enforceOfferAuthenticationByCustomer, (req, res, next) => {
    OfferController.deleteOffer(req).then(offerItem => {
      res.json(offerItem)
    }).catch(err => {
      next(err);
    });
});

//goal: lista offerte ricevute dall'agente raggruppate per annuncio
//anche un cliente può vedere le controfferte ricevute??
offerRouter.get("/offers/active", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    OfferController.getActiveOffersByAgent(req).then(offerItems => {
      res.json(offerItems)
    }).catch(err => {
      next(err);
    });
});

//goal: creazione offerta
//valutare come funziona l'autenticazione: al momento qualunque utente autenticato può creare un offerta
offerRouter.post("/offer", enforceAuthentication, (req, res, next) => {
    OfferController.createOffer(req).then(offerItem => {
      res.status(201).json(offerItem.id);
    }).catch(err => {
      next(err);
    });
});


//goal: agente risponde ad un offerta (in pending)
/*fare controllo se rispondo senza rispettare le enum*/
offerRouter.put("/offer/:offerId/response", enforceAuthentication, restrictOfferAccess, (req, res, next) => {
    OfferController.respondToOffer(req).then(offerItem => {
      res.status(200).json({message: 'Response submitted successfully'});
    }).catch(err => {
      next(err);
    });
});


offerRouter.get("/offers/pending/listing/:listingId", enforceAuthentication, (req, res, next) => {
    OfferController.getAllPendingOffersByListingId(req).then(offerItems => {
      console.log(offerItems);
      res.json(offerItems);
    }).catch(err => {
      next(err);
    });
});

offerRouter.get("/offers/pending/count-by-listing", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {

  OfferController.getCountOfPendingOffersGroupListing(req).then(counts => {
    console.log(counts);
    res.json(counts);
  }).catch(err => {
    next(err);
  });

});


offerRouter.get("/offers/history/listing/:listingId", enforceAuthentication, (req, res, next) => {
    OfferController.getOfferHistoryForListing(req).then(offerItems => {
      res.json(offerItems);
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







