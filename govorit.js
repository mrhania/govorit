// TODO: This should be wrapped in a function.
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
        // TODO: Extract only interesting stuff.
        console.log(response);
    },
});
