import express, { Request, Response, NextFunction, Router } from "express";
import { SearchController } from "../controllers/SearchController.js";



export const searchRouter: Router = express.Router();

//offerRouter.use(enforceAuthentication);

//goal: recupero offerta

searchRouter.post("/listings/search", (req: Request, res: Response, next: NextFunction) => {

    const body = req.body;
    SearchController.searchListing(body).then(listingItems => {
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





