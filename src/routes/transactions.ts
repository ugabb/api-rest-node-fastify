import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { knexInstance } from "../db/database";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knexInstance("transactions").select();

    return { transactions };
  });

  app.get("/:id", async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knexInstance("transactions")
      .where("id", id)
      .first();

    return { transaction };
  });

  app.get("/summary", async () => {
    const summary = await knexInstance("transactions")
      .sum("amount", { as: "amount" })
      .first();

    return { summary };
  });

  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const createTransactionBosySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBosySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knexInstance("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply
      .status(201)
      .send({ message: "Transaction created successfully" });
  });
}
