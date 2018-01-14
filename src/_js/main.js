anime({
    targets: '.anim--in',
    scale: [3,1],
    opacity: [0,1],
    easing: "easeOutCirc",
    duration: 950,
});

anime({
    targets: '.anim--fade',
    opacity: [0,1],
    easing: "linear",
    duration: 1000,
});


//
// BACKGROUND COLORS PART
//
// Change background colors based on Lucio Fontana artworks
//
function* colorsGenerator() {
    const colors = [
        '#9D0013', '#14669E', '#CD3C10', '#747976',
        '#F79B1F', '#936C43', '#029557', '#619CF0'
    ];
    let idx = 1;

    while (true) {
        if (idx >= colors.length) {
            idx = 0;
        }

        yield colors[idx++];
    }
}

let getColors = colorsGenerator();

let changeBodyColor = function(evt) {
    if (evt.target.tagName === 'A' ||
        evt.target.parentNode.tagName === 'A') {
        return;
    }

    // Prevent GhostClick on Mobile devices
    evt.stopPropagation();
    evt.preventDefault();

    anime({
        targets: '#main',
        backgroundColor: function() {
            return getColors.next().value;
        },
        easing: "linear",
        duration: 1000,
    });

    return false;
}

const body = document.getElementById('main');
body.addEventListener('touchstart', changeBodyColor);
body.addEventListener('click', changeBodyColor);
