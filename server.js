const express = require('express');
const moment = require('moment');
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');
const cors = require('cors');
const { config } = require('./config');
const serverRoutes = require('./routes');

const chatController = require('./components/chat/ChatController');

// const ChatMongoContainer = require('./components/chat/ChatMongoContainer')

// const chat = new ChatMongoContainer('mensajes')

//MONGO
// const Message = require('./components/chat/ChatMongoSchema');
// const message = {
//   author: {
//     id: 'aasdasd',
//     nombre: 'ccccccccc',
//     apellido: 'apellido',
//     alias: 'alias',
//     edad: 1,
//     avatar: 'avatar',
//   },
//   fecha: moment(new Date()).format('DD/MM/YYY HH:mm:ss'),
//   text: 'asd',
// };
// Message.create(message)



// NORMALIZE---------

const { normalize, schema } = require('normalizr');

const author = new schema.Entity('author', {}, { idAttribute: 'email' });
const text = new schema.Entity('text', { author: author },{ idAttribute: 'id' });
const messagesCenter = new schema.Entity('messagesCenter', {
  authors: [author],
  messages: [text]
}, { idAttribute: 'id' });

function normalizar(mensajes) {
  const normalizar = mensajes.map((message) => ({
    author: message.author,
    fecha: message.fecha,
    text: message.text,
    id: message._id.toString(),
  }));

  const normalizados = normalize(
    { id: 'mensajes', messages: normalizar },
    messagesCenter
  );
  
  return normalizados
}


//--------NORMALIZE

// Initializations
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(cors(`${config.cors}`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Rutas
serverRoutes(app);

/* SOCKETS */
io.on('connection', async (socket) => {
  console.log('nuevo cliente conectado');

  // socket.emit('products', products);

  socket.emit('messages', normalizar(await chatController.listAll()));

  // socket.on('productAdd', async (data) => {
  //   const { title, price, thumbnail } = data;
  //   await inventory.addProduct(title, price, thumbnail);
  //   const productos = await inventory.getProducts();
  //   io.sockets.emit('products', productos);
  // });

  socket.on('message', async (message) => {
    const { author, text } = message;
    const newMessage = {
      author,
      text,
      fecha: moment(new Date()).format('DD/MM/YYY HH:mm:ss'),
    };
    await chatController.save({
      author: newMessage.author,
      text: newMessage.text,
      fecha: newMessage.fecha,
    });
    io.sockets.emit('message', newMessage);
  });
});
/* SOCKETS */

const server = httpServer.listen(config.port, () => {
  console.log(`Servidor inicializado en el puerto ${config.port}.`);
});

server.on('error', () => {
  console.log('Error del servidor.');
});
