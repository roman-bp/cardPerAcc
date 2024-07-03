// card.js

// Функция для добавления карточки
function createCard(person) {
    const cardContainer = document.getElementById('cards-container');
    const card = document.createElement('div');
    card.classList.add('card');
    
    card.innerHTML = `
        <img src="${person.photo}" alt="${person.name}">
        <h3>${person.name}</h3>
        <p>Age: ${person.age}</p>
    `;

    cardContainer.appendChild(card);
}
