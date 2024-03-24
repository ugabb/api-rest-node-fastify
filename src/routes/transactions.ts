import { FastifyInstance } from "fastify";
import { knexInstance } from "../db/database";

export async function transactionsRoutes(app: FastifyInstance){
    app.get("/hello", async () => {
        try {
          const transactions = await knexInstance("transactions").select("*");
          return transactions;
        } catch (error) {
          console.error("Error occurred while accessing database:", error);
          throw new Error("Internal Server Error");
        }
      });
}