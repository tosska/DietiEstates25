import { body, param, validationResult } from 'express-validator';

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Errore di validazione',
            errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    next();
};

export const idParamValidation = [
    param('id').isInt({ gt: 0 }).withMessage('ID non valido'),
    validate
];

export const createAgentValidation = [
    body('credentialsId').isInt().withMessage('Credentials ID mancante o non valido'),
    body('name').notEmpty().withMessage('Nome obbligatorio'),
    body('surname').notEmpty().withMessage('Cognome obbligatorio'),
    body('phone').notEmpty().withMessage('Telefono obbligatorio'),
    body('vatNumber').optional(),
    validate
];

export const createAdminValidation = [
    body('credentialsId').isInt().withMessage('Credentials ID mancante o non valido'),
    body('name').notEmpty().withMessage('Nome obbligatorio'),
    body('surname').notEmpty().withMessage('Cognome obbligatorio'),
    validate
];

export const updateProfileValidation = [
    param('id').isInt().withMessage('ID non valido'),
    body('name').optional().notEmpty().withMessage('Il nome non può essere vuoto'),
    body('surname').optional().notEmpty().withMessage('Il cognome non può essere vuoto'),
    validate
];

export const setupAgencyValidation = [
    body('credentialsId').isInt(),
    body('name').notEmpty(),
    body('surname').notEmpty(),
    body('phone').notEmpty(),
    body('vatNumber').notEmpty(),
    body('street').notEmpty(),
    body('city').notEmpty(),
    body('postalCode').notEmpty(),
    body('state').notEmpty(),
    body('houseNumber').notEmpty(),
    body('country').notEmpty(),
    validate
];