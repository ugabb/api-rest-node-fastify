import knex, { Knex } from "knex";

export const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: "./mydb.sqlite",
  },
  useNullAsDefault: true,
};

export const knexInstance = knex(config);
