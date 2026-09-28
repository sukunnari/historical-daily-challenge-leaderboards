import { drizzle } from "drizzle-orm/libsql";
import { assertString } from "../utils/assert.js";

const db = drizzle(assertString(process.env.DB_URL));

export { db };
