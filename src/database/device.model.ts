import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';
import { Gateway } from './gateway.model';
export enum Status {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE"
}
interface Device extends Document {
  readonly uid: string;
  readonly vendor?: string;
  readonly gateway?: Partial<Gateway>;
  readonly createdAt?: Date;
  readonly status?: Status;
}

type DeviceModel = Model<Device>;

const CommentSchema = new Schema<Device>(
  {
    uid: SchemaTypes.String,
    vendor: SchemaTypes.String,
    createdAt: SchemaTypes.Date,
    status: { type: String, enum: [Status.ONLINE, Status.OFFLINE], required: true },
    gateway: { type: SchemaTypes.ObjectId, ref: 'Gateway', required: false }
  },
  { timestamps: true },
);

const createDeviceModel: (conn: Connection) => DeviceModel = (
  connection: Connection,
) => connection.model<Device>('Device', CommentSchema, 'devices');

export { Device, DeviceModel, createDeviceModel };
