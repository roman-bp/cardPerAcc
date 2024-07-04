const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5500;

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/peopleDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Middleware для разбора тела запроса
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware для обработки файлов с помощью Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware для обслуживания статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Роуты для работы с данными

// Модель Person для MongoDB
const Person = mongoose.model('Person', {
    name: String,
    age: Number,
    photo: String // Поле для хранения относительного пути к изображению
});

// Роут для получения всех персон
app.get('/persons', async (req, res) => {
    try {
        const people = await Person.find();
        res.json(people);
    } catch (error) {
        console.error('Error fetching people:', error);
        res.status(500).json({ error: 'Failed to fetch people' });
    }
});

// Роут для обновления данных о персоне с сохранением относительного пути к изображению
app.put('/persons/:id', upload.single('photo'), async (req, res) => {
    try {
        // Получаем относительный путь к загруженному изображению
        const photoPath = req.file.path.replace(/\\/g, '/').replace('uploads/', ''); // Заменяем обратные слеши на прямые и убираем "uploads/"

        // Обновляем данные о персоне в базе данных
        const updatedPerson = await Person.findByIdAndUpdate(req.params.id, { photo: photoPath }, { new: true });

        // Отправляем обновленные данные обратно клиенту
        res.json(updatedPerson);
    } catch (error) {
        console.error('Error updating person:', error);
        res.status(500).json({ error: 'Failed to update person' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
