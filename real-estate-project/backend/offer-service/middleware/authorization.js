
import { AuthController } from "../controllers/AuthController.js";
import { OfferController } from "../controllers/OfferController.js";

export function enforceAuthentication(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1];
    if (!token) {
        next({status: 401, message: "Unauthorized"});
        return;
    }

    isTokenValid(token)
        .then(data => {
            req.userId = data.id;
            req.userRole = data.role;
            next();
        })
        .catch(((err) => {
            next({ status: 401, message: err.message });
        })
        );
}


async function isTokenValid(token) {

    const response = await fetch('http://localhost:3004/verify-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        throw Error(data.error);
    }
    
} 

export async function restrictOfferAccess(req, res, next) {


    const response = await AuthController.canUserAccessOffer(req.params.offerId, req.userId, req.userRole);
    
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

    if(req.userRole == "agent"){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}

export function enforceAuthenticationByCustomer(req, res, next) {

    if(req.userRole == "customer"){
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

    if(agentId == req.userId && req.userRole == "agent"){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}


//perchè asincrono?
export async function enforceOfferAuthenticationByCustomer(req, res, next) {
    

    console.log(req.user_role);
    const response = await AuthController.canUserModifyOffer(req.params.offerId, req.userId, req.userRole)


    if(response){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}




