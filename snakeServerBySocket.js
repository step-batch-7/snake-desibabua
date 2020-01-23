const { Server } = require('net');
const { readFileSync } = require('fs');
const SERVING_DIR = `${__dirname}/public`;

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

class Request {
  constructor(method, url, header, body) {
    this.method = method;
    this.url = url;
    this.header = header;
    this.body = body;
  }

  static parse(data) {
    const [requestLine, ...headersAndBody] = data.split('\r\n');
    const [method, reqUrl, protocol] = requestLine.split(' ');
    const { headers, body } = headersAndBody.reduce(collectHeadersAndContent, {
      headers: {}
    });
    const url = reqUrl === '/' ? `/index.html` : reqUrl;
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

const getUrlNeeds = function(url) {
  const lookUp = {
    js: { dir: 'js', type: 'text/javascript' },
    css: { dir: 'css', type: 'text/css' },
    jpg: { dir: 'images', type: 'image/jpeg' },
    html: { dir: 'html', type: 'text/html' }
  };

  const [, urlType] = url.split('.');

  const contentType = lookUp[urlType].type;
  const absUrl = `${SERVING_DIR}/${lookUp[urlType].dir}${url}`;
  return { contentType, absUrl };
};

const servePage = function(req) {
  const res = new Response();
  res.statusCode = 200;
  const { contentType, absUrl } = getUrlNeeds(req.url);
  const content = readFileSync(absUrl);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.body = content;
  return res;
};

const findHandler = req => {
  if (req.method === 'GET') return servePage;
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
