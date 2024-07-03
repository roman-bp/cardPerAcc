const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); // Добавляем пакет для CORS

const app = express();
const PORT = process.env.PORT || 5500;

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/people', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Модель для хранения данных о людях
const personSchema = new mongoose.Schema({
    name: String,
    age: Number,
    photo: String
});
const Person = mongoose.model('Person', personSchema);

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware для CORS
app.use(cors());

// Маршрут для загрузки фотографий
app.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        const { name, age } = req.body;
        const photoPath = '/uploads/' + req.file.filename;

        const newPerson = new Person({
            name: name,
            age: age,
            photo: photoPath
        });
        const savedPerson = await newPerson.save();

        res.status(201).json(savedPerson);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to upload photo and save person data' });
    }
});

// Маршрут для получения всех персон
app.get('/persons', async (req, res) => {
    try {
        const persons = await Person.find();
        res.status(200).json(persons);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to fetch persons data' });
    }
});

// Статический файловый сервер для доступа к загруженным фотографиям
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
