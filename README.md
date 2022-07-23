# notestream-api
> 🚰 This microservice is responsible for ingesting patient encounter audio (and other data) and converting it into output.  

This is done via a real-time streaming (using RxJS).  The API is exposed via a Socket.io websocket API.

## Running it locally

```
> ⚠️ This service makes use of private npm packages, so you'll need to be authenticated to use our company's private npm registry.

### Service dependencies
This service uses other microservices as dependencies.  You'll need to run those locally or connect to a running cluster.  The URLs are provided as environment variables.  These include:
- The GraphQL API (and its dependencies)
- The STT API (and its dependencies)

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

### Testing the API
With the app running, you can simulate a real stream using this package's cli tools:
```bash
yarn cli from-file --audio-file-id 60621d23347140dc6007dba2
# run a stream for 30 seconds from a sample audio file
yarn cli from-stream --take 30 --save-windows --save-words
```
For the full list of available options, see  `./scripts/notestream/index.js`.

Alternatively, you can use the react-stt or react-admin apps as user interfaces to run and analyze data.
