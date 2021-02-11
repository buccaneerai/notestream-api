import path from 'path';
import dotenv from 'dotenv';

// initialize configuration on first load of the module
dotenv.config({path: path.resolve(__dirname, '../../.env')});

// The config function will simply read config from process.env but it's been
// abstracted here so that other modules never need to worry about the details
// of how the config gets passed into the application. This way we can change
// it in the future without breaking other parts of the application.
const config = function config() {
  return {
    ...process.env,
    PORT: parseInt(process.env.PORT, 10),
  };
};

export default config;
