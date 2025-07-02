import express from "express";
import morgan from "morgan";
import cors from "cors";
import { listingRouter } from "./routes/listingRouter.js";
import { ListingPublisher } from "./models/ListingPublisher.js";

const app = express(); // creates an express application
const PORT = 3003;

app.use(cors()); 

ListingPublisher.init();

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


app.use(listingRouter);
app.listen(PORT);