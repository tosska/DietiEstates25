
import { DataTypes } from "sequelize";

export function createPropertyTypeModel(database) {
    database.define('PropertyType', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
        
    },{timestamps: false

    })
}