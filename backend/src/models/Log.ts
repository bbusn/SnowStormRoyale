import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Log extends Model {
    public id!: number;
    public status!: string;
    public message!: string;
    public source!: string;
}

Log.init({
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      status: {
          type: DataTypes.ENUM('success', 'error', 'warning', 'info'),
          allowNull: false,
      },
      message: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      source: {
          type: DataTypes.STRING,
          allowNull: false,
      },
  },
  {
      sequelize,
      modelName: "logs",
});
 
export default Log;