

export function internalOnly(req, res, next) {
  //if (req.headers['apiKey'] !== process.env.INTERNAL_API_KEY) {
    //return res.status(403).json({ error: 'Accesso negato' });
  //}
  next();
}