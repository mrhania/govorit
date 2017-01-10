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

function fetchWords(callback, accum) {
    let jsonpId = '__wcmb' + Date.now() + '__';
    $.ajax({
        url: 'https://ru.wiktionary.org/w/api.php',
        jsonpCallback: jsonpId,
        dataType: 'jsonp',
        data: {
            action: 'query',
            list: 'random',
            rnlimit: '10',

            format: 'json',
            callback: jsonpId,
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

let queue = [];
function nextWord() {
    if (queue.length === 0) {
        fetchWords(function (words) {
            queue.push(...words);
            nextWord();
        });
        return;
    }

    let word = queue.shift();
    if (queue.length < 5) {
        fetchWords(function (words) {
            queue.push(...words);
        });
    }

    /*
     * This makes sure this callback is fired only once. Because for some weird
     * reason it is called even when span is not actually clicked and causes
     * the whole program logic to break. No idea why.
     */
    let fired = { value: false };
    $('#word').html(word).on('click', function () {
        if (!fired.value) {
            fired.value = true;
            nextWord();
        }
    });
}

nextWord();
