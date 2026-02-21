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

// import dns from 'node:dns/promises'
// dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'])

// import mongoose from 'mongoose'

// const MONGODB_URI = process.env.MONGODB_URI!
// const DB_NAME =
//   process.env.NODE_ENV === 'production'
//     ? process.env.MONGODB_DB_NAME || 'masterclass_db'
//     : 'test'

// if (!MONGODB_URI) {
//   throw new Error(
//     'Please define the MONGODB_URI environment variable in .env.local',
//   )
// }

// interface MongooseCache {
//   conn: typeof mongoose | null
//   promise: Promise<typeof mongoose> | null
// }

// declare global {
//   var _mongooseCache: MongooseCache | undefined
// }

// const cached: MongooseCache = global._mongooseCache ?? {
//   conn: null,
//   promise: null,
// }
// global._mongooseCache = cached

// async function connectToDatabase(): Promise<typeof mongoose> {
//   if (cached.conn) {
//     return cached.conn
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       dbName: DB_NAME,
//       bufferCommands: false,
//     })
//   }

//   try {
//     cached.conn = await cached.promise
//   } catch (error) {
//     cached.promise = null
//     throw error
//   }

//   return cached.conn
// }

// export default connectToDatabase
