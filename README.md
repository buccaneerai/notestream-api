# notestream-api
> 🚰 This microservice is responsible for ingesting patient encounter audio (and other data) and converting it into output.  This is done via a real-time streaming (using RxJS).  The API is exposed via a Socket.io websocket API.

## Running it locally

> 🍎 There is a known issue on Mac M1 ARM chips: You must use node 15 or higher for it to work. 

```
> ⚠️ This service makes use of private npm packages, so you'll need to be authenticated to use our company's private npm registry.

### Service depdencies
This service uses other microservices as dependencies.  You'll need to run those locally or connect to a running cluster.  The URLs are provided as environment variables.

### .env file
This project receives configuration inputs via the `dotenv` package.
```bash
cp local.env
.env
```
> ⚠️ You'll need to fill in the blanks.  Some of the environment variables include secret keys that are not tracked in .git.

### Run the app
```bash
yarn dev
```
> 💡 You can test things at the integration level by running our admin dashboard (react app) or writing/using scripts (in the `./scripts` directory) to pass test data directly into your pipelines.
