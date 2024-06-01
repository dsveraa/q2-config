const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

app.use(express.json()); // Middleware para analizar JSON en el cuerpo de las solicitudes

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

// Función para leer el contenido del archivo .cfg
function readCfgFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Función para escribir el contenido al archivo .cfg
function writeCfgFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Subir el archivo
app.post('/files', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const fileContent = await readCfgFile(filePath);
    res.send({ filename: req.file.filename, content: fileContent });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Error reading file');
  }
});

// Guardar el archivo con las modificaciones
app.post('/save', async (req, res) => {
  try {
    const { filename, content } = req.body;
    const filePath = path.join(__dirname, 'uploads', filename);
    await writeCfgFile(filePath, content); // Escribir el contenido en el archivo
    res.send('File saved successfully');
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).send('Error saving file');
  }
});

// Descargar el archivo
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

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});
