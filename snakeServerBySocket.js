const { Server } = require('net');
const { readFileSync } = require('fs');

const getDefaultMsg = () => {
  return [
    `HTTP/1.1 404 Bad Request`,
    'Content-Type: text/html',
    `Content-Length: 0`,
    '',
    ''
  ].join('\n');
};

const getUrl = url => {
  if (url === '/') return './index.html';
  return `./${url}`;
};

const getType = url => {
  const lookUp = { js: 'text/javascript', css: 'text/css', jpg: 'image/jpeg' };
  const [, extension] = url.split('.');
  return extension ? lookUp[extension] : 'html';
};

const getMsg = function(url) {
  const fileContent = readFileSync(getUrl(url));

  const goodMsg = [
    `HTTP/1.1 200`,
    `Content-Type: ${getType(url)}`,
    `Content-Length: ${fileContent.length}`,
    '',
    ''
  ].join('\n');
  return [`${goodMsg}`, fileContent];
};

const getSocketNeed = text => {
  const [request] = text.split('\n');
  const [method, requestedUrl] = request.split(' ');
  return { requestedUrl, method };
};

const getResponseMsg = function(text) {
  const { requestedUrl, method } = getSocketNeed(text);
  if (method === 'GET') {
    return getMsg(requestedUrl);
  }
  return getDefaultMsg();
};

const handleConnection = function(socket) {
  socket.setEncoding('utf8');
  const remote = `${socket.remoteAddress} : ${socket.remotePort}`;
  console.log(`connection established with ${remote}`);
  socket.on('data', data => {
    const response = getResponseMsg(data);
    response.forEach(element => socket.write(element));
  });
  socket.on('error', e => console.log(`error happened in socket ${e}`));
  socket.on('end', () => console.log(`socket ended ${remote}`));
  socket.on('close', () => console.log(`socket closed ${remote}`));
};

const main = function() {
  const server = new Server();

  server.on('listening', () =>
    console.log(`started listening`, server.address())
  );

  server.on('close', () => console.log('server closed'));
  server.on('error', e => console.log(`error happened in server`, e));

  server.on('connection', handleConnection);
  server.listen(4000);
};

main();
