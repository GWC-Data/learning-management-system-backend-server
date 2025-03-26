// import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';

// // import { JobBoard } from './LinkedIn';

// @Table
// export class CompanyInfo extends Model {
//   @Column({ type: DataType.STRING, allowNull: false, unique: true })
//   companyName!: string;

//   @Column({ type: DataType.TEXT('long'), allowNull: true })
//   companyImg!: string;

//   @Column({ type: DataType.INTEGER, allowNull: true })
//   createdBy?: number;

//   @Column({ type: DataType.INTEGER, allowNull: true })
//   updatedBy?: number;

//   @HasMany(() => JobBoard, { foreignKey: 'companyId' })
//   jobBoard!: JobBoard[];
// }
