import express from "express";
import { OfferController } from "../controllers/OfferController.js";
import { enforceAuthentication } from "../middleware/authorization.js";


export const offerRouter = new express.Router();


offerRouter.get("/offers/history/:idListing", enforceAuthentication, (req, res, next) => {
  OfferController.getOffersHistory(req).then(offerItems => {
    res.json(offerItems)
  }).catch(err => {
    next(err);
  });
});

offerRouter.get("/offer/:id", (req, res, next) => {
  console.log("Ciaone")
  OfferController.getOfferById(req).then(offerItem => {
    res.json(offerItem)
  }).catch(err => {
    next(err);
  });
});


offerRouter.get("/offers/", enforceAuthentication, (req, res, next) => {
  OfferController.getOffersHistory(req).then(offerItems => {
    res.json(offerItems)
  }).catch(err => {
    next(err);
  });
});





