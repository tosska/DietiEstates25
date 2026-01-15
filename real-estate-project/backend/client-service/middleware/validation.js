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

export const createCustomerValidation = [
    body('credentialsId').isInt().withMessage('Credentials ID mancante'),
    body('name').notEmpty().withMessage('Nome obbligatorio'),
    body('surname').notEmpty().withMessage('Cognome obbligatorio'),
    validate
];

export const updateCustomerValidation = [
    param('id').isInt().withMessage('ID non valido'),
    body('name').optional().notEmpty().withMessage('Nome non valido'),
    body('surname').optional().notEmpty().withMessage('Cognome non valido'),
    validate
];

export const idParamValidation = [
    param('id').isInt().withMessage('ID non valido'),
    validate
];