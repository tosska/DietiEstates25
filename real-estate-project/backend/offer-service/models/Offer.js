import { DataTypes } from "sequelize";

export function createOfferModel(database) {
    database.define('Offer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2), // Valore monetario con 2 decimali
            allowNull: false
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('Accepted', 'Rejected', 'Pending'),
            allowNull: false
        },
        offer_Date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        response_Date: {
            type: DataTypes.DATE,
            allowNull: true, // Può essere nullo se non c'è risposta
        },
        counteroffer: {
            type: DataTypes.BOOLEAN, // Eventuale controfferta monetaria
            allowNull: true,
        },
        customer_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        agent_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        listing_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

    }, {

    })
}

