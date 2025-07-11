import { Sequelize, DataTypes } from 'sequelize';
import { createHash } from 'crypto';

export function createModel(database) {
    database.define('Agent', {
        AgentID: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Name: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        Surname: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        Phone: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        VAT_Number: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Years_Experience: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        Agency_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CreatorAdmin_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        role: { 
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'agent',
        },
        CredentialsID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    }, { timestamps: false });
}
