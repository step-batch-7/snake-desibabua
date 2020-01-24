const { Server } = require('net');
const { readFileSync, existsSync, statSync } = require('fs');
const SERVING_DIR = `${__dirname}/public`;

const lookUp = {
  js: { dir: 'js', type: 'text/javascript' },
  css: { dir: 'css', type: 'text/css' },
  ico: { dir: 'images', type: 'image/jpeg' },
  jpg: { dir: 'images', type: 'image/jpeg' },
  html: { dir: 'html', type: 'text/html' },
  '/': { dir: 'html', type: 'text/html' }
};

const collectHeadersAndContent = (result, line) => {
  if (line === '') {
    result.content = '';
    return result;
  }
  if ('content' in result) {
    result.content += line;
    return result;
  }
  const [key, value] = line.split(': ');
  result.headers[key] = value;
  return result;
};

const getReqFileName = function(url) {
  const lookUpForFile = {
    '/': '/index.html',
    '/registeredUser': '/snakeGame.html'
  };
  const fileName = lookUpForFile[url] ? lookUpForFile[url] : url;

  const [, urlType] = url.match(/.*\.(.*)$/) || [, '/'];
  const absUrl = `${SERVING_DIR}/${lookUp[urlType].dir}${fileName}`;

  return absUrl;
};

class Request {
  constructor(method, url, header, body) {
    this.method = method;
    this.url = url;
    this.header = header;
    this.body = body;
  }

  static parse(data) {
    //'index.html?userId='
    const [requestLine, ...headersAndBody] = data.split('\r\n');
    const [method, fileAndKeyValuePairs, protocol] = requestLine.split(' ');
    const { headers, body } = headersAndBody.reduce(collectHeadersAndContent, {
      headers: {}
    });
    const [reqUrl, keyValuePairs] = fileAndKeyValuePairs.split('?');
    const url = getReqFileName(reqUrl);
    const req = new Request(method, url, headers, body);
    console.error(req);
    return req;
  }
}

class Response {
  constructor() {
    this.statusCode = 404;
    this.headers = [
      { key: 'Content-Type', value: 'text/plain' },
      { key: 'Content-Length', value: '0' }
    ];
  }

  setHeader(key, value) {
    let header = this.headers.find(header => header.key === key);
    if (header) header.value = value;
    this.headers.push({ key, value });
  }

  getHeaderMsg() {
    const lines = this.headers.map(header => `${header.key}: ${header.value}`);
    return lines.join('\r\n');
  }

  writeTo(writable) {
    writable.write(`HTTP/1.1 ${this.statusCode}\r\n`);
    writable.write(this.getHeaderMsg());
    writable.write('\r\n\r\n');
    this.body && writable.write(this.body);
  }
}

const getContentType = function(url) {
  const [, urlType] = url.split('.');
  const contentType = lookUp[urlType].type;
  return { contentType };
};

const servePage = function(req) {
  const res = new Response();
  res.statusCode = 200;
  const { contentType } = getContentType(req.url);
  const content = readFileSync(req.url);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.body = content;
  return res;
};

const isFilePresent = function(path) {
  const stat = existsSync(path) && statSync(path).isFile();
  return stat;
};

const findHandler = req => {
  if (req.method === 'GET' && isFilePresent(req.url)) return servePage;
  return () => new Response();
};

const handleConnection = function(socket) {
  socket.setEncoding('utf8');
  const remote = `${socket.remoteAddress} : ${socket.remotePort}`;
  console.error(`connection established with ${remote}`);
  socket.on('data', data => {
    const req = Request.parse(data);
    const handler = findHandler(req);
    const res = handler(req);
    res.writeTo(socket);
  });
  socket.on('error', e => console.error(`error happened in socket ${e}`));
  socket.on('end', () => console.error(`socket ended ${remote}`));
  socket.on('close', () => console.error(`socket closed ${remote}`));
};

const main = function() {
  const server = new Server();

  server.on('listening', () =>
    console.error(`started listening`, server.address())
  );

  server.on('close', () => console.error('server closed'));
  server.on('error', e => console.error(`error happened in server`, e));

  server.on('connection', handleConnection);
  server.listen(4000);
};

main();
