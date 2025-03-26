import path from 'path';

/**
 * Load a test environment
 */
process.env = {
  SILENCE_REPORT: 'true',
  PORT: '8080',
  SECONDARY_PORT: '8181',
  NODE_ENV: 'test',
  TLS_SERVER_KEY: path.resolve('certs/server.key'),
  TLS_SERVER_CERT: path.resolve('certs/server.crt'),
  TLS_CA: path.resolve('certs/ca.crt'),
};
