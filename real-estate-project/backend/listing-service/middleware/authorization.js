
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



