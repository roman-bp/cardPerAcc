document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:5500/persons');
        if (!response.ok) {
            throw new Error('Failed to fetch persons data');
        }
        const persons = await response.json();
        persons.forEach(person => createCard(person));
    } catch (error) {
        console.error('Error:', error);
    }
});

function createCard(person) {
    const cardsContainer = document.getElementById('cards-container');
    const card = document.createElement('div');
    card.classList.add('card');
    
    card.innerHTML = `
        <img src="${person.photo}" alt="${person.name}">
        <h3>${person.name}</h3>
        <p>Age: ${person.age}</p>
    `;

    cardsContainer.appendChild(card);
}
