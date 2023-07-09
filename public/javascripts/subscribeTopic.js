function subscribe(topicName) {
    fetch(`/t/${ topicName }/subscribe`, { method: 'POST' })
        .then(function(response) {
            if (response.ok) {
                console.log(`Subbed 2!`);
                return;
            }
            throw new Error('Subscribe request failed');
        })
        .catch(function(error) {
            console.error(error);
        });
}

function unsubscribe() {
    console.log(`Unsubbed 2!`);
}
