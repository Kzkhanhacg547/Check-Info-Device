const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 80;

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));

const imageFolder = path.join(__dirname, 'images');
const checkCamFolder = path.join(__dirname, 'checkcam');

// Tạo thư mục images nếu chưa tồn tại
if (!fs.existsSync(imageFolder)) {
  fs.mkdirSync(imageFolder);
}

// Tạo thư mục checkcam nếu chưa tồn tại
if (!fs.existsSync(checkCamFolder)) {
  fs.mkdirSync(checkCamFolder);
}

app.use(express.static('public'));

app.post('/capture', (req, res) => {
  const imageData = req.body.imageData;
  const fileName = `image_${Date.now()}.png`;
  const filePath = path.join(imageFolder, fileName);

  try {
    fs.writeFileSync(filePath, imageData, 'base64');
    console.log('Image saved successfully:', fileName);
    res.json({ success: true, fileName });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ success: false, error: 'Error saving image' });
  }
});

app.use(express.static(path.join(__dirname, 'modules')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint để xem ảnh gần nhất trong thư mục images
app.get('/checkcam', (req, res) => {
  const files = fs.readdirSync(imageFolder);
  if (files.length > 0) {
    const latestImage = files.reduce((prev, current) => (fs.statSync(path.join(imageFolder, current)).ctime > fs.statSync(path.join(imageFolder, prev)).ctime) ? current : prev);
    res.sendFile(path.join(imageFolder, latestImage));
  } else {
    res.status(404).send('No images available');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
