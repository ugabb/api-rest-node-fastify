import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function checkIfSessionIdExist(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.cookies;

  if (!sessionId) {
    return reply.status(401).send("Unauthorized");
  }
}
