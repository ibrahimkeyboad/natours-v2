import mongoose from 'mongoose';

interface ConnectionInfo {
  isConnected: boolean;
}

const connection: ConnectionInfo = {
  isConnected: false,
};

async function connect(): Promise<void> {
  if (connection.isConnected) {
    console.log('already connected');
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState === 1;
    if (connection.isConnected) {
      console.log('use previous connection');
      return;
    }
    await mongoose.disconnect();
  }

  const db = await mongoose.connect(process.env.MONGODB_URI || '');

  console.log('new connection');
  connection.isConnected = db.connections[0].readyState === 1;
}

async function disconnect(): Promise<void> {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log('not disconnected');
    }
  }
}

function convertDocToObj<T>(doc: mongoose.Document): T {
  const convertedDoc = doc.toObject();
  convertedDoc._id = convertedDoc._id.toString();
  convertedDoc.createdAt = convertedDoc.createdAt.toString();
  convertedDoc.updatedAt = convertedDoc.updatedAt.toString();
  return convertedDoc as T;
}

const db = { connect, disconnect, convertDocToObj };
export default db;
