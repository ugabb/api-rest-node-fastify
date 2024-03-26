import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { knexInstance } from "../db/database";
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkIfSessionIdExist } from "../middlewares/check-if-session-id-exist";

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  app.get(
    "/",
    {
      preHandler: [checkIfSessionIdExist],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const transactions = await knexInstance("transactions")
        .where("session_id", sessionId)
        .select();

      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkIfSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const transaction = await knexInstance("transactions")
        .where({
          id,
          session_id: sessionId,
        })
        .first();

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkIfSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const summary = await knexInstance("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return { summary };
    }
  );

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
