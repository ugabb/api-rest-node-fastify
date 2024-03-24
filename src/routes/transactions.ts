import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { knexInstance } from "../db/database";
import { z } from "zod";

export async function transactionsRoutes(app: FastifyInstance) {
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const createTransactionBosySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBosySchema.parse(
      request.body
    );

    await knexInstance("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return reply.status(201).send({message: "Transaction created successfully"})
  });
}
