import express from "express";
import morgan from "morgan";
import cors from "cors";
import { searchRouter } from "./routes/searchRouter.js";
import { ListingConsumer } from "./models/ListingConsumer.js";
import { ListingSearchIndex } from "./models/ListingSearchIndex.js";


const app = express(); // creates an express application
const PORT = 3005;


//fare refactoring di questo codice
await ListingConsumer.init();
await ListingSearchIndex.init();

ListingConsumer.listenAll({
    onCreate: async (listing) => {
      console.log(' creazione listing:', listing);
      ListingSearchIndex.addOrUpdateListings(listing);
      // puoi aggiornare cache, indice di ricerca, ecc.
    },
    onUpdate: async (listing) => {
      console.log(' Annuncio aggiornato:', listing);
      ListingSearchIndex.addOrUpdateListings(listing);
    },
    onDelete: async ({ id }) => {
      console.log(' Annuncio eliminato con id:', id);
      ListingSearchIndex.deleteListing(id);
    }
});



// Register the morgan logging middleware, use the 'dev' format
app.use(morgan('dev'));

app.use(cors()); 

// Parse incoming requests with a JSON payload
app.use(express.json());

//error handler
app.use( (err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
        code: err.status || 500,
        description: err.message || "An error occurred"
    });
});

app.use(searchRouter);
app.listen(PORT);