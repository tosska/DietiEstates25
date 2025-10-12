import express from "express";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import { listingRouter } from "./routes/listingRouter.js";
import { ListingPublisher } from "./models/ListingPublisher.js";

const app = express(); // creates an express application
const PORT = 3003;

app.use(morgan('dev'));

app.use(cors()); 

//ListingPublisher.init();

// Parse incoming requests with a JSON payload
app.use(express.json());
app.use("/listing-public/images/active", express.static(path.join(process.cwd(), "images/active"))); //middlware che serve file statici su un certo uri


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