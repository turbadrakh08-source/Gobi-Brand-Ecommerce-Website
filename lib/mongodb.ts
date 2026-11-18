import { MongoClient } from "mongodb";

const isTest = process.env.NODE_ENV === "test";

const expectedDatabase = isTest ? "test" : "gobi-brands";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const uri = isTest ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        isTest ? "MONGODB_TEST_URI is missing" : "MONGODB_URI is missing",
      );
    }

    const databaseName = new URL(uri).pathname.slice(1).split("/")[0];

    if (databaseName !== expectedDatabase) {
      throw new Error(
        `Wrong database! Expected "${expectedDatabase}", received "${databaseName}"`,
      );
    }

    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function closeMongoConnection() {
  if (clientPromise) {
    const connectedClient = await clientPromise;
    await connectedClient.close();

    client = null;
    clientPromise = null;
  }
}
