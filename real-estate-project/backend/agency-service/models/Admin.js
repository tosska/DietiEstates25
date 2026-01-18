import { DataTypes } from 'sequelize';


export function createModel(database) {
    database.define('Admin', {
        id: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        surname: {
            type: DataTypes.STRING(255),
            allowNull: true,    // per test
        },
        urlPhoto: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        manager: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        agencyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        credentialsId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
        },
    }, { timestamps: false });
}
