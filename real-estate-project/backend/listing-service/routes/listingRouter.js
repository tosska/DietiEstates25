import express from "express";
import { ListingController } from "../controllers/ListingController.js";
import { enforceAuthentication, enforceAuthenticationByAgent} from "../middleware/authorization.js";


export const listingRouter = new express.Router();

//offerRouter.use(enforceAuthentication);

//goal: recupero offerta
listingRouter.get("/listing/:listingId", enforceAuthentication, (req, res, next) => {
    ListingController.getListingById(req).then(listingItem => {
      res.json(listingItem);
    }).catch(err => {
      next(err);
    });
});

listingRouter.post("/listing", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    ListingController.createListing(req).then(listingItem => {
      res.status(201).json(listingItem.id);
    }).catch(err => {
      next(err);
      console.log(err.message);
    });
});

listingRouter.put("/listing/:listingId", enforceAuthentication,enforceAuthenticationByAgent, (req, res, next) => {
    ListingController.updateListing(req).then(listingItem => {
      res.status(200).json(listingItem.id);
    }).catch(err => {
      next(err);
      console.log(err.message);
    });
});

listingRouter.delete("/listing/:listingId", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    ListingController.deleteListing(req).then(listingItem => {
      res.status(200).json(listingItem.id);
    }).catch(err => {
      next(err);

    });
});


listingRouter.put("/listing/:listingId/closing", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    ListingController.closeListing(req).then(listingItem => {
      res.status(200).json(listingItem.status);
    }).catch(err => {
      next(err);
      console.log(err.message);
    });
});



//da cancellare (test)
listingRouter.post("/verify-token", (req, res, next) => {
    //Jwt.verify(token, process.env.TOKEN_SECRET, callback);
    console.log("ho ricevuto una chiamata");
    let data = { id: 2, role: "agent" };
    res.json(data);
    //return res.status(401).json({ error: "Invalid token"})
});





