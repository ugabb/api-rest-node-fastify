import {
  test,
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
} from "vitest";
import request from "supertest";
import { app } from "../app";
import { execSync } from "node:child_process";

// Categorizando os testes.
describe("Transactions Routes", () => {
  // espera pela aplicação está completa/pronta para então fazer os testes.
  // Pois o fastify basicamente tudo é assíncrono.
  beforeAll(async () => {
    await app.ready();
  });

  // Antes de cada teste vai ser limpado o banco de dados e gerado novamente a partir da última migration
  beforeEach(() => {
    // execSync roda comandos no terminal do node
    execSync("npm run knex migrate:rollback --al");
    execSync("npm run knex migrate:latest");
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

  // Teste de listagem de uma transação específica
  it("should be able to get a specific transaction", async () => {
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

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies || [])
      .expect(200);

    // espera que tenha um objeto com os valores
    // {
    //     title: "New Transaction",
    //     amount: 5000,
    // }
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      })
    );
  });

  // Teste de soma total das transaçõse
  it("should be able to get the summary", async () => {
    // cria uma requisição de criar uma transação para crédito.
    const createCreditTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit Transaction",
        amount: 5000,
        type: "credit",
      });

    // pega os cookies, no caso o sessionId que é necessário
    const cookies = createCreditTransactionResponse.get("Set-Cookie");

    // cria uma requisição de criar uma transação para débito.
    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies || [])
      .send({
        title: "Debit Transaction",
        amount: 2000,
        type: "debit",
      });

    // cria o request para listar as transações
    const summaryResponse = await request(app.server)
      .get("/transactions/summary") // rota
      .set("Cookie", cookies || []) // set os cookies junto da requisição
      .expect(200);

    // espera que tenha objeto com os valor
    // {
    //     amount: 5000,
    // }
    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    });
  });
});


