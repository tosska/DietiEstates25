import express from "express";
import { SearchController } from "../controllers/SearchController.js";
//import { ListingController } from "../controllers/ListingController.js";



export const searchRouter = new express.Router();

//offerRouter.use(enforceAuthentication);

//goal: recupero offerta

searchRouter.post("/listings/search", (req, res, next) => {
    SearchController.searchListing(req).then(listingItems => {
      res.json(listingItems);
    }).catch(err => {
      next(err);
    });
});


//da cancellare (test)
searchRouter.post("/verify-token", (req, res, next) => {
    //Jwt.verify(token, process.env.TOKEN_SECRET, callback);
    console.log("ho ricevuto una chiamata");
    let data = { id: 2, role: "agent" };
    res.json(data);
    //return res.status(401).json({ error: "Invalid token"})
});





