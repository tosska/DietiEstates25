
import { AuthClient } from "../clients/AuthClient.js";
import { AuthController } from "../controllers/AuthController.js";
import { ListingController } from "../controllers/ListingController.js";


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

/*
export function enforceAuthentication(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1];
    if (!token) {
        next({status: 401, message: "Unauthorized"});
        return;
    }

    isTokenValid(token)
        .then(data => {
            req.authId = data.authId
            req.userId = data.userId;
            req.userRole = data.role;
            next();
        })
        .catch(((err) => {
            next({ status: 401, message: err.message });
        })
        );
}
*/


async function isTokenValid(token) {

    const response = await fetch('http://localhost:3003/verify-token', {
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



