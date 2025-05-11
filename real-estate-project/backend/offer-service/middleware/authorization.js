

export function enforceAuthentication(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1];
    if (!token) {
        next({status: 401, message: "Unauthorized"});
        return;
    }

    isTokenValid(token)
        .then(data => {
            req.user_id = data.id;
            req.user_role = data.role;
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


export function enforceOfferAuthenticationByAgent(req, res, next) {
    const idAgent = req.params.agentId;
    console.log(idAgent);
    console.log(req.user_id);

    if(idAgent == req.user_id && req.user_role == "agent"){
        next();
    } else {
        next({
            status: 403,
            message: "Forbidden! You do not have permission to view or modify this resource"
        });
    }
}



