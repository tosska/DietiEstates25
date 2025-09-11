import { DataTypes } from "sequelize";

export function createAddressModel(database) {
    database.define('Address', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        street: {
            type: DataTypes.STRING, 
            allowNull: false
        },
        houseNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {                    //provincia/stato interno
            type: DataTypes.STRING,
            allowNull: false, 
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        unitDetail: {
            type: DataTypes.STRING, 
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        longitude:{
            type: DataTypes.FLOAT,
            allowNull: true
        },    
        latitude:{
            type: DataTypes.FLOAT,
            allowNull: true
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['street', 'city', 'postalCode', 'state', 'unitDetail']
            }
        ]
    })
}

