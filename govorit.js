function fetchWords(callback, accum) {
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
            if (accum === undefined) {
                accum = [];
            }

            let newWords = response.query.random
                .map((entry) => entry.title)
                .filter((word) => word.match(/^[\u0430-\u044f]+$/i))
                .filter((word) => word.length >= 3);

            let allWords = accum.concat(newWords);
            if (allWords.length < 10) {
                fetchWords(callback, allWords);
            } else {
                callback(allWords);
            }
        },
        // TODO: Add support for handling failures.
    });
}

fetchWords(function (words) {
    console.log(words);
});
