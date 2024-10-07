const apiUrl = 'http://localhost:3000/temperature';

//Create data for server.
async function createSensorData(deviceNumber) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ devicenum: deviceNumber }),
    });
    const data = await response.json();
    console.log('Create Sensor Data:', data);
  
}

//Retreive the latest data.
async function getLatestSensorData() {
    const response = await fetch(`${apiUrl}/latest`);
    if (!response.ok) {
        throw new Error('Error fetching latest sensor data');
    }
    const data = await response.json();
    console.log('Latest Sensor Data:', data);

}

//Update the latest data.
async function updateLatestSensorData(temperature, humidity, light, motion) {
    const response = await fetch(`${apiUrl}/latest`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ temperature, humidity, light, motion }),
    });
    const data = await response.json();
    console.log('Update Sensor Data:', data);
  
}

//Delete the latest data.
async function deleteLatestSensorData() {
    const response = await fetch(`${apiUrl}/latest`, {
      method: 'DELETE',
    });
    const data = await response.json();
    console.log('Delete Sensor Data:', data);
}

//Test functions.

// (async () => {
//     const deviceNumber = 'Device1'; 
  
//     await createSensorData(deviceNumber); 
//     await getLatestSensorData();          
//     await updateLatestSensorData(25, 60, 500, true); 
//     await deleteLatestSensorData();       
// })();

setInterval(async () => {
  const deviceNumber = 'Device1'; 

  await createSensorData(deviceNumber);        
}, 1000);
