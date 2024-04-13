# Sections:

> [Getting Started](#Getting-Started)

> [What if?](#What-If)

> [Social Login](#Social-login)

# Getting Started

### Install all necessary packages

```bash
# run in terminal
$ npm install
```

### Env setup

Copy `.env.example` to `.env` and populate it with the missing/relevant environment variables.

### Storage launch

#### Using Docker

If you have `Docker` installed on your machine just run `docker compose up` to launch development and test DBs.
(use separate terminal since services are running in attached mode)

#### Without Docker

Since app is using `PostgreSQL`, download latest version of PostgreSQL from [here](http://postgresql.org/download/) to your computer and install it.
Next, launch 2 databases (using `psql` or similar tool) with credentials identical to those you can find in the `docker-compose.yml` file.

### Run migrations

1. Build an application using `npm run build` to compile DB schema
1. Run migrations on development db, using:

```bash
$ npm run migrations:run
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

Since testing DB is synchronized with ORM, it's just needed to run one of the commands:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# What if?

To handle a scale of 1000 user registration requests per second and 100,000 user login requests per second, we'd need a highly scalable architecture.

- First, we would distribute the workload using load balancers (such as Nginx or HAProxy) to ensure even traffic distribution across multiple instances of our authentication service, orchestrated by Kubernetes.

- For user registration, we could leverage sharding techniques with TypeORM to partition data across multiple PostgreSQL database nodes, while Redis, integrated using ioredis, would serve as a cache layer to reduce database load.

- Additionally, we would implement connection pooling and optimize database queries for performance, using Nest.js for the application logic.

- Finally, we would continuously monitor performance metrics and auto-scale resources as needed to maintain responsiveness under varying loads.

# Social Login

To implement social login integration with services like Google or GitHub into our User Authentication service prototype, we can follow a standard OAuth 2.0 flow. Below is a sequence diagram illustrating the process:

![image](https://github.com/BigTako/USOF-Back-End/assets/87268303/fe2189f6-087d-47e9-914e-32b9aa111960)

1. User Interaction: The user clicks on the "Login with Google/GitHub" button on the authentication service's login page.

2. Redirect to OAuth Authorization Endpoint: The authentication service redirects the user to the OAuth authorization endpoint of the chosen social provider (Google or GitHub).

3. OAuth Authorization Code Exchange: The user authenticates with their credentials on the social provider's login page. Upon successful authentication, the social provider redirects back to the authentication service with an OAuth authorization code.

4. Exchange Code for Access Token: The authentication service exchanges the received authorization code for an access token by sending a request to the social provider's token endpoint.

5. Receive Access Token: The social provider responds with an access token.

6. Request User Info: The authentication service uses the access token to request user information from the social provider's user info endpoint.

7. Receive User Info: The social provider responds with the user's information.

8. Respond with JWT: The authentication service generates a JWT containing the user's information and responds to the user's browser.
