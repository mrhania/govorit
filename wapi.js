const WAPI_PAGE_SIZE = 10;
const WAPI_PAGE_COUNT = 100;

function wapiAudioPath(word) {
    return 'https://en.wikipedia.org/wiki/Special:Redirect/file/Ru-' + word + '.ogg';
}

function wapiRequestData(prefix) {
    return {
        action: 'query',
        list: 'prefixsearch',
        pslimit: WAPI_PAGE_SIZE,
        psoffset: WAPI_PAGE_SIZE * Math.floor(Math.random() * WAPI_PAGE_COUNT),
        pssearch: 'File:Ru-' + prefix,
        format: 'json',
    };
}

function wapiParseResponse(response, resolve) {
    let results = response.query.prefixsearch;
    let words = results.map(function (entry) {
        let filepath = entry.title;
        let match = filepath.match(/File\:Ru\-([\u0430-\u044f]+)\.ogg/);
        if (match !== null) {
            return match[1];
        } else {
            return null;
        }
    }).filter(function (word) {
        return word !== null && word.length >= 3;
    });
    resolve(words);
}

function wapiFetchWithPrefix(prefix) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php',
            dataType: 'jsonp',
            jsonp: 'callback',
            data: wapiRequestData(prefix),
            success: function (response) {
                wapiParseResponse(response, resolve);
            },
            error: reject,
        });
    });
}

function wapiFetch() {
    // Generate list of fetch promises for each cyrillic letter.
    let prefixFetches = [];
    for (let i = '\u0430'.charCodeAt(0); i <= '\u044f'.charCodeAt(0); i++) {
        prefixFetches.push(wapiFetchWithPrefix(String.fromCharCode(i)));
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
