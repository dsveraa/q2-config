const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Manejar la solicitud GET para descargar el archivo
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si el archivo no existe, devolver un error 404
      res.status(404).send('File not found');
    } else {
      // Si el archivo existe, enviar el archivo para descargar
      res.download(filePath, filename, (err) => {
        if (err) {
          // Manejar errores durante la descarga
          console.error('Error downloading file:', err);
          res.status(500).send('Error downloading file');
        }
      });
    }
  });
});

app.post('/files', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully');
});

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});
