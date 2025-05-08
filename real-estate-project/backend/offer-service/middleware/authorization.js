

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
        .catch(
            next({ status: 401, message: "Unauthorized" })
        );
}


async function isTokenValid(token) {

    const response = await fetch('http://auth-service:3000/verify-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });

    if (response.ok) {
        const data = await response.json(); // Parsa il corpo come JSON
        return data;
    } else {
        throw new Error("Token verification failed");
    }
    
} 



