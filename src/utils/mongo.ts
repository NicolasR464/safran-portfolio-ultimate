import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
    throw new Error('Missing MONGODB_URI')
}

const DEFAULT_DB = process.env.MONGO_DB

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined
}

const client = new MongoClient(uri)

const clientPromise =
    global._mongoClientPromise ??
    (global._mongoClientPromise = client.connect())

export async function getMongoClient(): Promise<MongoClient> {
    return clientPromise
}

export async function getDb(name?: string) {
    const c = await getMongoClient()
    return c.db(name ?? DEFAULT_DB)
}

export const db = getDb
