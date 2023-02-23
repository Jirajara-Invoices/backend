/* eslint-disable no-undef */
const argon2 = require("argon2");
const { createId } = require("@paralleldrive/cuid2");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const envConfig = dotenv.config();
dotenvExpand.expand(envConfig);

exports.shorthands = undefined;

exports.up = async (pgm) => {
  const id = createId();
  const pass = await argon2.hash(process.env.ADMIN_PASSWORD);
  pgm.sql(`
    INSERT INTO users (id, name, email, password, country, role) VALUES (
      '${id}',
      'Admin',
      '${process.env.ADMIN_USER}',
      '${pass}',
      'VE',
      'admin'::user_role
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM users WHERE email = 'admin@adolfo.co.ve';
  `);
};
