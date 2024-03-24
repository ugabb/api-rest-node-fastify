import fastify from "fastify";
import { knexInstance } from "./db/database";

const app = fastify();

app.get("/hello", async () => {
  try {
    const transactions = await knexInstance("transactions").select("*");
    return transactions;
  } catch (error) {
    console.error("Error occurred while accessing database:", error);
    throw new Error("Internal Server Error");
  }
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP Server Running!");
});
