# Jirajara backend server

This is the backend server for Jirajara, a web application that helps you with your
personal invoicing and simple accounting.

### Requirements
  - NodeJS 18.x
  - Pnpm
  - PostgreSQL (we tested with 15.1)
  - Redis 6.x
  - Docker

### Installation
  - Rename `.env.example` to `.env` and fill the variables with your own values
  - Run `docker compose up` to start the database, redis and the backend server
  - Run `docker compose exec backend pnpm run migrate up` to sync the database schema
  - Open http://0.0.0.0:4000 to see the server running and http://0.0.0.0:4000/graphql to test the playground

## Roadmap (WIP)
  - [x] User management
  - [x] Authentication
  - [x] Simple addresses management
  - [x] Simple invoices and taxes management
  - [ ] Add translations
  - [ ] Send Invoices by email
  - [ ] Product management
  - [ ] Inventory management
  - [ ] Point of sale (POS) system (for physical products)
  - [ ] Customer management

New features are welcome!
