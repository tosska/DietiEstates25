
import { DataTypes } from "sequelize";
import { createHash } from "crypto";

export function createModel(database) {
  database.define('Customer', {
    customerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    registration_Date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) { 
        let hash = createHash("sha256");    
        this.setDataValue('password', hash.update(value).digest("hex"));
      }
    }
  }, { 
  });
}