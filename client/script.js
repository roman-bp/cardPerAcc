document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:5500/people');
        if (!response.ok) {
            throw new Error('Failed to fetch persons');
        }
        const persons = await response.json();
        persons.forEach(person => createCard(person));
    } catch (error) {
        console.error('Error fetching persons:', error);
        alert('Failed to fetch persons. Please try again.');
    }
});

function createCard(person) {
    const cardsContainer = document.getElementById('cards-container');
    const card = document.createElement('div');
    card.classList.add('card');

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.innerHTML = `<img src="/uploads/${person.photo}" alt="${person.name}">`;

    const details = document.createElement('div');
    details.classList.add('details');
    details.innerHTML = `
        <h3>${person.name}</h3>
        <p>Age: ${person.age}</p>
    `;

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editPerson(person._id));

    card.appendChild(avatar);
    card.appendChild(details);
    card.appendChild(editButton);

    cardsContainer.appendChild(card);
}

async function editPerson(id) {
    try {
        const response = await fetch(`http://localhost:5500/persons/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch person details');
        }
        const person = await response.json();

        const modal = createModal(person, true); // Pass true to indicate edit mode
        document.body.appendChild(modal);

        modal.querySelector('.close-button').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        const editForm = modal.querySelector('#edit-person-form');
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(editForm);

            try {
                const updateResponse = await fetch(`http://localhost:5500/persons/${id}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        // Указываем Content-Type для FormData
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update person data');
                }

                const updatedPerson = await updateResponse.json();
                console.log('Updated person:', updatedPerson);

                // Обновляем данные в модальном окне
                modal.querySelector('#person-name').textContent = updatedPerson.name;
                modal.querySelector('#person-age').textContent = `Age: ${updatedPerson.age}`;
                modal.querySelector('#person-address').textContent = `Address: ${updatedPerson.address || '-'}`;
                modal.querySelector('#person-phone').textContent = `Phone: ${updatedPerson.phone || '-'}`;
                modal.querySelector('#person-email').textContent = `Email: ${updatedPerson.email || '-'}`;
                modal.querySelector('#person-notes').textContent = `Notes: ${updatedPerson.notes || '-'}`;

                // Проверяем наличие новой фотографии и обновляем путь
                if (updatedPerson.photo) {
                    modal.querySelector('img').src = `/uploads/${updatedPerson.photo}`;
                    modal.querySelector('img').alt = updatedPerson.name;
                }

                // Закрываем модальное окно после успешного обновления
                document.body.removeChild(modal);

            } catch (error) {
                console.error('Error updating person data:', error);
                alert('Failed to update person data. Please try again.');
            }
        });

    } catch (error) {
        console.error('Error fetching person details:', error);
        alert('Failed to fetch person details. Please try again.');
    }
}

function createModal(person, isEditMode) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalContent = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>${isEditMode ? 'Edit' : 'Add'} Person</h2>
            <form id="edit-person-form">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" value="${person.name}" required><br><br>

                <label for="age">Age:</label>
                <input type="number" id="age" name="age" value="${person.age}" required><br><br>

                <label for="address">Address:</label>
                <input type="text" id="address" name="address" value="${person.address || ''}"><br><br>

                <label for="phone">Phone:</label>
                <input type="tel" id="phone" name="phone" value="${person.phone || ''}"><br><br>

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="${person.email || ''}"><br><br>

                <label for="notes">Notes:</label><br>
                <textarea id="notes" name="notes">${person.notes || ''}</textarea><br><br>

                <button type="submit">${isEditMode ? 'Update' : 'Save'}</button>
            </form>
        </div>
    `;

    modal.innerHTML = modalContent;
    return modal;
}
