
import { Utils } from "./models/Utils.js";
import express from "express";
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import { searchRouter } from "./routes/searchRouter.js";
import { SearchEngine } from "./types/SearchEngine.js";
import { ListingToIndex, IncomingListing } from "./types/Listing.js";
import { MeiliSearchEngine } from "./models/MeiliListingSearchEngine.js";
import { SearchController } from "./controllers/SearchController.js";
import { MessageQueueRabbit } from "./models/MessageQueueRabbit.js";
import 'dotenv/config';




const app = express(); // creates an express application
const PORT = 3005;


bootstrap();

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

  let listingSearchEngine: SearchEngine<ListingToIndex>;
  
  try{
    listingSearchEngine= await MeiliSearchEngine.create(
      process.env.SEARCH_ENGINE_URL as string, 
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
    'country',
    'categories'
  ]);


  } catch(error){
    console.log("Errore connessione al motore di ricerca:", error);
  }

  try{
    // Istanzia la coda RabbitMQ per Listing
    const messageQueue = new MessageQueueRabbit<IncomingListing>('amqp://localhost');
    await messageQueue.connect();

    messageQueue.consume('listing_created', async (listing: IncomingListing | string) => {
      console.log('Listing created:', listing);
      const flatListing : ListingToIndex = Utils.convertListingObjectToFlatObject(listing as IncomingListing);
      await listingSearchEngine.addItemToIndex(flatListing);
    });

    messageQueue.consume('listing_updated', async (listing: IncomingListing | string) => {
      console.log('Listing created:', listing);
      const flatListing : ListingToIndex = Utils.convertListingObjectToFlatObject(listing as IncomingListing);
      await listingSearchEngine.addItemToIndex(flatListing);
    });

    messageQueue.consume('listing_deleted', async (id: IncomingListing | string) => {
      console.log('Listing created:', id);
      await listingSearchEngine.removeItemFromIndex(id as string);
    });

  } catch (error) {
    console.error('Errore durante la connessione a RabbitMQ:', error);
  
  }

}
