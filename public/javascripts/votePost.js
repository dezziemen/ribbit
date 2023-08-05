const btnUpvote = document.getElementById('btnUpvote');
const btnDownvote = document.getElementById('btnDownvote');

async function upvote(post) {
    await fetch(`/t/${ topicName }/${ post }/upvote`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                response.json().then(body => {
                    if (body.direction === 'up') {
                        console.log(`Upvoted ${ post }`);
                        btnUpvote.classList.toggle('selected');
                    }
                    else {
                        console.log(`Upvote removed ${ post }`);
                    }
                });
            }
            else {
                throw new Error(`Upvote request failed`);
            }
        });
}

async function downvote(post) {
    await fetch(`/t/${ topicName }/${ post }/downvote`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                response.json().then(body => {
                    if (body.direction === 'down') {
                        console.log(`Downvoted ${ post }`);
                    }
                    else {
                        console.log(`Downvote removed ${ post }`);
                    }
                });
            }
            else {
                throw new Error(`Downvote request failed`);
            }
        });
}
