//varible
const audioList = [
    new Audio("audio/kuruto.mp3"),
    new Audio("audio/kuru1.mp3"),
    new Audio("audio/kuru2.mp3"),
];

for (const audio of audioList) {
    audio.preload = "auto";
}

let firstSquish = true;
//end varible

const getTimePassed = () => Date.parse(new Date());

const counterTimes = document.getElementById("counter-times");
const globalCounter = document.querySelector('#global-counter');
const localCounter = document.querySelector('#local-counter');
let globalCount = 0;
let localCount = localStorage.getItem('count-v2') || 0;
// stores counts from clicks until 5 seconds have passed without a click
let heldCount = 0;

function getGlobalCount() {
    fetch('https://kuru-kuru-count-api.onrender.com/sync', { method: 'GET'})
        .then((response) => response.json())
        .then((data) => {
            globalCount = data.count;
            globalCounter.textContent = data.count.toLocaleString();
        })
        .catch((err) => console.error(err));
}
// initialize counters
localCounter.textContent = localCount.toLocaleString();
getGlobalCount();

let prevTime = Number.MAX_SAFE_INTEGER; // prevent focus event on load
// update global count every 10 seconds when tab is visible
setInterval(() => {
    if (document.hasFocus() && getTimePassed() - prevTime > 10000) {
        getGlobalCount();
        prevTime = getTimePassed();
    }
}, 10000);

function update(e, resetCount=true) {
    // update global count
    const data = {
        count: heldCount,
        e: e // check if request is triggered by event
    };

    fetch('https://kuru-kuru-count-api.onrender.com/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(() => {
            // update local count
            localStorage.setItem('count-v2', localCount);
            if (resetCount) heldCount = 0;
        })
        .catch((err) => console.error(err));
}

let timer;
//counter button
const counterButton = document.querySelector('#counter-button');
counterButton.addEventListener('click', (e) => {
    prevTime = getTimePassed();

    heldCount++;
    localCount++;
    globalCount++;

    if (heldCount === 10) {
        // update on 10 counts
        update(e, false);
        heldCount -= 10;
    } else {
        // update 5 seconds after last click
        clearTimeout(timer);
        timer = setTimeout(() => update(e), 5000);
    }

    localCounter.textContent = localCount.toLocaleString();
    globalCounter.textContent = globalCount.toLocaleString();

    counterTimes.textContent = parseInt(counterTimes.textContent) === 1
        ? 'time'
        : 'times';

    playKuru();
    animateHerta();
});

function playKuru() {
    let audio;

    if (firstSquish) {
        firstSquish = false;
        audio = audioList[0].cloneNode();
    } else {
        const random = Math.floor(Math.random() * 2) + 1;
        audio = audioList[random].cloneNode();
    }

    audio.play();

    audio.addEventListener("ended", function () {
        this.remove();
    });
}

function animateHerta() {
    let id = null;

    const random = Math.floor(Math.random() * 2) + 1;
    const elem = document.createElement("img");
    elem.src = `img/hertaa${random}.gif`;
    elem.style.position = "absolute";
    elem.style.right = "-500px";
    elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 430 + "px"
    elem.style.zIndex = "-1";
    document.body.appendChild(elem);

    let pos = -500;
    const limit = window.innerWidth + 500;
    clearInterval(id);
    id = setInterval(() => {
        if (pos >= limit) {
            clearInterval(id);
            elem.remove()
        } else {
            pos += 20;
            elem.style.right = pos + 'px';
        }
    }, 12);
}
//end counter button