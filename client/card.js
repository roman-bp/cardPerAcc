function createCard(person) {
    const cardsContainer = document.getElementById('cards-container');
    const card = document.createElement('div');
    card.classList.add('card');
    
    card.innerHTML = `
        <img src="${person.photo}" alt="${person.name}">
        <h3>${person.name}</h3>
        <p>Age: ${person.age}</p>
        <button onclick="showDetails('${person._id}')">Show Details</button>
        <button onclick="editPerson('${person._id}')">Edit</button>
    `;

    cardsContainer.appendChild(card);
}

async function showDetails(id) {
    try {
        const response = await fetch(`http://localhost:5500/persons/${id}`);
        const person = await response.json();

        const modal = createModal(person);
        document.body.appendChild(modal);

        modal.querySelector('.close-button').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    } catch (error) {
        console.error('Error fetching person details:', error);
    }
}

async function editPerson(id) {
    try {
        const response = await fetch(`http://localhost:5500/persons/${id}`);
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
                    body: formData
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update person data');
                }

                const updatedPerson = await updateResponse.json();
                console.log('Updated person:', updatedPerson);

                // Update the modal content with updated information
                modal.querySelector('#person-name').textContent = updatedPerson.name;
                modal.querySelector('#person-age').textContent = `Age: ${updatedPerson.age}`;
                modal.querySelector('#person-address').textContent = `Address: ${updatedPerson.address || '-'}`;
                modal.querySelector('#person-phone').textContent = `Phone: ${updatedPerson.phone || '-'}`;
                modal.querySelector('#person-email').textContent = `Email: ${updatedPerson.email || '-'}`;
                modal.querySelector('#person-notes').textContent = `Notes: ${updatedPerson.notes || '-'}`;

            } catch (error) {
                console.error('Error updating person data:', error);
            }
        });

    } catch (error) {
        console.error('Error fetching person details:', error);
    }
}

function createModal(person, isEditMode = false) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2 id="person-name">${person.name}</h2>
            <p id="person-age">Age: ${person.age}</p>
            <p id="person-address">Address: ${person.address || '-'}</p>
            <p id="person-phone">Phone: ${person.phone || '-'}</p>
            <p id="person-email">Email: ${person.email || '-'}</p>
            <p id="person-notes">Notes: ${person.notes || '-'}</p>
            ${isEditMode ? createEditForm(person) : ''}
        </div>
    `;

    return modal;
}

function createEditForm(person) {
    return `
        <form id="edit-person-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="${person.name}" required><br><br>

            <label for="age">Age:</label>
            <input type="number" id="age" name="age" value="${person.age}" required><br><br>

            <label for="address">Address:</label>
            <input type="text" id="address" name="address" value="${person.address || ''}"><br><br>

            <label for="phone">Phone:</label>
            <input type="text" id="phone" name="phone" value="${person.phone || ''}"><br><br>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${person.email || ''}"><br><br>

            <label for="notes">Notes:</label>
            <textarea id="notes" name="notes">${person.notes || ''}</textarea><br><br>

            <button type="submit">Save Changes</button>
        </form>
    `;
}
