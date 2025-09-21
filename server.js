// --- Minimal Node.js Express Server with Authentication Logic ---
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Essential for development environment

const app = express();
const port = 3000;

// Configuration
app.use(cors()); // Allow cross-origin requests from the Angular frontend
app.use(bodyParser.json()); // To parse incoming JSON requests

// --- Hardcoded User Data (Simulating a users.json file) ---
// In a real application, this would load from a database or a file system.
const USERS = [
    { username: 'user1', password: 'password123', name: 'Alice Smith' },
    { username: 'admin', password: 'adminpassword', name: 'Bob Johnson' }
];

/**
 * POST /login
 * Authenticates the user against the hardcoded USERS list.
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log(`Attempting login for: ${username}`);

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const user = USERS.find(
        u => u.username === username && u.password === password
    );

    if (user) {
        // In a real app, you would generate a JWT token here
        console.log(`Login successful for: ${username}`);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            userData: { username: user.username, name: user.name }
        });
    } else {
        console.log(`Login failed for: ${username}`);
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
});

// Example in a Node.js route handler
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

// --- Google Cloud Storage Configuration ---
// To generate a signed URL, the Storage client needs service account credentials.
// 1. Create a service account in your Google Cloud project.
// 2. Grant it "Storage Object Viewer" and "Service Account Token Creator" roles on your bucket.
// 3. Download the JSON key file for that service account.
// 4. Update the path in the `keyFilename` property below.
// For production, it's recommended to set the GOOGLE_APPLICATION_CREDENTIALS environment variable instead of hardcoding the path.
// const storage = new Storage({
//     keyFilename: 'path/to/your/service-account-key.json'
// });

app.get('/api/images/:imageName', async (req, res) => {
  const fileName = req.params.imageName;
  const bucketName = 'pso-misbahh-data'; 

  const options = {
    // Grant read access
    action: 'read', 
    // URL will be valid for a short time (e.g., 15 minutes)
    expires: Date.now() + 15 * 60 * 1000, 
  };

  try {
    const [url] = await storage
      .bucket(bucketName)
      .file("sau-offers-mages/"+ fileName)
      .getSignedUrl(options);

    // Return the signed URL to the Angular frontend
    res.json({ imageUrl: url });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating signed URL.');
  }
});

// --- Server Startup ---
app.listen(port, () => {
    console.log(`\n-----------------------------------------`);
    console.log(`Node.js Authentication Server running!`);
    console.log(`API endpoint: http://localhost:${port}/login`);
    console.log(`Test users: 'user1'/'password123' or 'admin'/'adminpassword'`);
    console.log(`-----------------------------------------\n`);
});

// Simple route for health check
app.get('/', (req, res) => {
    res.send('Auth Server is running.');
});
