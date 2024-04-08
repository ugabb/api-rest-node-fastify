import { test, beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app";

// Categorizando os testes.
describe("Transactions Routes", () => {
  // espera pela aplicação está completa/pronta para então fazer os testes.
  // Pois o fastify basicamente tudo é assíncrono.
  beforeAll(async () => {
    await app.ready();
  });

  // fecha a aplicação após realizar os testes.
  afterAll(async () => {
    await app.close();
  });

  // Teste de criação de transação
  test("POST /transactions | user can create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  // É possível fazer teste com "it()" também.
  // Teste de listagem de transações
  it("should be able to list all transactions", async () => {
    // cria uma requisição de criar uma transação.
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    // pega os cookies, no caso o sessionId que é necessário
    const cookies = createTransactionResponse.get("Set-Cookie");

    // cria o request para listar as transações
    const listTransactionsResponse = await request(app.server)
      .get("/transactions") // rota
      .set("Cookie", cookies || []) // set os cookies junto da requisição
      .expect(200);

    // espera que tenha um array contendo um objeto com os valores
    // {
    //     title: "New Transaction",
    //     amount: 5000,
    // }
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      }),
    ]);
  });
});
