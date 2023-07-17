async function upvote(post) {
    console.log(`Upvoted on ${ post }`);
    await fetch(`/t/${topicName}/${post}/upvote`, {method: 'POST'})
        .then(response => {
            if (response.ok) {
                console.log(`Upvote success`);
            }
            else {
                throw new Error(`Upvote request failed`);
            }
        });
}

function downvote(post) {
    console.log(`Downvoted on ${ post }`);
}
