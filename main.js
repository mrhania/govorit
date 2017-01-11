let queue = [];

let nextWord = function () {
    if (queue.length === 0) {
        wapiFetch().then(function (words) {
            queue.push(...words);
            nextWord();
        });
        return;
    }

    let word = queue.shift();
    if (queue.length < 10) {
        wapiFetch().then(function (words) {
            queue.push(...words);
        });
    }

    $('#preview').html(word);
    $('#enlarger').textfill({ maxFontPixels: -1 });
    $('#playback').attr('src', wapiAudioPath(word));
}

$('body').on('click', function () {
    $('#playback')[0].play();
});

$('#playback').on('ended', function () {
    nextWord();
});

nextWord();
