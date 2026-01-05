import express from "express";
import morgan from "morgan";
import cors from "cors";
import { adminRouter } from "./routes/adminRouter.js";
import { agencyRouter } from "./routes/agencyRouter.js";
import { agentRouter } from "./routes/agentRouter.js";
import path from "path";


const app = express(); // creates an express application
const PORT = 3000;

// Register the morgan logging middleware, use the 'dev' format
app.use(morgan('dev'));

app.use(cors()); 

app.use("/agency-public/images", express.static(path.join(process.cwd(), "images")));

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

app.use(adminRouter);
app.use(agencyRouter);
app.use(agentRouter);


app.listen(PORT);