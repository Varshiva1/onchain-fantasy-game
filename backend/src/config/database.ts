import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/onchain_fantasy';
    const dbName = process.env.DATABASE_NAME || 'onchain_fantasy';

    const conn = await mongoose.connect(mongoURI, { dbName });

    console.log(`MongoDB Connected: ${conn.connection.host}/${dbName}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
