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





