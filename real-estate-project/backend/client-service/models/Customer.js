
import { DataTypes } from "sequelize";
import { createHash } from "crypto";

export function createModel(database) {
  database.define('Customer', {
    id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    registrationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    credentialsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
    },
  }, { 
  });
}