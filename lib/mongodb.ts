import { MongoClient } from "mongodb";

const isTest = process.env.NODE_ENV === "test";

const uri = isTest ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    isTest ? "MONGODB_TEST_URI is missing" : "MONGODB_URI is missing",
  );
}

const expectedDatabase = isTest ? "test" : "gobi-brands";

const databaseName = new URL(uri).pathname.slice(1).split("/")[0];

if (databaseName !== expectedDatabase) {
  throw new Error(
    `Wrong database! Expected "${expectedDatabase}", received "${databaseName}"`,
  );
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export async function closeMongoConnection() {
  const connectedClient = await clientPromise;
  await connectedClient.close();
}

export default clientPromise;
