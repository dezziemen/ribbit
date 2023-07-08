const createTopicButton = document.getElementById('createTopicButton');
const modal = document.getElementById('createTopicModal');

createTopicButton.addEventListener('click', () => {
    modal.showModal();
});

modal.addEventListener('cancel', (event) => {});
