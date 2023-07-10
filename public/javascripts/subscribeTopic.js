const btnSubscribe = document.getElementById('btnSubscribeTopic');
const btnUnsubscribe = document.getElementById('btnUnsubscribeTopic');

async function subscribe(topicName) {
    console.log(`Subcribe to ${topicName}`);
    await fetch(`/t/${topicName}/subscribe`, {method: 'POST'})
        .then(response => {
            if (response.ok) {
                response.json().then(body => {
                    console.log(body);
                    if (body.subscribed) {
                        console.log(`Subscribe success`);
                        btnSubscribe.hidden = true;
                        btnUnsubscribe.hidden = false;
                    }
                });
            }
            else {
                throw new Error(`Subscribe request failed`);
            }
        });
}

async function unsubscribe(topicName) {
    console.log(`Unsubcribe to ${topicName}`);
    await fetch(`/t/${topicName}/unsubscribe`, {method: 'POST'})
        .then(response => {
            if (response.ok) {
                response.json().then(body => {
                    console.log(body);
                    if (!body.subscribed) {
                        console.log(`Unsubscribe success`);
                        btnUnsubscribe.hidden = true;
                        btnSubscribe.hidden = false;
                    }
                });
            }
            else {
                throw new Error(`Unsubscribe request failed`);
            }
        });
}
