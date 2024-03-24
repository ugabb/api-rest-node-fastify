import fastify from "fastify";
import { knexInstance } from "./db/database";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

app.register(transactionsRoutes, {
  prefix: "transactions",
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP Server Running!");
});
