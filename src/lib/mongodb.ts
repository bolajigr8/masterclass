// import mongoose from 'mongoose'

// // Using a cached connection pattern for serverless environments
// let cachedConnection: {
//   conn: typeof mongoose | null
//   promise: Promise<typeof mongoose> | null
// } = { conn: null, promise: null }

// export const connectToDatabase = async (): Promise<typeof mongoose> => {
//   if (!process.env.MONGODB_URI) {
//     console.error('❌ MONGODB_URI is missing in environment variables')
//     throw new Error('MONGODB_URI is missing')
//   }

//   if (!process.env.MONGODB_DB_NAME) {
//     console.error('❌ DB_NAME is missing in environment variables')
//     throw new Error('DB_NAME is missing')
//   }

//   // If we have an active connection, return it
//   if (cachedConnection.conn) {
//     console.log('✅ Using existing MongoDB connection')
//     return cachedConnection.conn
//   }

//   // If a connection is already being established, wait for it
//   if (!cachedConnection.promise) {
//     console.log('🔄 Establishing new MongoDB connection...')

//     // Configure mongoose options
//     const mongooseOptions = {
//       bufferCommands: false,
//       dbName: process.env.MONGODB_DB_NAME, // Get database name from environment variables
//     }

//     // Create a new connection promise
//     cachedConnection.promise = mongoose
//       .connect(process.env.MONGODB_URI, mongooseOptions)
//       .then((mongoose) => {
//         console.log(
//           `✅ New MongoDB connection established to database: ${process.env.MONGODB_DB_NAME}`,
//         )
//         return mongoose
//       })
//       .catch((error) => {
//         console.error('❌ MongoDB connection error:', error)
//         cachedConnection.promise = null
//         throw error
//       })
//   } else {
//     console.log('⏳ Reusing connection promise...')
//   }

//   // Wait for the connection to be established
//   try {
//     cachedConnection.conn = await cachedConnection.promise
//     return cachedConnection.conn
//   } catch (error) {
//     console.error('❌ Failed to establish MongoDB connection:', error)
//     throw new Error('Database connection failed')
//   }
// }

// // Handle connection events
// mongoose.connection.on('error', (error) => {
//   console.error('❌ MongoDB connection error:', error)
// })

// mongoose.connection.on('disconnected', () => {
//   console.log('🔌 MongoDB disconnected')
//   // Reset the cached connection when disconnected
//   cachedConnection = { conn: null, promise: null }
// })

// export default connectToDatabase

import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'])

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local',
  )
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend the global type to hold the cached connection across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
}
global._mongooseCache = cached

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  return cached.conn
}

export default connectToDatabase
