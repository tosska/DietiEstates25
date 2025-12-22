import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Address', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        street: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        unitDetail: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        houseNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        longitude: {
            type: DataTypes.FLOAT(10),
            allowNull: true,
        },
        latitude: {
            type: DataTypes.FLOAT(10),
            allowNull: true,
        },
    }, { timestamps: false });
}
