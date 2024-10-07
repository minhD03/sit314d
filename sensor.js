const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://minhdang:S87zHL9N414D2Zl9@taskd.qpg3v.mongodb.net/?retryWrites=true&w=majority&appName=TaskD');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');

  //Define my data structure.
  const sensorSchema = new mongoose.Schema({
    id: Number,
    name: String,
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

  function generateRandomData() {
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
    const newSensorData = new SensorData({
      id,
      name,
      address,
      temperature,
      humidity,
      light,
      motion,
      time: now,
    });

    //Save the document.
    newSensorData.save()
      .then(() => {
        console.log('Data saved:', newSensorData);
      })
      .catch((err) => {
        console.error('Error saving data:', err);
      });
  }

  //Send data every second.
  let count = 0;
  const intervalId = setInterval(() => {
    if (count >= 1) {
      clearInterval(intervalId);
      mongoose.connection.close()
        .then(() => {
          console.log('Data generation complete and connection closed.');
        })
        .catch((err) => {
          console.error('Error closing the connection:', err);
        });
      return;
    }

    generateRandomData();
    count++;
  }, 1000);
});
