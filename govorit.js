function audioFilepath(word) {
    return 'https://en.wikipedia.org/wiki/Special:Redirect/file/Ru-' + word + '.ogg';
}

function fetchWordsWithPrefix(prefix) {
    let jsonpId = '__wcmb' + Date.now() + '__';
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php',
            jsonpCallback: jsonpId,
            dataType: 'jsonp',
            data: {
                action: 'query',
                list: 'prefixsearch',
                pslimit: 10,
                psoffset: 10 * Math.floor(Math.random() * 100),
                pssearch: 'File:Ru-' + prefix,
                format: 'json',
                callback: jsonpId,
            },
            success: function (response) {
                let words = response.query.prefixsearch.map(function (entry) {
                    let filepath = entry.title;
                    let match = filepath.match(/File\:Ru\-([\u0430-\u044f]+)\.ogg/);
                    if (match !== null) {
                        return match[1];
                    } else {
                        return null;
                    }
                }).filter(function (word) {
                    return word !== null;
                });
                resolve(words);
            },
            error: reject
        });
    });
}

function fetchWords() {
    let prefixFetches = [];
    for (let i = '\u0430'.charCodeAt(0); i <= '\u044f'.charCodeAt(0); i++) {
        prefixFetches.push(fetchWordsWithPrefix(String.fromCharCode(i)));
    }
    return Promise.all(prefixFetches).then(function (results) {
        let flat = [].concat.apply([], results); // JavaScript-ish flatten.
        // Shuffle the resulting array.
        for (let i = flat.length; i > 0; i--) {
            let j = Math.floor(Math.random() * i);
            [flat[i - 1], flat[j]] = [flat[j], flat[i - 1]];
        }
        return flat;
    });
}

let queue = [];
let nextWord = function () {
    if (queue.length === 0) {
        fetchWords().then(function (words) {
            queue.push(...words);
            nextWord();
        });
        return;
    }

    let word = queue.shift();
    if (queue.length < 10) {
        fetchWord().then(function (words) {
            queue.push(...words);
        });
    }

    /*
     * This makes sure this callback is fired only once. Because for some weird
     * reason it is called even when span is not actually clicked and causes
     * the whole program logic to break. No idea why.
     */
    let fired = { value: false };
    $('#preview').html(word);
    $('#playback').attr('src', audioFilepath(word));
}

$('#preview').on('click', function () {
    $('#playback')[0].play();
});

$('#playback').on('ended', function () {
    nextWord();
});

nextWord();
