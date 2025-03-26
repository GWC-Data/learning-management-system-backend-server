import {Server} from 'node-server-engine';
import {generatePkiEnvironment} from 'backend-test-tools';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {Application} from 'express';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {createServer} from 'app/createServer';

chai.use(chaiAsPromised);
chai.use(sinonChai);

/**
 * Global test hooks
 */

// Save a copy to revert the environment variables to their original state before each test
const savedEnv = {...process.env};
export let server: Server;
export let app: Application;

before(async () => {
  // Generate certificates and keys
  generatePkiEnvironment();
  server = createServer();

  app = server.getApp();
  await server.init();
});

beforeEach(() => {
  process.env = {...savedEnv};
});

afterEach(() => {
  // Delete all stubs and spies
  sinon.restore();
});

after(async () => {
  await server.shutdown();
});
