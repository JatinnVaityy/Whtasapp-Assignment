WhatsApp Web Clone

🚀 Features
Real-time chat updates using WebSockets (Socket.io)

Fetch and display WhatsApp webhook messages

Send new messages (saved in database only)

MongoDB Atlas database integration

WhatsApp Web-like UI

Message timestamp formatting

Responsive sidebar & chat window

🛠 Tech Stack
Frontend: React.js, TailwindCSS
Backend: Node.js, Express.js, Socket.io
Database: MongoDB Atlas
Others: Webhook API, Axios

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/JatinnVaityy/Whtasapp-Assignment.git
cd Whtasapp-Assignment

2️⃣ Install backend dependencies
cd backend
npm install

3️⃣ Install frontend dependencies
cd ../frontend
npm install

4️⃣ Setup environment variables
Create a .env file inside the backend folder:
MONGO_URI=your_mongodb_connection_string
PORT=5000

5️⃣ Run the backend server
cd backend
node server.js

6️⃣ Run the frontend
cd frontend
npm run dev
