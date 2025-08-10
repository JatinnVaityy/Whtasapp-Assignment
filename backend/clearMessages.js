const mongoose = require('mongoose');
const Message = require('./models/Message'); // adjust path

const MONGO_URI = 'mongodb+srv://vaityjatin:vaityjatin@cluster0.egjyk29.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function clearMessages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const result = await Message.deleteMany({});
    console.log('Deleted messages count:', result.deletedCount);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

clearMessages();
