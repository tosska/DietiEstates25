import express from "express";
import { ListingController } from "../controllers/ListingController.js";
import { enforceAuthentication, enforceAuthenticationByAgent} from "../middleware/authorization.js";
import { upload } from "../middleware/storageConfig.js";


export const listingRouter = new express.Router();

//offerRouter.use(enforceAuthentication);

//goal: recupero listing
listingRouter.get("/listing/:listingId", (req, res, next) => {
    ListingController.getListingById(req).then(listingItem => {
      res.json(listingItem);
    }).catch(err => {
      next(err);
    });
});

//goal: recupero listing multipli a partire da un arrat di listingId
listingRouter.post("/listings/by-ids", (req, res, next) => {
    ListingController.getListingsByIds(req).then(listings => {
      res.json(listings);
    }).catch(err => {
      next(err);
    });
});

listingRouter.post("/listing", enforceAuthentication, enforceAuthenticationByAgent, upload.array("photos"),(req, res, next) => {
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

listingRouter.get("/agent/listings/active", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    ListingController.getActiveListingsForAgent(req).then(listings => {
      res.status(200).json(listings);
    }).catch(err => {
      next(err);
      console.log(err.message);
    });
});

listingRouter.get("/listings/latest", enforceAuthentication, enforceAuthenticationByAgent, (req, res, next) => {
    ListingController.getLatestListings(req).then(listings => {
      res.status(200).json(listings);
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





