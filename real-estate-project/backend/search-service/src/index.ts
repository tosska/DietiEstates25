import express from "express";
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import { searchRouter } from "./routes/searchRouter.js";
import { ListingConsumer } from "./models/ListingConsumer.js";
import { SearchEngine } from "./types/SearchEngine.js";
import { Listing } from "./types/Listing.js";
import { MeiliSearchEngine } from "./models/MeiliListingSearchEngine.js";
import { SearchController } from "./controllers/SearchController.js";
import { MessageQueueRabbit } from "./models/MessageQueueRabbit.js";


const app = express(); // creates an express application
const PORT = 3005;


bootstrap();


/*
//fare refactoring di questo codice
await ListingConsumer.init();


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
*/


// Register the morgan logging middleware, use the 'dev' format
app.use(morgan('dev'));

app.use(cors()); 

// Parse incoming requests with a JSON payload
app.use(express.json());

//error handler
app.use( (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
        code: err.status || 500,
        description: err.message || "An error occurred"
    });
});

app.use(searchRouter);
app.listen(PORT);

//da sistemare
async function bootstrap() {


  const listingSearchEngine: SearchEngine<Listing> = await MeiliSearchEngine.create(
    'http://localhost:4567', 
    undefined,
    'listings', 
    'id'
  );
  //probabilmente si dovrebbe fare un singleton
  SearchController.listingSearchEngine = listingSearchEngine;

  await listingSearchEngine.setFilterableField([
    'listingType',
    'status',
    'numberRooms',
    'area',
    'price',
    'constructionYear',
    'energyClass',
    'city',
    'state',
    'street',
    'postalCode',
    'unitDetail',
    'longitude',
    'latitude',
    'country'
  ]);

  try{
        // Istanzia la coda RabbitMQ per Listing
    const messageQueue = new MessageQueueRabbit<Listing>('amqp://localhost');
    await messageQueue.connect();

    await messageQueue.consume('listing_created', async (listing: Listing) => {
      console.log('Listing created:', listing);
      await listingSearchEngine.addItemToIndex(listing);
    });

  } catch (error) {
    console.error('Errore durante la connessione a RabbitMQ:', error);
  
  }

}