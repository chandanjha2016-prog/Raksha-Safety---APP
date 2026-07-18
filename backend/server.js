
// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connect
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 2. SOS Route
app.post('/api/sos', async (req, res) => {
  try {
    const { userId, name, lat, lng, contacts } = req.body;
    
    console.log("SOS Aaya:", name, lat, lng);
    
    // Yahan hum contacts ko SMS karenge - abhi console me print kar rahe
    contacts.forEach(contact => {
      console.log(`Alert bheja gaya: ${contact.name} - ${contact.phone}`);
      console.log(`Location: https://maps.google.com/?q=${lat},${lng}`);
    });

    res.status(200).json({ 
      success: true, 
      message: "SOS alert bhej diya gaya" 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Test Route
app.get('/', (req, res) => {
  res.send("Raksha Backend Chal raha hai ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chal raha hai port ${PORT} pe`));
