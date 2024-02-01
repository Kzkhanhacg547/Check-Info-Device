const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const app = express();
const port = process.env.PORT || 1080;

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));

const imageFolder = path.join(__dirname, 'images');
app.use(express.static('public'));

// Variable to store the current image filename
let currentImage = null;

app.post('/capture', (req, res) => {
  const imageData = req.body.imageData;
  const fileName = `image_${Date.now()}.png`;
  const filePath = path.join(imageFolder, fileName);

  try {
    fs.writeFileSync(filePath, imageData, 'base64');
    console.log('Image saved successfully:', fileName);

    // Update the currentImage variable with the new filename
    currentImage = fileName;

    res.json({ success: true, fileName });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ success: false, error: 'Error saving image' });
  }
});

// Set up a route to dynamically handle the current image
app.get('/checkcam', (req, res) => {
  if (currentImage) {
    const imagePath = path.join(__dirname, 'images', currentImage);
    res.sendFile(imagePath);
  } else {
    res.status(404).send('No current image available');
  }
});

app.use(express.static(path.join(__dirname, 'modules')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Set up a watcher for changes in the "images" directory
const watcher = chokidar.watch('./images', { persistent: true });

// Respond to 'add' events (new files)
watcher.on('add', (path) => {
  console.log(`File ${path} has been added`);

  // Extract the filename from the path
  const filename = path.split('/').pop();

  // Update the currentImage variable with the new filename
  currentImage = filename;

  // Log the API link
  console.log(`API Link: /checkcam`);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
