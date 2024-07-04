document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-person-form');
    const formContainer = document.getElementById('form-container');
    const showFormBtn = document.createElement('button');
    showFormBtn.textContent = 'Add Person';
    showFormBtn.id = 'show-form-btn';
    document.body.insertBefore(showFormBtn, formContainer);

    showFormBtn.addEventListener('click', () => {
        formContainer.classList.toggle('hidden');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch('http://localhost:5500/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload photo and save person data');
            }

            const data = await response.json();
            console.log('New person added:', data);

            // Create and append the new card
            createCard(data);

            // Reset form after successful submission
            form.reset();
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
