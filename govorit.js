function fetchWords(queue) {
    $.ajax({
        url: 'https://ru.wiktionary.org/w/api.php',
        jsonpCallback: '__wmcb__',
        dataType: 'jsonp',
        data: {
            action: 'query',
            list: 'random',
            rnlimit: '10',

            format: 'json',
            callback: '__wmcb__',
        },
        success: function (response) {
            let words = response.query.random
                .map((entry) => entry.title)
                .filter((word) => word.match(/^[\u0430-\u044f]+$/i))
                .filter((word) => word.length >= 3);
            queue.push(...words);
            if (queue.length < 10) {
                fetchWords(queue);
            }
        },
        // TODO: Add support for handling failures.
    });
}

let queue = [];
fetchWords(queue);
