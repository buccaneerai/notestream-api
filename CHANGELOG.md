# [1.0.0-dev.15](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.14...v1.0.0-dev.15) (2022-11-17)


### Bug Fixes

* THR-278 Remove old ECR repo ([fa0bec8](https://github.com/buccaneerai/notestream-api/commit/fa0bec84ed5ec4cf06aa5af74eaecb995ace1329))

# [1.0.0-dev.14](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.13...v1.0.0-dev.14) (2022-11-03)


### Bug Fixes

* THR-108 get the stt api working ([b70681a](https://github.com/buccaneerai/notestream-api/commit/b70681a70a7c9995e5b86c5a78b3877b06d95149))
* THR-108 put back aws-medical ([9199746](https://github.com/buccaneerai/notestream-api/commit/9199746f8f7e5b6be9876f8479ce4af092372106))

# [1.0.0-dev.13](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.12...v1.0.0-dev.13) (2022-11-02)


### Bug Fixes

* THR-108 couple fixes ([a59782e](https://github.com/buccaneerai/notestream-api/commit/a59782ecba60edc2b4c06cb133ff3b6dfe578b39))

# [1.0.0-dev.12](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.11...v1.0.0-dev.12) (2022-11-02)


### Bug Fixes

* THR-108 Fix createRun ([f3701ec](https://github.com/buccaneerai/notestream-api/commit/f3701ecddd06b0ab579509cc7cbeda36f2bafbd8))

# [1.0.0-dev.11](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.10...v1.0.0-dev.11) (2022-11-02)


### Bug Fixes

* **bug:** resolved issue where notestream would stop accepting new connections after an error ([f00f91a](https://github.com/buccaneerai/notestream-api/commit/f00f91a79159ec1fc3f3223fc470fb7970e498b0))
* **chore:** removed console.log statements ([b414a52](https://github.com/buccaneerai/notestream-api/commit/b414a52c57882f6e1122b7ce0cb00ae3f78b90c1))

# [1.0.0-dev.10](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.9...v1.0.0-dev.10) (2022-10-31)


### Bug Fixes

* **logging:** added logs to debug issue with S3 permissions ([d84a3eb](https://github.com/buccaneerai/notestream-api/commit/d84a3eb09b2ae7755bba073fe51fbcd21994284e))

# [1.0.0-dev.9](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.8...v1.0.0-dev.9) (2022-10-31)


### Bug Fixes

* THR-108 Fix notestream api calls for telephone calls ([46492b9](https://github.com/buccaneerai/notestream-api/commit/46492b9d71eb8b6185c9b37beba304b967dc305e))

# [1.0.0-dev.8](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.7...v1.0.0-dev.8) (2022-10-26)


### Bug Fixes

* **bug:** set gcp as default stt engine since aws currently does not work ([64bc1a1](https://github.com/buccaneerai/notestream-api/commit/64bc1a1ba7e20dabf2e4962d372753569bf4c228))

# [1.0.0-dev.7](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.6...v1.0.0-dev.7) (2022-10-25)


### Bug Fixes

* **bug:** storeWindows now reads s3 bucket and key from graphql response ([55e87b2](https://github.com/buccaneerai/notestream-api/commit/55e87b232d1ced569829cfd843cc10aae14d943d))

# [1.0.0-dev.6](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.5...v1.0.0-dev.6) (2022-10-20)


### Bug Fixes

* updated graphql-sdk version ([455d843](https://github.com/buccaneerai/notestream-api/commit/455d843de75501479ce57b8ef348e5ceec7f3bcf))

# [1.0.0-dev.5](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.4...v1.0.0-dev.5) (2022-10-18)


### Bug Fixes

* updated socketio operator ([058bc06](https://github.com/buccaneerai/notestream-api/commit/058bc06f9913bf16611d8042d1dfefa55796cc52))

# [1.0.0-dev.4](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.3...v1.0.0-dev.4) (2022-10-15)


### Bug Fixes

* STT conduit now logs errors ([48e6ffb](https://github.com/buccaneerai/notestream-api/commit/48e6ffbf63ce6337a4ef4caad995e54fa71f5f0e))

# [1.0.0-dev.3](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.2...v1.0.0-dev.3) (2022-10-14)


### Bug Fixes

* audio stream logging should not alter input stream ([175679c](https://github.com/buccaneerai/notestream-api/commit/175679c59782685452522c6b3a05f8939521ab55))

# [1.0.0-dev.2](https://github.com/buccaneerai/notestream-api/compare/v1.0.0-dev.1...v1.0.0-dev.2) (2022-10-11)


### Bug Fixes

* THR-214 Bump version ([d8ec21f](https://github.com/buccaneerai/notestream-api/commit/d8ec21f7b092a5e5ea69685a9a0d74222fb525f4))

# 1.0.0-dev.1 (2022-10-07)


### Bug Fixes

* added yarn.lock file which should have been in prior commit ([d5756de](https://github.com/buccaneerai/notestream-api/commit/d5756ded8e6a77927b4f838675bd9b9dbc918118))
* bumped graphql-sdk version ([b7d09c5](https://github.com/buccaneerai/notestream-api/commit/b7d09c5bc6049ad194c34ca7a3334191e24075a9))
* cd fix for npm auth ([ce3393a](https://github.com/buccaneerai/notestream-api/commit/ce3393aa3d7ea18a989e386face8132874251a06))
* dependabot config fix ([c7ecdc3](https://github.com/buccaneerai/notestream-api/commit/c7ecdc3293e0aac40fae662ba8edcb981f3adda7))
* dependabot.yml syntax error ([060a3ec](https://github.com/buccaneerai/notestream-api/commit/060a3ec138160b59350d437b313afec9bc58f94f))
* fixed authenticator logic ([22ac3c3](https://github.com/buccaneerai/notestream-api/commit/22ac3c3e2cf049e1403cad2976e1ecc223d5828e))
* fixed broken tests in operators folder ([11fc1ec](https://github.com/buccaneerai/notestream-api/commit/11fc1ec41df5ece44b28c0582b6bdb02032902f4))
* fixed issue where notestream events were named differently than STT API events ([c9e2f9f](https://github.com/buccaneerai/notestream-api/commit/c9e2f9f8314eb1471969b7ab0db9e1fdec98a940))
* installed logging utils ([89606fe](https://github.com/buccaneerai/notestream-api/commit/89606fedafedcd830ea21f824847ab06f6b6e662))
* local.env GraphQL config ([033ca35](https://github.com/buccaneerai/notestream-api/commit/033ca35f11c87d812efbebfaf321f43e0cbbe7a0))
* note window logic now properly creates note windows ([c56e5a4](https://github.com/buccaneerai/notestream-api/commit/c56e5a4ef3f9538a6609416440e2278b7d07103d))
* note window storage now formats CSV properly ([209510a](https://github.com/buccaneerai/notestream-api/commit/209510ae28519e26f1bf95d4813e05a1c9bb00aa))
* removed console logs from predictElements operator ([df0bff3](https://github.com/buccaneerai/notestream-api/commit/df0bff303de7ad142be27d196a9ee8a71f096780))
* resolved broken export and import in createAudioStream ([aa94dc7](https://github.com/buccaneerai/notestream-api/commit/aa94dc7bee25482005b563ef69b8953290bfda2c))
* resolved broken reference ([e40af8a](https://github.com/buccaneerai/notestream-api/commit/e40af8a28ec926894787dbd54de552b390d99dd6))
* resolved export and import mistake in getStreamConfig ([9b0f909](https://github.com/buccaneerai/notestream-api/commit/9b0f909a9a6e990db6e3118458010e6e93deb2c8))
* resolved issue where graphql was improperly called ([0e7fbea](https://github.com/buccaneerai/notestream-api/commit/0e7fbeaa98b67333db6ed3eb4d2091c2be104dfe))
* resolved issue where producer did not receive audio chunks properly ([26e83c1](https://github.com/buccaneerai/notestream-api/commit/26e83c1919366d9ae9befa9e5575420b97945a82))
* resolved naming issue in audio storage operator ([4653b79](https://github.com/buccaneerai/notestream-api/commit/4653b79bbd0aa37f41f0bdf805d93127003e27da))
* resolved syntax error in test ([c34cf9d](https://github.com/buccaneerai/notestream-api/commit/c34cf9de8828f9fb50b3ad49b0ca4f9b4ec1e461))
* try v2 of build-push docker action in CD ([f2344f5](https://github.com/buccaneerai/notestream-api/commit/f2344f54dfd12a1d1518f0b52e81bcce4157cfdf))
* unit tests now pass ([43f0ab4](https://github.com/buccaneerai/notestream-api/commit/43f0ab44b94e8b535112e1d8ccf83ae96d9c2e1d))
* updated graphql-sdk version ([df833b4](https://github.com/buccaneerai/notestream-api/commit/df833b4be72e613a150424a68447cdf84c8177a9))
* updated nvmrc to make gcp work on Apple M1 ([7cee578](https://github.com/buccaneerai/notestream-api/commit/7cee578bbafa604dc92bba6e07ed2de103a17fa2))


### Features

* added audio encoding converter ([f7e78f1](https://github.com/buccaneerai/notestream-api/commit/f7e78f1eb430d9ef7d6e8988f039b688f2ef77e8))
* added cli script to package.json ([ebbc411](https://github.com/buccaneerai/notestream-api/commit/ebbc411bd14c01a5c7fdbe32822d15f258dbbcff))
* added Github workflows ([d542aff](https://github.com/buccaneerai/notestream-api/commit/d542aff5c08e5e3bb2dc2ddce9d1111cfd15345c))
* added ingestion for audio stream from client and refactored audio modules ([6f0bc78](https://github.com/buccaneerai/notestream-api/commit/6f0bc7876e044a6cb19ca0e2dd6c978cdc6ed0c3))
* added logic to ingest audio from the client ([532bd16](https://github.com/buccaneerai/notestream-api/commit/532bd163d91b6dc9756ce839fa843c8420e044f0))
* added module to update run status ([1c51044](https://github.com/buccaneerai/notestream-api/commit/1c51044b35024661e1f0180411f1b7b9b1d9c68a))
* added operator to store config for jobs ([4f337da](https://github.com/buccaneerai/notestream-api/commit/4f337da5a7ef2e384c6d93bc529cacac2f922dd1))
* added pipeline to update run statuses ([27c7f58](https://github.com/buccaneerai/notestream-api/commit/27c7f58cbcd16d6e3703c35d8417c9be4610ca5e))
* added placeholders for notestream scripts ([85df4fa](https://github.com/buccaneerai/notestream-api/commit/85df4fa9321cbe8adfe52ee92be575ec51606fe9))
* added storage for run updates ([526a1da](https://github.com/buccaneerai/notestream-api/commit/526a1dac43675efc7ccddc60191ddf9e30d4223c))
* added storage for STT events and updated fileChunkToSTT ([67292d8](https://github.com/buccaneerai/notestream-api/commit/67292d8ee96f0249c79fe09bb77e74be251c32c4))
* added storage modules ([8560e69](https://github.com/buccaneerai/notestream-api/commit/8560e694b6d0705025e4195fde44d4b08ededae5))
* added support for audio streams from clients ([e628bf8](https://github.com/buccaneerai/notestream-api/commit/e628bf8c0f6991a330f42ef6a1e7d046099e2e51))
* added telephoneCall input type for incoming streams ([164f136](https://github.com/buccaneerai/notestream-api/commit/164f136ac4833a7751cdbf87b3e09bddf96e9552))
* almost all tests pass for STT ensembler ([7488f5c](https://github.com/buccaneerai/notestream-api/commit/7488f5ccc1511150123c92d4f35e56452705c694))
* app now passes in options to store STT output ([2dfb86e](https://github.com/buccaneerai/notestream-api/commit/2dfb86eeabe40a52b0f3c1d08e096af0fcf4c655))
* app now updates the status of run when it disconnects, stops, or is completed ([986e063](https://github.com/buccaneerai/notestream-api/commit/986e063015d4dd7b21c89fb1e1bd916228a72988))
* AWS stt words now have speaker fields ([420c421](https://github.com/buccaneerai/notestream-api/commit/420c421f6da91b0b52d8749973ca94ce53b46779))
* consumeOneClientStream now integrates storage and windows without crashing ([d4fb280](https://github.com/buccaneerai/notestream-api/commit/d4fb2809ab9436d6c379116da34ba6816e06456a))
* consumeOneClientStream now saves audio only if in audio streaming mode ([28c54f3](https://github.com/buccaneerai/notestream-api/commit/28c54f31d284968d95fdbfce09a2ebbcd6f503e9))
* consumeOneClientStream now uses an operator to store audio optionally ([7c9beea](https://github.com/buccaneerai/notestream-api/commit/7c9beeab631c7b789eee0204d933159e70a08f8d))
* consumeOneClientStream now uses stt api and does not generate NLP or prediction output ([7bcc8f2](https://github.com/buccaneerai/notestream-api/commit/7bcc8f2fa926f5bca8f02a7dd1484446c06813fe))
* createAudioStream now uses audio file data from GraphQL API ([ecbfd19](https://github.com/buccaneerai/notestream-api/commit/ecbfd195a8c0303c87e31a4345c65da31ec78377))
* deepspeech stt words now include speaker fields ([3adb0e6](https://github.com/buccaneerai/notestream-api/commit/3adb0e660c493a29bfaff46358a0682105d36b73))
* first attempt at createWindows operator ([c834357](https://github.com/buccaneerai/notestream-api/commit/c834357d62b08c77f1494ec29adb9c32dfdcee86))
* first commit, setup microservice project ([53bc192](https://github.com/buccaneerai/notestream-api/commit/53bc192d1dabecda9ad817df983461d28643b051))
* GCP stt words now use new speaker fields ([cf85ab0](https://github.com/buccaneerai/notestream-api/commit/cf85ab0d12f44210c533ad67077ddc536db2b0c7))
* getStreamConfig now has storage options ([b46126d](https://github.com/buccaneerai/notestream-api/commit/b46126dc215472c296fd0107060b7a76a249c35f))
* getStreamConfig now uses included token for run mutation auth ([2c1da8d](https://github.com/buccaneerai/notestream-api/commit/2c1da8d5e0602d09cd13d3a1953d2cf459d00d11))
* IBM STT results now get mapped properly to words ([35766a2](https://github.com/buccaneerai/notestream-api/commit/35766a29bfde25c5a4708c324144d011c6dec174))
* implemented authentication ([f0de7ae](https://github.com/buccaneerai/notestream-api/commit/f0de7ae88693d55366932d0dc3b7e34897f05642))
* implemented function to store raw audio to s3 ([d3f7205](https://github.com/buccaneerai/notestream-api/commit/d3f72056260ae4551e35279038efe7705d2481bd))
* implemented new toSTT operator ([2e9c0b9](https://github.com/buccaneerai/notestream-api/commit/2e9c0b901a359ed5e8d45252ccdbe5db9bd73991))
* increased note window timeout ([4ddac4b](https://github.com/buccaneerai/notestream-api/commit/4ddac4bb46f5c22675ed9971a1c2e8edf679d74b))
* installed @buccaneerai/graphql-sdk package ([a437b97](https://github.com/buccaneerai/notestream-api/commit/a437b97546e30b44f7f886c26f51999fe7cec1de))
* mapIBMSttToWords is mostly functional ([83f4b0a](https://github.com/buccaneerai/notestream-api/commit/83f4b0a439ea7fd46cb2022b9691b48eed05c2e7))
* node.js app now runs without babel ([aebea69](https://github.com/buccaneerai/notestream-api/commit/aebea69f4178a13858b849ee7e424230a2475d24))
* producer now has STT_COMPLETE event ([b8a694c](https://github.com/buccaneerai/notestream-api/commit/b8a694c1bad720944c643ee6898b646f011bd912))
* renamed producer events to more appropriate names ([8554f5d](https://github.com/buccaneerai/notestream-api/commit/8554f5d69bfc236c392766b93b0a8811a857a568))
* started work on CLI tool ([cf2b226](https://github.com/buccaneerai/notestream-api/commit/cf2b226ed765e0237d2eb3607bba714fe3ae8c4c))
* storate operators are now stable ([1f2772d](https://github.com/buccaneerai/notestream-api/commit/1f2772d8091ff35f7bd0135028ba1bc96ce391c3))
* storeWords operator tests now pass ([24cef60](https://github.com/buccaneerai/notestream-api/commit/24cef60755f3af004b3f6b7db31f5e54a0750034))
* stream config now allows stt messages to not be sent to client ([04db39f](https://github.com/buccaneerai/notestream-api/commit/04db39fe11c3b42dea18ae673a33292470739765))
* streamConfig now accepts storage configuration ([220708b](https://github.com/buccaneerai/notestream-api/commit/220708bc38a78a08d58cddcfe8c366e8fa83db5a))
* streamConfig now accepts telephoneCall as an input type ([0e3d967](https://github.com/buccaneerai/notestream-api/commit/0e3d9670cd54e88b682ed175638d644d98d1db15))
* STT ensembler now caches words properly ([03f32f3](https://github.com/buccaneerai/notestream-api/commit/03f32f3d55093b09d130f546b9554a2d48ec797e))
* stt operator now has timeouts ([3ff71a3](https://github.com/buccaneerai/notestream-api/commit/3ff71a3665c9e043b31ececb022d3d0fdb35191e))
* toSTT operator is now functional ([3bc5161](https://github.com/buccaneerai/notestream-api/commit/3bc5161ef954bb2820f62b93f2a986d0a5b6feb2))
* toSTT operator now includes new auth strategy ([ef56111](https://github.com/buccaneerai/notestream-api/commit/ef56111e51539c67eff550c408d9b0ec2c08387f))
* updated deepgram words to include speakers ([ca0868e](https://github.com/buccaneerai/notestream-api/commit/ca0868e53099d2bfd71dc80f6993da0b3154d3ac))
* updated getStreamConfig to work with stt api ([fce213e](https://github.com/buccaneerai/notestream-api/commit/fce213ebf5aa1848c32136ac9b6b587b2ded0a40))
* updated graphql sdk to v 2.x ([93e92ca](https://github.com/buccaneerai/notestream-api/commit/93e92cafeca0a13aedf94404783c066e9cb26e4b))
* updated package.json to use newest deepgram operator with diarization ([aa2c8e0](https://github.com/buccaneerai/notestream-api/commit/aa2c8e0906109c387d6ff1ed721d6661e4137b91))
* updated S3 location for note run output ([645f2a0](https://github.com/buccaneerai/notestream-api/commit/645f2a0f6861c2357445e91d7976047c4dff4640))
* updated scripts to include simulation script ([fee2ee1](https://github.com/buccaneerai/notestream-api/commit/fee2ee14b17d932e1e93fca9ce1c250b3ce135fb))
* upgraded server to socketio v4 and added auth ([aa5bdaa](https://github.com/buccaneerai/notestream-api/commit/aa5bdaa3f8faa0ff119c079819cceb61f6f7216f))
* upgraded to socketio v4 ([010379a](https://github.com/buccaneerai/notestream-api/commit/010379afe91b7de46f382b2e6d9cc268072ef11a))
* websocket now sends back runId of the created run ([7603606](https://github.com/buccaneerai/notestream-api/commit/760360670c6c9db44843adf8840dc0d73750e0e1))
* windows now include start and end fields ([514889c](https://github.com/buccaneerai/notestream-api/commit/514889c551ac2c6439160ab0b35c49a9f9854456))
