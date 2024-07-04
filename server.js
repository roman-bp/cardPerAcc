const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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
    photo: String,
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    notes: { type: String, default: '' }
});
const Person = mongoose.model('Person', personSchema);

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads')); // Путь к папке uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Маршрут для загрузки фотографий
app.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        const { name, age, address, phone, email, notes } = req.body;
        const photoPath = req.file.path;
        
        // Используем path.sep для корректной замены слэшей в пути
        const newPerson = await Person.create({
            name,
            age,
            photo: photoPath.replace(/\//g, path.sep), // Заменяем слэши на соответствующие для ОС
            address,
            phone,
            email,
            notes
        });
        res.status(201).json(newPerson);
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Маршрут для получения всех людей
app.get('/people', async (req, res) => {
    try {
        const people = await Person.find();
        res.json(people);
    } catch (error) {
        console.error('Error fetching people:', error);
        res.status(500).json({ error: 'Failed to fetch people' });
    }
});

// Маршрут для получения данных о конкретном человеке
app.get('/persons/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        if (!person) {
            res.status(404).json({ error: 'Person not found' });
            return;
        }
        res.json(person);
    } catch (error) {
        console.error('Error fetching person details:', error);
        res.status(500).json({ error: 'Failed to fetch person details' });
    }
});

// Маршрут для обновления данных о человеке
app.put('/persons/:id', upload.single('photo'), async (req, res) => {
    try {
        let updateFields = {
            name: req.body.name,
            age: req.body.age,
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email,
            notes: req.body.notes
        };

        if (req.file) {
            // Используем path.sep для корректной замены слэшей в пути
            updateFields.photo = req.file.path.replace(/\//g, path.sep);
        }

        const updatedPerson = await Person.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        if (!updatedPerson) {
            res.status(404).json({ error: 'Person not found' });
            return;
        }
        res.json(updatedPerson);
    } catch (error) {
        console.error('Error updating person details:', error);
        res.status(500).json({ error: 'Failed to update person details' });
    }
});

// Обработка ошибки 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
