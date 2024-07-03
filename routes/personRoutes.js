const express = require('express');
const router = express.Router();
const Person = require('../models/Person');

// Get all people
router.get('/', async (req, res) => {
    try {
        const people = await Person.find();
        res.json(people);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new person
router.post('/', async (req, res) => {
    const person = new Person({
        name: req.body.name,
        age: req.body.age,
        photo: req.body.photo
    });

    try {
        const newPerson = await person.save();
        res.status(201).json(newPerson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
