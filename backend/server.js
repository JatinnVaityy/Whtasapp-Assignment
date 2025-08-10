require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Message = require('./models/Message');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

/**
 * Process payloads folder (messages & statuses)
 */
async function processPayloads() {
  const payloadDir = path.join(__dirname, 'payloads');
  const files = fs.readdirSync(payloadDir);

  for (const file of files) {
    const filePath = path.join(payloadDir, file);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const payload = JSON.parse(rawData);

    if (file.includes('message')) {
      // Message payload
      const change = payload.metaData.entry[0].changes[0].value;
      const contact = change.contacts?.[0];
      const msg = change.messages?.[0];

      if (!msg) continue;

      const messageDoc = {
        id: msg.id,
        wa_id: contact.wa_id,
        name: contact.profile?.name || '',
        from: msg.from,
        timestamp: msg.timestamp,
        type: msg.type,
        text: msg.text,
        status: 'sent'
      };

      await Message.updateOne({ id: msg.id }, { $set: messageDoc }, { upsert: true });

    } else if (file.includes('status')) {
      // Status payload
      const change = payload.metaData.entry[0].changes[0].value;
      const statuses = change.statuses || [];
      for (const s of statuses) {
        await Message.updateOne(
          { id: s.id || s.meta_msg_id },
          { $set: { status: s.status } }
        );
      }
    }
  }
  console.log('Payloads processed');
}

// New webhook POST endpoint to receive live webhook payloads
app.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    const change = payload.metaData.entry[0].changes[0].value;

    if (change.messages) {
      const contact = change.contacts?.[0];
      const msg = change.messages[0];
      if (msg) {
        const messageDoc = {
          id: msg.id,
          wa_id: contact.wa_id,
          name: contact.profile?.name || '',
          from: msg.from,
          timestamp: msg.timestamp,
          type: msg.type,
          text: msg.text,
          status: 'sent'
        };
        await Message.updateOne({ id: msg.id }, { $set: messageDoc }, { upsert: true });
        io.emit('new_message', messageDoc);
      }
    } else if (change.statuses) {
      const statuses = change.statuses;
      for (const s of statuses) {
        await Message.updateOne(
          { id: s.id || s.meta_msg_id },
          { $set: { status: s.status } }
        );
        io.emit('status_update', s);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.sendStatus(500);
  }
});

// API: Get conversations grouped by wa_id
app.get('/conversations', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 }).lean();
  const conversations = {};

  for (const m of messages) {
    if (!conversations[m.wa_id]) {
      conversations[m.wa_id] = {
        wa_id: m.wa_id,
        name: m.name,
        messages: []
      };
    }
    conversations[m.wa_id].messages.push(m);
  }

  res.json(Object.values(conversations));
});

// API: Send new message
app.post('/messages', async (req, res) => {
  const { wa_id, name, text } = req.body;
  const newMsg = new Message({
    id: `local_${Date.now()}`,
    wa_id,
    name,
    from: 'me',
    timestamp: Math.floor(Date.now() / 1000).toString(),
    type: 'text',
    text: { body: text },
    status: 'sent'
  });

  await newMsg.save();
  io.emit('new_message', newMsg);
  res.json(newMsg);
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
});

server.listen(process.env.PORT || 5000, async () => {
  await processPayloads();
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
