
import { AuthController } from "../controllers/AuthController.js";
import { OfferController } from "../controllers/OfferController.js";
import { AuthClient } from "../clients/AuthClient.js";


export async function userContextMiddleware(req, res, next) {

    const authId = req.headers['x-user-authid'];
    const userId = req.headers["x-user-userid"];
    const role = req.headers['x-user-role'];
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1];
    
    if(!authId || !userId || !role) {  
        next({status: 401, message: "Unauthorized"});
        return;
    }

    try {
        await AuthClient.checkUser(authId);
    }
    catch(error) {
        next({status: 401, message: "Unauthorized"})
    }

    req.token = token;
    req.authId = authId;
    req.userId = userId;
    req.role = role;

    next();
}


export async function restrictOfferAccess(req, res, next) {

    
    console.log(req.params.offerId, req.userId, req.role);
    const response = await AuthController.canUserAccessOffer(req.params.offerId, req.userId, req.role);

    console.log("response:", response);
    
    if(response){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}


export function enforceAuthenticationByAgent(req, res, next) {

    if(req.role == "agent"){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}

export function enforceAuthenticationByCustomer(req, res, next) {

    if(req.role == "customer"){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}


//da cancellare
//da aggiungerre controllo listing: metodo http per vedere se l'annuncio espresso nel uri è stato creato dall'agente autenticato
export async function enforceOfferAuthenticationByAgent(req, res, next) {
    const agentId = req.params.agentId;

    if(agentId == req.userId && req.role == "agent"){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}



export async function enforceOfferAuthenticationByCustomer(req, res, next) {
    

    console.log(req.role);
    const response = await AuthController.canUserModifyOffer(req.params.offerId, req.userId, req.role)


    if(response){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}




