

export function internalOnly(req, res, next) {
  if (req.headers['x-internal-call'] !== process.env.INTERNAL_KEY) {
    return res.status(403).json({ error: 'Accesso negato' });
  }
  next();
}