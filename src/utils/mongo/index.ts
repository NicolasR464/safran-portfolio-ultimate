import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
    throw new Error('Missing MONGODB_URI')
}

const DEFAULT_DB = process.env.DB_NAME

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined
}

const clientPromise =
    global._mongoClientPromise ??
    (global._mongoClientPromise = new MongoClient(uri).connect())

export const getMongoClient = async (): Promise<MongoClient> => clientPromise

export const getDb = async (name?: string) => {
    const client = await getMongoClient()
    return client.db(name ?? DEFAULT_DB)
}
