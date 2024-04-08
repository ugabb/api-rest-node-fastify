import {test, beforeAll, afterAll} from "vitest"
import request from "supertest"
import {app} from "../app"

// espera pela aplicação está completa/pronta para então fazer os testes.
// Pois o fastify basicamente tudo é assíncrono.
beforeAll(async () => {
    await app.ready()
})

// fecha a aplicação após realizar os testes.
afterAll(async () => {
    await app.close()
})


// Teste de criação de transação
test("POST /transactions | user can create a new transaction", async () => {
    await request(app.server)
    .post("/transactions")
    .send({
        title: "New Transaction",
        amount: 5000,
        type:"credit"
    })
    .expect(201)
})