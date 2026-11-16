import { beforeAll, afterAll } from "@jest/globals";
import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_TEST_URI;

if (!uri) {
  throw new Error("MONGODB_TEST_URI is missing");
}

const client = new MongoClient(uri);

beforeAll(async () => {
  await client.connect();

  const databaseName = client.db().databaseName;

  if (databaseName !== "test") {
    throw new Error(
      `Integration tests must use the test database. Received: ${databaseName}`,
    );
  }
});

afterAll(async () => {
  await client.close();
});
