import { Connection, Document, Model, Schema, SchemaTypes } from 'mongoose';

interface Gateway extends Document {
  readonly serial: string;
  readonly name: string;
  readonly ip4address: string;
  // readonly devices?: Partial<Device[]>;
}

type GatewayModel = Model<Gateway>;

const GatewaySchema = new Schema<Gateway>(
  {
    serial: SchemaTypes.String,
    name: SchemaTypes.String,
    ip4address: SchemaTypes.String,
    // devices: [{ type: SchemaTypes.ObjectId, ref: 'Device', required: false }]
  },
  { timestamps: true },
);

const createGatewayModel: (conn: Connection) => GatewayModel = (conn: Connection) =>
  conn.model<Gateway>('Gateway', GatewaySchema, 'Gateways');

export { Gateway, GatewayModel, createGatewayModel };
