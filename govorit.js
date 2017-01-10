function filterMap(array, pred, callback) {
    let result = [];
    let aux = function (i) {
        if (i === array.length) {
            callback(result);
        } else {
            pred(array[i], function (trans) {
                if (trans !== null) {
                    result.push(trans);
                }
                aux(i + 1);
            });
        }
    };
    aux(0);
}

function fetchSamplesWithPrefix(prefix) {
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
                let samples = response.query.prefixsearch.map(function (entry) {
                    let filepath = entry.title;
                    let match = filepath.match(/File\:Ru\-(.*)\.ogg/);
                    if (match !== null) {
                        let word = match[1];
                        return { word, filepath };
                    } else {
                        return null;
                    }
                }).filter(function (entry) {
                    if (entry === null) {
                        return false;
                    }

                    return entry.word.match(/^[\u0430-\u044f]+$/i);
                });
                resolve(samples);
            },
            error: reject
        });
    });
}

function fetchSamples() {
    let prefixFetches = [];
    for (let i = '\u0430'.charCodeAt(0); i <= '\u044f'.charCodeAt(0); i++) {
        prefixFetches.push(fetchSamplesWithPrefix(String.fromCharCode(i)));
    }
    return Promise.all(prefixFetches).then(function (results) {
        return [].concat.apply([], results); // JavaScript-ish flatten.
    });
}

let queue = [];
function nextSample() {
    if (queue.length === 0) {
        fetchSamples().then(function (samples) {
            queue.push(...samples);
            nextSample();
        });
        return;
    }

    let sample = queue.shift();
    if (queue.length < 10) {
        fetchSamples().then(function (samples) {
            queue.push(...samples);
        });
    }

    /*
     * This makes sure this callback is fired only once. Because for some weird
     * reason it is called even when span is not actually clicked and causes
     * the whole program logic to break. No idea why.
     */
    let fired = { value: false };
    $('#word').html(sample.word).on('click', function () {
        if (!fired.value) {
            fired.value = true;
            nextSample();
        }
    });
}

nextSample();
