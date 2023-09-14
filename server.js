const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const storage = multer.memoryStorage(); // Store files in memory (you can customize this)
const upload = multer({ storage });

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Process the uploaded file as needed
  // For example, you can save it to disk or store it in a database

  // Send a response to indicate success
  res.status(200).send('File uploaded successfully.');
});

let storedContent = ''; // To store the displayed content

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Store the received message as the displayed content
    storedContent = message;

    // Broadcast the received message to all connected clients (TVs)
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Serve your TV web interface using Express
app.use(express.static('public'));

// Create an API endpoint to retrieve stored content
app.get('/getStoredContent', (req, res) => {
  res.json({ content: storedContent });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
