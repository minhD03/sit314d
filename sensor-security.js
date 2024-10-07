const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://minhdang:S87zHL9N414D2Zl9@taskd.qpg3v.mongodb.net/?retryWrites=true&w=majority&appName=TaskD');

const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;
app.use(express.json());

//Define my datastructure.
const sensorSchema = new mongoose.Schema({
  id: Number,
  name: String,
  devicenum: String, 
  address: String,
  temperature: Number,
  humidity: Number,
  light: Number,
  motion: Boolean,
  time: Date,
});

//Create model.
const SensorData = mongoose.model('SensorData', sensorSchema);

let previousTemperature = null;
let previousHumidity = null;
let previousLight = null;
let latestSensorData = null;

//Generate random data.
function generateRandomData(deviceNumber) {
  const id = Date.now(); 
  const name = 'Sensors Data';
  const address = '250 Elgar Road, Box Hill South, Victoria, Melbourne'; 
  const now = new Date();

  //Generate random values within 20% range of previous values.
  let temperature = previousTemperature ? 
    Math.min(Math.max(previousTemperature * (1 + (Math.random() - 0.5) * 0.4), -50), 100) 
    : Math.random() * 100;
  
  let humidity = previousHumidity ? 
    Math.min(Math.max(previousHumidity * (1 + (Math.random() - 0.5) * 0.4), 0), 100) 
    : Math.random() * 100;
  
  let light = previousLight ? 
    Math.min(Math.max(previousLight * (1 + (Math.random() - 0.5) * 0.4), 0), 100000) 
    : Math.random() * 100000;

  //Save new values for next iteration.
  previousTemperature = temperature;
  previousHumidity = humidity;
  previousLight = light;

  const motion = Math.random() >= 0.5;

  //Create a new document.
  return {
    id,
    name,
    devicenum: deviceNumber,
    address,
    temperature,
    humidity,
    light,
    motion,
    time: now,
  };
}

//Security Middleware: IP Whitelisting (only allow localhost access).
app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (clientIP === '::1' || clientIP === '127.0.0.1') {
      next(); 
    } else {
      res.status(403).json({ error: 'Access forbidden: Only localhost is allowed' });
    }
  });
  
//Security: Rate Limiting (limit requests to 10 per hour per IP).
const limiter = rateLimit({
windowMs: 60 * 60 * 1000,
max: 10, 
message: 'Too many requests from this IP, please try again after an hour',
});

app.use(limiter);

//Post function to upload data through the server.
app.post('/temperature', async function (req, res) {
  const { devicenum } = req.body; 

  if (!devicenum) {
    return res.status(400).json({ error: 'Device number is required' });
  }

  const newSensorData = generateRandomData(devicenum);
  const savedData = await SensorData.create(newSensorData);
  latestSensorData = savedData;

  console.log("Saved Sensor Data to Database:", savedData);

  //Save the document.
  res.json({
    message: 'Sensor data created successfully',
    data: savedData,
  });
});

//Get the latest saved data.
app.get('/', (req, res) => {
    res.send(latestSensorData);
});

//Get the latest uploaded data.
app.get('/temperature/latest', async function (req, res) {
  if (!latestSensorData) {
    return res.status(404).json({ error: 'No sensor data available yet' });
  }
  res.json(latestSensorData);
});

//Update the latest data
app.put('/temperature/latest', async function (req, res) {
  if (!latestSensorData) {
    return res.status(404).json({ error: 'No sensor data available to update' });
  }

  try {
    const updatedData = await SensorData.findByIdAndUpdate(
      latestSensorData._id,
      { temperature: req.body.temperature, humidity: req.body.humidity, light: req.body.light, motion: req.body.motion, time: new Date() },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({ error: 'No data found with this ID' });
    }
    latestSensorData = updatedData; 
    res.json(updatedData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

//Delete the latest data.
app.delete('/temperature/latest', async function (req, res) {
  if (!latestSensorData) {
    return res.status(404).json({ error: 'No sensor data available to delete' });
  }

  const deletedData = await SensorData.findByIdAndDelete(latestSensorData._id);
  if (!deletedData) {
    return res.status(404).json({ error: 'No data found with this ID' });
  }
  latestSensorData = null; 
  res.json({ message: 'Sensor data deleted successfully', deletedData });
});

//Running the server.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
