import { DataTypes } from "sequelize";

export function createPhotoModel(database) {
    database.define('Photo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        url: {
            type: DataTypes.STRING, 
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false 
        }
    }, {
 
    })
}

