import {DataTypes } from 'sequelize';


export function createModel(database) {
    database.define('Agency', {
        agencyId: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        phone: {
            type: DataTypes.STRING(105),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT('clob'),
            allowNull: false,
        },
        vatNumber: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        managerAdminId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        addressId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, { timestamps: false });
}
