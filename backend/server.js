


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http');
const morgan = require('morgan');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const axios = require('axios');

dotenv.config();

const app = express();
app.disable("etag");

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://pawprox.online",
    "https://www.pawprox.online"
  ],
  credentials: true,
}));


app.use(bodyParser.json());
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const petcareServicesRoutes = require('./routes/petcareServicesRoutes');
const veterinarianRoutes = require('./routes/veterinarianRoutes');
const medicalBookingRoutes = require('./routes/medicalBookingRoutes');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chatRoutes');
const friendRoutes = require('./routes/friendRoutes');
const petRoutes = require('./routes/petRoutes');
const vendorProductRoutes = require('./routes/vendorProductRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const shippingTaxRoutes = require('./routes/shippingTaxRoutes');
const contactRoutes = require("./routes/contactRoutes");

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/petcare', petcareServicesRoutes);
app.use('/api/veterinarians', veterinarianRoutes);
app.use('/api/medical-bookings', medicalBookingRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/vendor/products', vendorProductRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', ordersRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/shipping-tax", shippingTaxRoutes);
app.use("/api/contact", contactRoutes);

// Static image proxy (placeholder)
app.get('/api/placeholder/:width/:height', async (req, res) => {
  const { width, height } = req.params;
  const url = `https://via.placeholder.com/${width}x${height}`;
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (err) {
    res.sendStatus(502);
  }
});

// Root test endpoint
app.get('/', (req, res) => {
  res.status(200).send('Pet Website Backend is running');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// HTTP & WebSocket server setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: Token missing'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error'));
  }
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id, 'User:', socket.user.id);

  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
  });

  socket.on('sendMessage', async (data) => {
    data.message.sender_id = socket.user.id;
    const chatController = require('./controllers/chatController');
    try {
      const savedMessage = await chatController.createMessageSocket(data.message);
      io.to(data.room).emit('message', savedMessage);
    } catch (err) {
      console.error('Error in sendMessage:', err);
    }
  });

  socket.on('likeMessage', async (data) => {
    const chatController = require('./controllers/chatController');
    try {
      const updatedMessage = await chatController.likeMessageSocket(data.messageId, socket.user.id);
      io.to(data.room).emit('messageLiked', updatedMessage);
    } catch (err) {
      console.error('Error in likeMessage:', err);
    }
  });

  socket.on('deleteMessage', async (data) => {
    const chatController = require('./controllers/chatController');
    try {
      const deletedMessageId = await chatController.deleteMessageSocket(data.messageId, socket.user.id);
      io.to(data.room).emit('messageDeleted', deletedMessageId);
    } catch (err) {
      console.error('Error in deleteMessage:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


app.get('/api/test', (req, res) => {
  res.send({ message: "Backend is working fine!" });
});



// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
