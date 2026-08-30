// this keeps one shared connection to mongodb ready for the api routes
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// stop early if the database address has not been set up
if (!uri) {
  throw new Error(
    "Please add MONGODB_URI to your .env.local file"
  );
}

// one client can be shared by all of the api routes
const client = new MongoClient(uri);

let clientPromise: Promise<MongoClient>;

declare global {
  // this global keeps the development connection through hot reloads
  var _mongoClientPromise:
    Promise<MongoClient> | undefined;
}

if (
  process.env.NODE_ENV === "development"
) {
  // reuse the connection when next.js reloads during development
  if (!global._mongoClientPromise) {
    global._mongoClientPromise =
      client.connect();
  }

  clientPromise =
    global._mongoClientPromise;
} else {
  // production can connect normally when the server starts
  clientPromise =
    client.connect();
}

export default clientPromise;
