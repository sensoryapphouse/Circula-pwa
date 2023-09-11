// Settings:
//      Speed
//      Switch down or up
//      Mute

var speed = 5;
var splash;
var panel;
var panelvisible = false;
var settings;
var s1;
var s2;
var mute;
var activateOnSwitchDown = false;

window.onload = function () {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
    panel = document.querySelector('panel');
    settings = document.querySelector('settings');
    splash = document.querySelector('splash');
    setUpPanel();

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    start();
}

function setPosition(i) {
    if (inMenu)
        btnRunGame();
    if (!gameIsRunning)
        return;
    _player.mouse_angle += i;
    if (_player.mouse_angle > 240)
        _player.mouse_angle = -90;
    if (_player.mouse_angle < -90)
        _player.mouse_angle = 240;
    _player.position = (_player.mouse_angle + 90) / 30;
}

function leftSwitchDown() {
    if (s2.checked)
        setPosition(30);
}

function leftSwitchUp() {
    if (s1.checked)
        setPosition(30);
}

function rightSwitchDown() {

    if (s2.checked)
        setPosition(-30);
}

function rightSwitchUp() {
    if (s1.checked)
        setPosition(-30);
}

window.addEventListener('keydown', e => {
    if (e.repeat)
        return;
    if (!gameIsRunning)
        return;
    switch (e.keyCode) {
        case 32:
        case 49:
        case 37:
            leftSwitchDown();
            break;
        case 50:
        case 39:
            rightSwitchDown();
            break;
        case 51:
        case 13:
            rightSwitchDown();
            break;
        case 52:
            rightSwitchDown();
            break;
        case 27:
            reset_game();
            break;
    }
});

window.addEventListener('keyup', e => {
    switch (e.keyCode) {
        case 32:
        case 49:
        case 37:
            leftSwitchUp();
            break;
        case 50:
        case 39:
            rightSwitchUp();
            break;
        case 51:
        case 13:
            rightSwitchUp();
            break;
        case 52:
            rightSwitchUp();
            break;
        case 27:
            reset_game();
            break;
    }
});

// sound
var swish;
var loselife;
var pop;
var firstTime = true;

function PlaySound(s) {
    if (mute.checked)
        return;
    try {
        switch (s) {
            case 'swish':
                swish.play();
                break
            case 'loselife':
                loselife.play();
                break;
            case 'pop':
                pop.play();
                break;
        }
    } catch (e) {};
}

function InitSounds() {
    if (firstTime) {
        swish = new Audio('sounds/swish.mp3');
        swish.volume = 0;
        swish.play();
        loselife = new Audio('sounds/loselife.mp3');
        loselife.volume = 0;
        loselife.play();

        pop = new Audio('sounds/pop.mp3');
        pop.volume = 0;
        pop.play();

        setTimeout(function () {
            loselife.pause();
            pop.pause();
            swish.pause();
            swish.volume = 1;
            loselife.volume = 1;
            pop.volume = 1
        }, 50);

        firsttime = false;
    }
}


function setUpPanel() {
    panel.style.left = "130vw";
    slideTo(panel, 130);
    mute = document.createElement("INPUT");
    mute.style.position = "absolute";
    mute.style.height = "3vh";
    mute.style.width = "3vw";
    mute.style.left = "17vw";
    mute.style.top = "4vh";
    mute.checked = false;
    mute.setAttribute("type", "checkbox");
    mute.checked = false;
    speedsld = document.createElement("INPUT");
    speedsld.setAttribute("type", "range");
    speedsld.style.position = "absolute";
    speedsld.style.height = "2vh";
    speedsld.style.width = "15vw";
    speedsld.style.left = "4.3vw";
    speedsld.style.top = "13vh";
    speedsld.style.color = 'green';
    speedsld.value = 3;
    speedsld.min = 1;
    speedsld.max = 5;

    s1 = document.createElement("INPUT");
    s1.style.position = "absolute";
    s1.style.height = "3vh";
    s1.style.width = "3vw";
    s1.style.left = "14vw";
    s1.style.top = "22.5vh";
    s2 = document.createElement("INPUT");
    s2.style.position = "absolute";
    s2.style.height = "3vh";
    s2.style.width = "3vw";
    s2.style.left = "6.5vw";
    s2.style.top = "22.5vh";
    s1.setAttribute("type", "radio");
    s2.setAttribute("type", "radio");

    s2.checked = true;

    function switchOption(i) {
        switch (i) {
            case 1:
                s1.checked = true;
                s2.checked = false;
                localStorage.setItem("Circula.onUp", 1);
                break;
            case 2:
                s2.checked = true;
                s1.checked = false;
                localStorage.setItem("Circula.onUp", 0);
                break;
        }
    }

    s1.onclick = function (e) {
        switchOption(1);
    }
    s2.onclick = function (e) {
        switchOption(2);
    }

    panel.appendChild(mute);
    panel.appendChild(speedsld);
    panel.appendChild(s1);
    panel.appendChild(s2);

    settings.style.left = "92vw";
    // Retrieve settings
    var s = localStorage.getItem("Circula.mute");
    mute.checked = (s == "true");
    s = parseInt(localStorage.getItem("Circula.speed"));
    if (s < 1 || s > 5)
        s = 3;
    speedsld.value = s.toString();
    speed = 6 - speedsld.value;
    s = localStorage.getItem("Circula.onUp");
    if (s == 1)
        switchOption(1);
    else
        switchOption(2);

    mute.onclick = function (e) {
        localStorage.setItem("Circula.mute", mute.checked);
    }
    speedsld.onclick = function (e) {
        speed = 6 - speedsld.value;
    }

    panel.onmousedown = function (e) { // speed, paddle size, ball size
        e.stopPropagation();
    }

    settings.onmousedown = function (e) { // speed, paddle size, ball size
        e.stopPropagation();
        if (panelvisible) { // save stored values
            slideTo(panel, 130);
            slideTo(settings, 92);
        } else {
            slideTo(panel, 75);
            slideTo(settings, 78);
        }
        panelvisible = !panelvisible;
    }

    function slideTo(el, left) {
        var steps = 5;
        var timer = 50;
        var elLeft = parseInt(el.style.left) || 0;
        var diff = left - elLeft;
        var stepSize = diff / steps;
        console.log(stepSize, ", ", steps);

        function step() {
            elLeft += stepSize;
            el.style.left = elLeft + "vw";
            if (--steps) {
                setTimeout(step, timer);
            }
        }
        step();
    }
}


var waves = 0;

var _sw = 0;
var _sh = 0;
var _sx = 0;
var _sy = 0;
var _sz = 0;
var _ss = 1;

var canvas = false;
var context = false;

var runGameCountDefine = 3000; // PB was 4000
var runGameCount = 0;
var gameIsRunning = false;
var inMenu = true;

// Containers
var missiles = [];
var op_missiles = [];
var opponent = [];
var particles = [];

// Prepare data
var cosA = [],
    sinA = [];
for (var i = 0; i <= 720; i++) {
    var _a = degToRad(-360 + i);
    cosA[i] = Math.cos(_a);
    sinA[i] = Math.sin(_a);
}

// Functions
function degToRad(angle) {
    return angle * (Math.PI / 180);
}

function radToDeg(angle) {
    return angle * (180 / Math.PI);
}

function gCosA(angle) {
    return angle >= 0 ? cosA[angle + 360] : cosA[360 + angle];
}

function gSinA(angle) {
    return angle >= 0 ? sinA[angle + 360] : sinA[360 + angle];
}

function rnd(x) {
    return Math.random() * x;
}

Array.prototype.remove = function (index) {
    this.splice(index, 1);
};

// Classes
function P3(x, y, z) {

    this.x = x;
    this.y = y;
    this.z = z;

    this.rotateX = function (angle) {
        var y = this.y * gCosA(angle) - this.z * gSinA(angle);
        var z = this.y * gSinA(angle) + this.z * gCosA(angle);
        return new P3(this.x, y, z);
    };

    this.rotateY = function (angle) {
        var z = this.z * gCosA(angle) - this.x * gSinA(angle);
        var x = this.z * gSinA(angle) + this.x * gCosA(angle);
        return new P3(x, this.y, z);
    };

    this.rotateZ = function (angle) {
        var x = this.x * gCosA(angle) - this.y * gSinA(angle);
        var y = this.x * gSinA(angle) + this.y * gCosA(angle);
        return new P3(x, y, this.z);
    };

    this.project = function (viewWidth, viewHeight, fov, viewDistance) {
        var factor = fov / (viewDistance + this.z);
        var x = this.x * factor + viewWidth / 2;
        var y = this.y * factor + viewHeight / 2;
        return new P3(x, y, this.z);
    }
}

function Message() {

    this.time = 0;
    this.str = "";

    this.update = function (time) {

        if (this.time <= 0) {
            this.time = 0;
        }

        if (this.time > 0) {
            this.time -= time;

            context.beginPath();
            if (waves < 9)
                context.fillStyle = 'rgba(255,255,255,.3)';
            else
                context.fillStyle = 'rgba(255,0,0,1)';
            context.font = "bold " + Math.round(48 * _ss) + "px Helvetica";
            context.textAlign = 'center';
            context.fillText(this.str.toString(), _sx, _sy);
            context.closePath();
        }
    };

    this.text = function (str, time) {
        this.time = time;
        this.str = str;
    }
}

function FPS() {

    this.fps = 0;
    this.now = 0;
    this.lastUpdate = new Date - 1;
    this.fpsFilter = 50;
    this.lastStep = 0;
    this.now = new Date;

    this.draw = function () {
        //document.getElementById('fps').innerHTML = 'fps: ' + this.fps.toFixed(1) + " step: " + this.lastStep.toFixed(1);
    };

    this.update = function () {

        this.now = new Date;
        var tmp = 1000 / (this.now - this.lastUpdate);
        this.fps += (tmp - this.fps) / this.fpsFilter;
        this.lastStep = (this.now - this.lastUpdate) / speed; // PB to slow down everything
        this.lastUpdate = this.now;
    }
}

function Missile(position, depth, speed, color) {

    this.position = position;
    this.depth = depth;
    this.color = color;
    this.speed = speed;

    this.update = function (time) {

        var lg_rad = (_sh / 2);
        var angle = this.position * 2 * Math.PI / _player.available_moves;

        var ca_rad = Math.cos(angle) * lg_rad;
        var sa_rad = Math.sin(angle) * lg_rad;

        var sx = _sx + ca_rad * this.depth;
        var sy = _sy + sa_rad * this.depth;

        var ex = _sx + ca_rad * (this.depth + (0.2 * this.depth * _ss));
        var ey = _sy + sa_rad * (this.depth + (0.2 * this.depth * _ss));

        context.beginPath();
        context.moveTo(sx, sy);
        context.lineTo(ex, ey);

        context.lineWidth = (20 * this.depth) * _ss;
        context.strokeStyle = this.color;
        context.stroke();

        context.closePath();

        this.depth -= ((this.speed / (1000 / 60)) * time) * this.depth;
    }
}

function Particle() {
    this.x;
    this.y;
    this.size;
    this.color;
    this.scale;
    this.velocityX;
    this.velocityY;
}

function Explosion(x, y, color) {
    this.items = [];
    this.time = 1000;

    for (var angle = 0; angle < 360; angle += 60) {
        var particle = new Particle();

        particle.x = x;
        particle.y = y;
        particle.size = 3 + rnd(12);
        particle.color = color;
        particle.scale = 1.0;

        var speed = 20 + rnd(80);

        particle.velocityX = speed * gCosA(angle);
        particle.velocityY = speed * gSinA(angle);

        this.items.push(particle);
    }

    this.update = function (time) {
        this.time -= time;

        for (var i = 0; i < this.items.length; i++) {
            this.items[i].scale -= time / 1000;

            if (this.items[i].scale <= 0) {
                this.items[i].scale = 0;
            }

            this.items[i].x += this.items[i].velocityX * time / 1000;
            this.items[i].y += this.items[i].velocityY * time / 1000;

            context.beginPath();
            context.rect(this.items[i].x, this.items[i].y, this.items[i].size * this.items[i].scale, this.items[i].size * this.items[i].scale);
            context.fillStyle = this.items[i].color;
            context.fill();
            context.closePath();
        }
    }
}

function Stars() {

    this.count = 128;
    this.items = new Array(this.count);
    this.ratio = 128;
    this.startSpeedDefine = 12;
    this.speed = 1;

    this.resize = function () {

        for (var i = 0; i < this.count; i++) {
            this.items[i] = [];
            this.items[i][0] = rnd(_sw) * 2 - _sx * 2;
            this.items[i][1] = rnd(_sh) * 2 - _sy * 2;
            this.items[i][2] = Math.round(rnd(_sz)) * 2;
            this.items[i][3] = 0;
            this.items[i][4] = 0;

            this.items[i][5] = true;

            this.items[i][6] = 0;
            this.items[i][7] = 0;

            if (Math.sqrt(Math.pow((this.items[i][0]), 2) + Math.pow((this.items[i][1]), 2)) < _sh / 2) {
                i--;
            }
        }
    };

    this.draw = function () {

        context.strokeStyle = 'rgba(255,255,255,.2)';

        var lg_rad = (_sh / 2) * 2.4;
        var angle = 360 / _player.available_moves;
        for (var j = 0; j < _player.available_moves; j++) {
            var qx = _sx + gCosA(j * angle) * lg_rad;
            var qy = _sy + gSinA(j * angle) * lg_rad;

            context.beginPath();
            context.moveTo(_sx, _sy);
            context.lineTo(qx, qy);
            context.lineWidth = 0.3;
            context.stroke();
            context.closePath();
        }

        context.strokeStyle = 'rgb(255,255,255)';

        for (var i = 0; i < this.count; i++) {
            if (this.items[i][5] &&
                this.items[i][7] < _sh &&
                this.items[i][7] > 0 &&
                this.items[i][6] < _sw &&
                this.items[i][6] > 0) {
                context.beginPath();
                context.moveTo(this.items[i][6], this.items[i][7]);
                context.lineTo(this.items[i][3], this.items[i][4]);
                context.lineWidth = 0.2 * _sz / this.items[i][2];
                context.stroke();
                context.closePath();
            }
        }
    };

    this.update = function (time) {
        for (var i = 0; i < this.count; i++) {
            this.items[i][5] = true;

            this.items[i][6] = this.items[i][3];
            this.items[i][7] = this.items[i][4];

            var st_speed = (this.speed / (1000 / 60)) * time;

            this.items[i][2] -= this.speed;

            if (this.items[i][2] > _sz) {
                this.items[i][2] -= _sz;
                this.items[i][5] = false;
            }

            if (this.items[i][2] < 0) {
                this.items[i][2] += _sz;
                this.items[i][5] = false;
            }

            this.items[i][3] = _sx + (this.items[i][0] / this.items[i][2]) * this.ratio;
            this.items[i][4] = _sy + (this.items[i][1] / this.items[i][2]) * this.ratio;
        }

        this.draw();
    }
}

function Obj() {
    this.vertices = [];
    this.faces = [];
    this.colors = [];

    this.t = [];
    this.avg_z = [];

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.rx = 0;
    this.ry = 0;
    this.rz = 0;

    this.fov = 800;
    this.distance = 6;

    this.isHit = false;
    this.hitTimeDefine = 1;
    this.hitTime = 0;
    this.hitColor = 'rgb(0,255,0)';

    this.color = false;

    this.offset = 0;
    this.currentOffset = 0;
    this.offsetLimit = 0;

    this.removed = false;

    this.hit = function () {
        if (this.currentOffset == this.offsetLimit ||
            this.currentOffset / this.offsetLimit >= 0.5) {
            this.isHit = true;
            this.hitTimeDefine = 100;
            this.hitTime = 0;

            return true;
        }
        return false;
    };

    this.read = function (_p, _v, _f, _c) {
        var i;
        // vertex
        for (i = 0; i < _v.length; i += 3) {
            this.vertices.push(new P3((parseInt(_p[_v[i]], 36) / 1000000), (parseInt(_p[_v[i + 1]], 36) / 1000000), (parseInt(_p[_v[i + 2]], 36) / 1000000)));
        }
        // face
        for (i = 0; i < _f.length; i += 3) {
            this.faces.push(new Array(parseInt(_f[i], 36), parseInt(_f[i + 1], 36), parseInt(_f[i + 2], 36)));
        }
        // colors
        for (i = 0; i < _c.length; i++) {
            this.colors.push('#' + _c[i]);
        }
    };

    this.gen = function () {
        this.t = [];
        this.avg_z = [];
        var i;
        for (i = 0; i < this.vertices.length; i++) {
            var v = this.vertices[i];
            var r = v.rotateX(this.rx).rotateY(this.ry).rotateZ(this.rz);
            var p = r.project(0, 0, this.fov, this.distance / _ss);
            this.t.push(p)
        }
        for (i = 0; i < this.faces.length; i++) {
            var f = this.faces[i];
            this.avg_z[i] = {
                "index": i,
                "sort": (this.t[f[0]].z + this.t[f[1]].z + this.t[f[2]].z) / 3,
                "color": this.colors[i]
            };
        }
        this.avg_z.sort(function (a, b) {
            return b.sort - a.sort;
        });
    };

    this.move = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };

    this.rotate = function (x, y, z) {
        var gen = false;
        if (this.rx != x || this.ry != y || this.rz != z) {
            gen = true;
        }
        this.rx = x;
        this.ry = y;
        this.rz = z;
        if (gen) {
            this.gen();
        }
    };

    this.draw = function () {
        for (var i = 0; i < this.faces.length; i++) {
            var f = this.faces[this.avg_z[i].index];
            context.beginPath();
            context.fillStyle = this.isHit ? this.hitColor : this.color ? this.color : this.avg_z[i].color;
            context.moveTo(this.t[f[0]].x + this.x, this.t[f[0]].y + this.y);
            context.lineTo(this.t[f[1]].x + this.x, this.t[f[1]].y + this.y);
            context.lineTo(this.t[f[2]].x + this.x, this.t[f[2]].y + this.y);
            context.fill();
            context.closePath();
        }
    }
}

function Background() {
    this.backgroundData = false;
    this.resize = function () {
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0, 0, _sw, _sh);
        context.globalAlpha = 0.3;
        var grd = context.createRadialGradient(_sh / 4, _sh / 4, 50, _sh / 4, _sh / 4, 300);
        grd.addColorStop(0, '#900');
        grd.addColorStop(1, '#000');
        context.fillStyle = grd;
        context.beginPath();
        context.arc(_sh / 4, _sh / 4, 300, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
        context.globalAlpha = 0.6;
        var grd2 = context.createRadialGradient(_sh / 2 + 100, _sh / 2 + 100, 10, _sh / 2 + 100, _sh / 2 + 100, 600);
        grd2.addColorStop(0, '#009');
        grd2.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = grd2;
        context.beginPath();
        context.arc(_sh / 2 + 100, _sh / 2 + 100, 600, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
        context.globalAlpha = 0.2;
        var grd2 = context.createRadialGradient(_sh, _sh, 10, _sh, _sh, 600);
        grd2.addColorStop(0, 'red');
        grd2.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = grd2;
        context.beginPath();
        context.arc(_sh, _sh, 600, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
        context.globalAlpha = 1.0;
        context.save();
        this.backgroundData = new Image();
        this.backgroundData.src = document.getElementById('c').toDataURL('image/png');
    };
    this.draw = function () {
        if (this.backgroundData.src != 'data:,') { // hack for old android browser
            context.drawImage(this.backgroundData, 0, 0);
        } else {
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, _sw, _sh);
        }
    }
}

function Logo() {
    Obj.call(this);
    this.load();
}
Logo.prototype = new Obj();
Logo.prototype.constructor = Logo;
Logo.prototype.load = function () {

    var _p = "-27pti 9ee5 qpn -216au 56g2 qpm -22ixw a40s -25cbe 1fxn -1yrx3 -10v5 -1wobz 4pvu -1yor9 46mn -1tq1v 5ow -1qjlz 3mom -1v5j7 9kbw -1vix4 65ib -1plm8 9oe5 uohy -10ixy ut74 -uz0z cvh2 d1v3 -12846 634b -17pl5 4cbf -1ejsr n6j -17bmx -vmp -zzhj v85 -1bhnj 57ua -1dltq 7mxu -1ju3x cvbu -1ints 55us -1ea6y d05t -w0s4 5ifv -oyz8 -8ni -jkv1 l2d5 uxbh -5gka 9mye -jp8x -5c6o -2g3 4w2x ezwh an1c ewhs 919u r2x1 6olb 76th bynw 1cqn jua1 4b5r daxc 73jz jus5 -s1r rgm3 15ka wx0w 6uty qfk7 74iu ytip faho rypi l8jn t3mi fd78 x0fy nlzt rp0j tedc jy47 qdxp opc4 p1t7 jtqb vhg5 dfjs nsb3 10z22 17ikq 165xp 13ck6 19wyh 1c0jl 1a04b 1eytp 1i59k 1djcd 1d5yg 1j39c 1n6ds asao 1p614 49ru 1wheo 57u7 1tv6n 78nt 1sirl b947 1trwh glf 20uwv -rr6 24acw 50k0 20obl 4enu 26wix gjd 2b4lj 3zq4 274l6 8l0o 26gmg 6kjq 2cmax 8wh2 2b8y8 dl5v 246so bzqc 26hxs ah8y 273yo gv0h 20g0t is5d 1t5w6 fawp 1z1gk dei5 1uwwo kraa 1u2eo mouj 1py06 r4c8 1oj4t mgsd 1pp7w ibne 1vc41 p54v 1zxhe qapx 25x7m ub35 1zs0j vfha 1u0dv ucvy 24i7r p0xy 26mqo kmm3 2a4wl qwpb 2byv8 l12o".split(" ");
    var _v = "0 1 2 3 4 5 6 7 2 8 9 5 10 11 5 12 13 5 14 15 5 16 17 5 18 19 5 20 21 2 22 23 5 24 25 2 24 26 2 20 26 2 27 28 2 29 30 2 29 28 2 27 31 2 32 33 5 34 35 5 36 37 5 38 39 5 40 41 5 42 43 5 44 45 5 46 47 2 48 49 5 50 51 2 50 28 2 46 28 2 52 53 5 54 55 5 56 57 2 54 58 2 56 55 5 59 60 2 61 58 2 62 55 5 63 55 5 63 58 2 59 58 2 64 65 2 66 67 2 68 69 2 70 71 5 72 73 5 74 75 5 76 77 5 78 79 5 80 81 5 82 83 5 84 85 5 86 87 2 88 89 2 90 91 2 92 93 2 94 95 2 96 97 2 98 99 2 100 101 2 102 103 2 104 1 2 105 4 5 106 7 2 107 9 5 108 11 5 109 13 5 110 15 5 111 17 5 112 19 5 113 21 2 114 23 5 115 25 2 115 26 2 113 26 2 116 117 2 118 119 5 120 121 5 122 123 5 124 125 2 126 127 5 128 129 5 130 131 5 132 133 5 134 135 5 136 137 5 138 139 2 140 141 5 142 143 2 144 145 2 146 147 2 148 149 2 150 151 2 152 153 2 154 155 2 156 157 2 158 159 2 160 161 2 162 163 2 164 165 2 166 167 2 168 169 2 170 171 2 172 173 2 174 175 2 176 177 2 178 179 2 180 181 2 182 183 2 184 185 2".split(" ");
    var _f = "0 1 2 1 0 3 4 5 6 4 1 3 7 5 4 8 9 a 8 5 7 b 9 8 c 9 b d 9 c a 5 8 6 1 4 e f g h f e i f h j k l j m i n k j o p q o k n r p o s p r t p s q k o l m j m u i u f i v w x y w v w z 10 11 z w 12 z 11 13 z 12 14 z 13 10 x w 15 16 17 18 16 15 19 1a 1b 19 1b 18 1c 1a 19 1d 1a 1c 1e 1f 1d 1g 1h 1i 1g 1f 1e 1j 1h 1g 1k 1l 1m 1k 1h 1j 1n 1l 1k 17 16 1o 17 1l 1n 1o 1l 17 1m 1h 1k 1i 1f 1g 1f 1a 1d 1b 16 18 1p 1q 1r 1s 1q 1p 1t 1u 1v 1t 1q 1s 1w 1u 1t 1x 1y 1z 1x 1u 1w 20 1y 1x 21 1y 20 22 1y 21 1z 1u 1x 1v 1q 1t 24 25 26 24 27 23 28 25 24 29 2a 2b 29 25 28 2c 2a 29 2d 2e 2f 2d 2a 2c 2g 2e 2d 2h 2i 2j 2h 2e 2g 2k 2i 2h 2l 2m 2n 2l 2i 2k 2o 2m 2l 2p 2q 2r 2p 2s 2o 2t 2q 2p 2u 2v 2w 2u 2x 2t 2y 2v 2u 2z 30 2y 31 30 2z 30 2v 2y 2w 2x 2u 2x 2q 2t 2r 2s 2p 2s 2m 2o 2n 2i 2l 2j 2e 2h 2f 2a 2d 2b 25 29 26 27 24".split(" ");
    var _c = "a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e a1a68e".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function Player() {

    Obj.call(this);
    this.load();

    this.life = 1.0;
    this.score = 0;

    this.angle = 0;
    this.fireCount = 1;
    this.fireFrequency = 660; // PB was 600

    this.fireTime = 0.0;

    this.available_moves = 12;
    this.position = -1;
    this.depth = 0.8;

    this.offset_angle = 0;
    this.mouse_angle = 0;

    this.hit = function () {
        this.isHit = true;
        this.hitTime = 0;
        this.hitTimeDefine = _fps.lastStep * 10;
        this.hitColor = 'rgb(255,0,0)';

        this.life -= 0.1;

        if (this.life < .1) { // PB for testing
            opponent = [];
            missiles = [];
            op_missiles = [];
            waves = 9;

            generate_waves();
        }
    };

    this.reset = function () {
        this.life = 1.0;
        this.angle = 0;
        this.fireCount = 1;
        this.fireFrequency = 1.0;
        this.fireTime = 0.0;
        this.position = -1;
        this.depth = 0.7;
        this.score = 0;
    };

    this.update = function (time) {
        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime > this.hitTimeDefine) {
                this.isHit = false;
            }
        }

        this.fireTime += time;
        if (this.fireTime > this.fireFrequency && missiles.length < this.fireCount) {
            this.fireTime = 0.0;
            missiles.push(new Missile(this.position, 0.9, 0.04, 'rgb(0,255,0)'));
        }

        var height = _sh > _sw ? _sw : _sh;

        var lg_rad = (height / 2) * 0.9;

        var angle = 0;
        var angle_deg = 0;

        if (this.offset_angle != 0) {
            if (this.offset_angle > 0) {
                this.offset_angle -= this.available_moves / 2;
            } else {
                this.offset_angle += this.available_moves / 2;
            }

            angle = (this.mouse_angle - this.offset_angle + 90);
            angle_deg = this.mouse_angle - this.offset_angle;
        } else {
            angle = (this.mouse_angle + 90);
            angle_deg = this.mouse_angle;
        }

        var qx = _sx + gCosA(angle) * lg_rad;
        var qy = _sy + gSinA(angle) * lg_rad;

        this.move(qx, qy, 0);
        this.rotate(155, 0, angle_deg);
        this.draw();

        context.globalCompositeOperation = this.isHit ? "source-over" : "lighter";

        for (var w = 0; w < 4; w++) {
            var r = 30 - (w * 4) - rnd(w * 5);

            var jx = rnd(w * 5) + _sx + gCosA(angle) * (lg_rad * (1.2 + 0.06 * w));
            var jy = rnd(w * 5) + _sy + gSinA(angle) * (lg_rad * (1.2 + 0.06 * w));

            var gradient = context.createRadialGradient(jx, jy, 0, jx, jy, r);
            gradient.addColorStop(0.0, "white");
            gradient.addColorStop(0.8, "yellow");
            gradient.addColorStop(1.0, "red");

            context.beginPath();
            context.fillStyle = this.isHit ? this.hitColor : gradient;
            context.arc(jx, jy, r, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();
        }

        context.globalCompositeOperation = "source-over";
    }
}
Player.prototype = new Obj();
Player.prototype.constructor = Player;
Player.prototype.load = function () {

    var _p = "0 -3cze vz2f byzb -373u -c3j -5kgw 6k38 -vmyv -byzb 6e7p o73 5kgw 10cxy -3jyv -s3i2 -107xi -1mc3 -zgll".split(" ");
    var _v = "0 1 2 0 1 2 3 4 5 6 7 8 9 4 5 0 10 11 0 1 2 12 7 8 13 14 15 16 14 15 6 7 8 0 17 18 6 7 8 0 1 2 0 1 2 0 1 2 12 7 8 12 7 8 6 7 8 12 7 8".split(" ");
    var _f = "0 1 2 5 7 a 7 2 8 8 b 7 7 5 2 5 0 2 a 7 b 3 4 5 4 6 5 4 3 9 9 b c".split(" ");
    var _c = "fffbfb fffbfb ff0000 ff0000 006cff 006cff 080808 00071f 00071f 470300 470300".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function Cube() {
    Obj.call(this);
    this.load();
}
Cube.prototype = new Obj();
Cube.prototype.constructor = Cube;
Cube.prototype.load = function () {

    var _p = "lfls -lfls -lflr lflr lflt".split(" ");
    var _v = "0 1 1 0 1 0 1 1 0 1 1 1 0 0 2 3 0 4 1 0 0 1 0 1".split(" ");
    var _f = "0 1 3 4 7 5 0 4 1 1 5 2 2 6 3 4 0 7 1 2 3 7 6 5 4 5 1 5 6 2 6 7 3 0 3 7".split(" ");
    var _c = "ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

// Class without model

function staticOpponent(position, depth) {

    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.angle = 0;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.removed = true;
            }

            time = 0;
        }

        this.time += time;

        var lg_rad = (_sh / 2) * this.depth;

        var angle = this.position * 2 * Math.PI / _player.available_moves;

        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 1;
        if (this.angle > 360) {
            this.angle = 0;
        }

        this.distance = 126 - (120 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(this.angle, 232, this.position * 360 / _player.available_moves - 90);
        this.draw();
    }
}
staticOpponent.prototype = new Cube();
staticOpponent.prototype.constructor = staticOpponent;

function movingOpponent(position, depth) {

    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.angle = 0;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.removed = true;
            }

            time = 0;
        }

        this.time += time;

        if (!this.removed) {
            if (this.time > 200) {
                this.position++;
                if (this.position >= _player.available_moves) {
                    this.position = 0;
                }
                this.offset = degToRad((360 / _player.available_moves) / 200);
                this.offsetLimit = degToRad(360 / _player.available_moves);
                this.currentOffset = 0;
                this.time = 0;
            }
        }

        var lg_rad = (_sh / 2) * this.depth;
        var angle = (this.position * 2 * Math.PI / _player.available_moves);

        if (this.offset != this.offsetLimit) {
            angle -= this.offsetLimit;
            angle += (this.offset * this.time);
            this.currentOffset = (this.offset * this.time);

            if ((this.offset * this.time) >= this.offsetLimit) {
                this.offset = this.offsetLimit;
                this.currentOffset = this.offsetLimit;
            }
        }

        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 1;
        if (this.angle > 360) {
            this.angle = 0;
        }

        var z = this.position * 360 / _player.available_moves - 90 + this.angle;
        if (z > 360) {
            z -= 360;
        }

        this.distance = 66 - (60 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(90, 0, z);
        this.draw();
    }
}
movingOpponent.prototype = new Obj();
movingOpponent.prototype.constructor = movingOpponent;
movingOpponent.prototype.load = function () {

    var _p = "-ik89 apsw 0 -9a45 -g2pc 9a45 ik8a g2pc lfls".split(" ");
    var _v = "0 1 2 3 1 4 5 1 4 6 1 2 5 1 7 2 8 2 3 1 7".split(" ");
    var _f = "0 5 1 2 5 3 4 5 6 1 5 2 3 5 4 6 5 0".split(" ");
    var _c = "ffffff ffffff ffffff ff0000 ff0000 ff0000".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function shooterOpponent(position, depth) {

    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.fireTime = 0;

    this.angle = 0;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.removed = true;
            }

            time = 0;
        }

        this.time += time;
        this.fireTime += time;

        if (!this.removed) {
            if (this.time > 600) {

                if (this.fireTime > 1200) {
                    op_missiles.push(new Missile(this.position, this.depth, -0.02, 'rgb(255,0,0)'));
                    this.fireTime = 0;
                }

                this.position++;
                if (this.position >= _player.available_moves) {
                    this.position = 0;
                }

                this.offset = degToRad((360 / _player.available_moves) / 600);
                this.offsetLimit = degToRad(360 / _player.available_moves);
                this.currentOffset = 0;

                this.time = 0;
            }
        }

        var lg_rad = (_sh / 2) * this.depth;
        var angle = this.position * 2 * Math.PI / _player.available_moves;

        if (this.offset != this.offsetLimit) {
            angle -= this.offsetLimit;
            angle += (this.offset * this.time);
            this.currentOffset = (this.offset * this.time);

            if ((this.offset * this.time) >= this.offsetLimit) {
                this.offset = this.offsetLimit;
                this.currentOffset = this.offsetLimit;
            }
        }

        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 1;
        if (this.angle >= 360) {
            this.angle = 0;
        }

        var z = (this.position * (360 / _player.available_moves)) - 90 - (360 / _player.available_moves) + this.angle + Math.round(radToDeg(this.currentOffset));
        if (z >= 360) {
            z -= 360;
        }

        this.distance = 286 - (280 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(0, 0, z);
        this.draw();
    }
}
shooterOpponent.prototype = new Cube();
shooterOpponent.prototype.constructor = shooterOpponent;
shooterOpponent.prototype.load = function () {

    var _p = "r3b4 0 -r3b4 -ql4x -2md 23 -2c6a9 -2me 1ll7f -1lnrp -3xrfl 1liiz 24 3y9c7 2co6v r31j".split(" ");
    var _v = "0 1 1 1 1 0 1 2 1 2 1 1 1 0 1 3 4 5 6 7 8 6 9 5 10 4 5 6 11 12 13 4 5 14 7 8 14 9 5 15 4 5 14 11 12".split(" ");
    var _f = "3 1 4 1 0 4 0 1 2 2 1 3 6 5 9 7 6 8 5 6 7 8 6 9 a b c d b e b a e c b d".split(" ");
    var _c = "ff0000 ff0000 ffffff ffffff ff0000 ff0000 ffffff ffffff ff0000 ff0000 ffffff ffffff".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function shieldOpponent(position, depth) {

    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.angle = 0;

    this.hitCount = 3;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.hitCount -= 1;
                if (this.hitCount == 0) {
                    this.removed = true;
                } else {
                    this.isHit = false;
                }
            }
        }

        this.time += time;

        var lg_rad = (_sh / 2) * this.depth;

        var angle = this.position * 2 * Math.PI / _player.available_moves;

        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 1;
        if (this.angle > 360) {
            this.angle = 0;
        }

        //        this.color = 'rgba(255,255,255,0.3)';
        this.distance = 66 - (60 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(this.angle, this.angle, this.position * 360 / _player.available_moves - 90);
        this.draw();
    }
}
shieldOpponent.prototype = new Cube();
shieldOpponent.prototype.constructor = shieldOpponent;
shieldOpponent.prototype.load = function () {

    var _p = "-ik89 apsw 0 -apsw ik89 -lfls lfls".split(" ");
    var _v = "0 1 2 0 3 2 2 1 0 2 3 0 4 1 2 4 3 2 2 5 2 2 1 4 2 3 4 2 6 2".split(" ");
    var _f = "1 0 3 5 4 8 0 9 2 6 1 3 4 9 7 6 5 8 0 2 3 4 7 8 3 2 5 2 9 4 6 3 5 8 7 1 6 8 1 7 9 0 2 4 5 7 0 1".split(" ");
    var _c = "336699 336699 336699 336699 336699 336699 336699 336699 ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function movingShieldOpponent(position, depth) {

    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.angle = 0;

    this.hitCount = 3;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.hitCount -= 1;
                if (this.hitCount == 0) {
                    this.removed = true;
                } else {
                    this.isHit = false;
                }
            }
        }

        if (!this.removed) {
            if (this.time > 600) {
                this.position++;
                if (this.position >= _player.available_moves) {
                    this.position = 0;
                }

                this.offset = degToRad((360 / _player.available_moves) / 600);
                this.offsetLimit = degToRad(360 / _player.available_moves);
                this.currentOffset = 0;

                this.time = 0;
            }
        }

        this.time += time;

        var lg_rad = (_sh / 2) * this.depth;
        var angle = this.position * 2 * Math.PI / _player.available_moves;

        if (this.offset != this.offsetLimit) {
            angle -= this.offsetLimit;
            angle += (this.offset * this.time);
            this.currentOffset = (this.offset * this.time);

            if ((this.offset * this.time) >= this.offsetLimit) {
                this.offset = this.offsetLimit;
                this.currentOffset = this.offsetLimit;
            }
        }

        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 1;
        if (this.angle > 360) {
            this.angle = 0;
        }

        //        this.color = 'rgba(255,255,255,0.3)';
        this.distance = 66 - (60 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(this.angle, 232, (this.position * (360 / _player.available_moves)) - 90 - (360 / _player.available_moves) + Math.round(radToDeg(this.currentOffset)));
        this.draw();
    }
}
movingShieldOpponent.prototype = new shieldOpponent();
movingShieldOpponent.prototype.constructor = movingShieldOpponent;

function spiralOpponent(position, depth) {
    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.fireTime = 0;

    this.depthWay = 0.01;
    this.angle = 0;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.removed = true;
            }

            time = 0;
        }

        this.time += time;
        this.fireTime += time;

        if (!this.removed) {
            if (this.time > 400) {
                this.depth += this.depthWay;
            }

            if ((this.depth >= 0.7 && this.depthWay > 0) ||
                (this.depth <= 0.1 && this.depthWay < 0)) {
                this.depthWay = -this.depthWay;
            }

            if (this.time > 400) {
                this.position++;
                if (this.position >= _player.available_moves) {
                    this.position = 0;
                }

                this.offset = degToRad((360 / _player.available_moves) / 400);
                this.offsetLimit = degToRad(360 / _player.available_moves);
                this.currentOffset = 0;

                this.time = 0;
            }
        }

        var lg_rad = (_sh / 2) * this.depth;
        var angle = this.position * 2 * Math.PI / _player.available_moves;

        if (this.offset != this.offsetLimit) {
            angle -= this.offsetLimit;
            angle += (this.offset * this.time);
            this.currentOffset = (this.offset * this.time);

            if ((this.offset * this.time) >= this.offsetLimit) {
                this.offset = this.offsetLimit;
                this.currentOffset = this.offsetLimit;

                if (this.fireTime >= 800) {
                    op_missiles.push(new Missile(this.position, this.depth, -0.02, 'rgb(255,0,0)'));
                    this.fireTime = 0;
                }
            }
        }

        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 12;
        if (this.angle > 360) {
            this.angle = 0;
        }

        var z = this.position * 360 / _player.available_moves - 90 + this.angle;
        if (z > 360) {
            z -= 360;
        }

        this.distance = 66 - (60 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(90, 0, z);
        this.draw();
    }
}
spiralOpponent.prototype = new Obj();
spiralOpponent.prototype.constructor = spiralOpponent;
spiralOpponent.prototype.load = function () {

    var _p = "-ik89 apsw 0 -9a45 -g2pc 9a45 ik8a g2pc lfls".split(" ");
    var _v = "0 1 2 3 1 4 5 1 4 6 1 2 5 1 7 2 8 2 3 1 7".split(" ");
    var _f = "0 5 1 2 5 3 4 5 6 1 5 2 3 5 4 6 5 0".split(" ");
    var _c = "ffffff ffffff ffffff ff0000 ff0000 ff0000".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function upOpponent(position, depth) {
    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.fireTime = 0;

    this.depthWay = 0.01;
    this.angle = 0;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.removed = true;
            }

            time = 0;
        }

        this.time += time;
        this.fireTime += time;

        if (!this.removed) {
            if (this.time > 50) {
                this.depth += this.depthWay;
                this.time = 0;

                if (this.depthWay > 0 && this.fireTime > 400) {
                    op_missiles.push(new Missile(this.position, this.depth, -0.04, 'rgb(255,0,0)'));
                    this.fireTime = 0;
                }
            }

            if ((this.depth >= 0.9 && this.depthWay > 0) ||
                (this.depth <= 0.1 && this.depthWay < 0)) {
                this.depthWay = -this.depthWay;
            }
        }

        var lg_rad = (_sh / 2) * this.depth;

        var angle = this.position * 2 * Math.PI / _player.available_moves;
        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 12;
        if (this.angle > 360) {
            this.angle = 0;
        }

        var z = this.position * 360 / _player.available_moves - 90 + this.angle;
        if (z > 360) {
            z -= 360;
        }

        this.distance = 66 - (60 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(90, 0, z);
        this.draw();
    }
}
upOpponent.prototype = new Cube();
upOpponent.prototype.constructor = upOpponent;
upOpponent.prototype.load = function () {

    var _p = "-ik89 apsw 0 -9a45 -g2pc 9a45 ik8a g2pc lfls".split(" ");
    var _v = "0 1 2 3 1 4 5 1 4 6 1 2 5 1 7 2 8 2 3 1 7".split(" ");
    var _f = "0 5 1 2 5 3 4 5 6 1 5 2 3 5 4 6 5 0".split(" ");
    var _c = "ffffff ffffff ffffff ff0000 ff0000 ff0000".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function upLowOpponent(position, depth) {
    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.fireTime = 0;

    this.depthWay = 0.01;
    this.angle = 0;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.removed = true;
            }

            time = 0;
        }

        this.time += time;
        this.fireTime += time;

        if (!this.removed) {
            if (this.time > 100) {
                this.depth += this.depthWay;
                this.time = 0;

                if (this.depthWay > 0 && this.fireTime > 1200) {
                    op_missiles.push(new Missile(this.position, this.depth, -0.04, 'rgb(255,0,0)'));
                    this.fireTime = 0;
                }
            }

            if ((this.depth >= 0.4 && this.depthWay > 0) ||
                (this.depth <= 0.1 && this.depthWay < 0)) {
                this.depthWay = -this.depthWay;
            }
        }

        var lg_rad = (_sh / 2) * this.depth;

        var angle = this.position * 2 * Math.PI / _player.available_moves;
        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 12;
        if (this.angle > 360) {
            this.angle = 0;
        }

        var z = this.position * 360 / _player.available_moves - 90 + this.angle;
        if (z > 360) {
            z -= 360;
        }

        this.distance = 66 - (60 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(90, 0, z);
        this.draw();
    }
}
upLowOpponent.prototype = new Cube();
upLowOpponent.prototype.constructor = upLowOpponent;
upLowOpponent.prototype.load = function () {

    var _p = "-ik89 apsw 0 -9a45 -g2pc 9a45 ik8a g2pc lfls".split(" ");
    var _v = "0 1 2 3 1 4 5 1 4 6 1 2 5 1 7 2 8 2 3 1 7".split(" ");
    var _f = "0 5 1 2 5 3 4 5 6 1 5 2 3 5 4 6 5 0".split(" ");
    var _c = "ffffff ffffff ffffff ff0000 ff0000 ff0000".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function BonusOpponent(position, depth) {
    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.fireTime = 0;

    this.depthWay = 0.02;
    this.angle = 0;

    this.update = function (time) {

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                if (this.hitTime >= this.hitTimeDefine) {
                    this.removed = true;
                }
            }

            time = 0;
        }

        this.time += time;
        this.fireTime += time;

        if (!this.removed) {
            if (this.time > 60) {
                this.depth += this.depthWay;
                this.time = 0;
            }

            if (this.depth >= 0.9) {
                this.removed = true;
            }
        }

        var lg_rad = (_sh / 2) * this.depth;

        var angle = this.position * 2 * Math.PI / _player.available_moves;
        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 12;
        if (this.angle > 360) {
            this.angle = 0;
        }

        var z = this.position * 360 / _player.available_moves - 90 + this.angle;
        if (z > 360) {
            z -= 360;
        }

        this.distance = 66 - (60 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(90, 0, z);
        this.draw();
    }
}
BonusOpponent.prototype = new upOpponent();
BonusOpponent.prototype.constructor = BonusOpponent;

function BossOpponent(position, depth) {

    Cube.call(this);
    this.position = position;
    this.depth = depth;

    this.time = 0;
    this.fireTime = 0;

    this.angle = 0;

    this.depthWay = 0.01;
    this.angle = 0;

    this.hitCount = 24;

    this.update = function (time) {

        this.time += time;
        this.fireTime += time;

        if (this.isHit) {
            this.hitTime += time;
            if (this.hitTime >= this.hitTimeDefine) {
                this.hitCount -= 1;
                if (this.hitCount == 0) {
                    this.removed = true;
                } else {
                    this.isHit = false;
                }
            }
        }

        if (!this.removed) {
            if (this.time > 400) {

                op_missiles.push(new Missile(this.position, this.depth, -0.01, 'rgb(255,0,0)'));

                this.fireTime = 0;

                this.position++;
                if (this.position >= _player.available_moves) {
                    this.position = 0;

                    if (!this.direction) {
                        this.direction = -_player.available_moves + Math.round(_player.available_moves);
                    } else {

                    }
                }

                this.offset = degToRad((360 / _player.available_moves) / 400);
                this.offsetLimit = degToRad(360 / _player.available_moves);
                this.currentOffset = 0;

                this.depth += this.depthWay;
                this.time = 0;
            }

            if ((this.depth >= 0.3 && this.depthWay > 0) ||
                (this.depth <= 0.1 && this.depthWay < 0)) {
                this.depthWay = -this.depthWay;
            }
        }

        var lg_rad = (_sh / 2) * this.depth;
        var angle = this.position * 2 * Math.PI / _player.available_moves;

        if (this.offset != this.offsetLimit) {
            angle -= this.offsetLimit;
            angle += (this.offset * this.time);
            this.currentOffset = (this.offset * this.time);

            if ((this.offset * this.time) >= this.offsetLimit) {
                this.offset = this.offsetLimit;
                this.currentOffset = this.offsetLimit;
            }
        }

        var qx = _sx + Math.cos(angle) * lg_rad;
        var qy = _sy + Math.sin(angle) * lg_rad;

        this.angle += 1;
        if (this.angle > 360) {
            this.angle = 0;
        }

        var z = 270 + (this.position * (360 / _player.available_moves)) - 90 - (360 / _player.available_moves) + Math.round(radToDeg(this.currentOffset));
        if (z > 360) {
            z -= 360;
        }

        this.distance = 166 - (160 * this.depth);
        this.move(qx, qy, 0);
        this.rotate(90, 130, z);
        this.draw();
    }
}
BossOpponent.prototype = new Cube();
BossOpponent.prototype.constructor = BossOpponent;
BossOpponent.prototype.load = function () {

    var _p = "-lfls lfls -62ts 62ts 1dkg0 1qy97 bgyo -bgyo -1dkg0 2j33f 3947 -3947".split(" ");
    var _v = "0 1 0 1 0 0 1 0 1 2 3 4 0 1 1 1 1 1 5 6 7 1 1 0 3 2 4 5 7 6 3 3 8 5 6 6 9 10 10 5 7 7 9 11 11 2 3 8 3 2 8 9 11 10 9 10 11 3 3 4".split(" ");
    var _f = "5 6 7 b 6 5 5 0 4 5 8 2 2 9 5 7 0 5 7 6 1 1 a 7 b 5 9 9 c b d 1 6 6 e d a 1 g c 9 h h e c e 6 i i c e 8 5 j 4 3 5 7 a 0 b c 6 f 0 a i 6 c j 5 3".split(" ");
    var _c = "0000ff 0000ff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ffffff ff0000 ff0000 ff0000 ff0000 ff0000 ff0000".split(" ");

    this.read(_p, _v, _f, _c);
    this.gen();
};

function PauseOpponent(time) {
    Cube.call(this);

    this.time = 0;
    this.pauseTime = time;

    this.update = function (time) {

        this.time += time;

        if (this.time > this.pauseTime) {
            this.removed = true;
        }
    }
}
PauseOpponent.prototype = new Cube();
PauseOpponent.prototype.constructor = PauseOpponent;

// initialize objects
var _player = new Player();
var _cube = new Cube();
var _background = new Background();
var _fps = new FPS();
var _stars = new Stars();
var _msg = new Message();

// game code
function reset_game() {

    _player.reset();
    waves = 0;

    opponent = [];
    missiles = [];
    op_missiles = [];

    runGameCountDefine = 3000; // PB was 4000
    runGameCount = 0;

    gameIsRunning = false;
    inMenu = true;
    splash.hidden = false;

    _stars.speed = 1;
}

var spd;

function generate_waves() { // PB levels - including end
    var w, i;
    spd = parseInt(speedsld.value);
    if (waves < 7)
        PlaySound('swish');
    switch (waves) {
        case 0: {
            _player.fireCount = 24;
            _player.fireFrequency = 100;

            w = -1;
            for (i = 0; i < 36; i++) {
                w++;
                opponent.push(new staticOpponent(w, 0.20 + (i * 0.01)));
                if (w == 11) w = -1;
            }

            break;
        }

        case 1: {
            _player.fireCount = 18;
            _player.fireFrequency = 150;

            w = -1;
            for (i = 0; i < 8; i++) {
                w++;
                opponent.push(new movingOpponent(w, 0.16 + (i * 0.02)));
                if (w == 11) w = -1;
            }

            break;
        }

        case 2: {
            _player.fireCount = 18;
            _player.fireFrequency = 100;

            opponent.push(new shooterOpponent(10, 0.2));
            opponent.push(new shooterOpponent(11, 0.2));

            opponent.push(new shooterOpponent(4, 0.2));
            opponent.push(new shooterOpponent(5, 0.2));

            break;
        }

        case 3: {
            _player.fireCount = 18;
            _player.fireFrequency = 200;

            opponent.push(new shooterOpponent(0, 0.2));
            opponent.push(new shooterOpponent(3, 0.2));
            opponent.push(new shooterOpponent(6, 0.2));
            opponent.push(new shooterOpponent(9, 0.2));

            w = -1;
            for (i = 0; i < 12; i++) {
                w++;
                opponent.push(new shieldOpponent(w, 0.3));
                if (w == 11) w = -1;
            }

            break;
        }

        case 4: {
            _player.fireCount = 18;
            _player.fireFrequency = 200;

            opponent.push(new upOpponent(0, 0.21));
            opponent.push(new upOpponent(3, 0.22));
            opponent.push(new upOpponent(6, 0.23));
            opponent.push(new upOpponent(9, 0.24));

            opponent.push(new shieldOpponent(0, 0.6));
            opponent.push(new shieldOpponent(3, 0.6));
            opponent.push(new shieldOpponent(6, 0.6));
            opponent.push(new shieldOpponent(9, 0.6));

            opponent.push(new shooterOpponent(0, 0.2));
            opponent.push(new shooterOpponent(4, 0.2));
            opponent.push(new shooterOpponent(8, 0.2));

            break;
        }

        case 5: {
            _player.fireCount = 18;
            _player.fireFrequency = 200;

            opponent.push(new spiralOpponent(1, 0.21));
            opponent.push(new spiralOpponent(4, 0.22));
            opponent.push(new spiralOpponent(7, 0.23));
            opponent.push(new spiralOpponent(10, 0.24));

            opponent.push(new shooterOpponent(0, 0.2));
            opponent.push(new shooterOpponent(3, 0.2));
            opponent.push(new shooterOpponent(6, 0.2));
            opponent.push(new shooterOpponent(9, 0.2));

            break;
        }

        case 6: {
            _player.fireCount = 18;
            _player.fireFrequency = 200;

            w = -1;
            for (i = 0; i < 12; i++) {
                w++;
                if (w % 2) {
                    opponent.push(new upLowOpponent(w, 0.1));
                } else {
                    opponent.push(new upLowOpponent(w, 0.38));
                }
                if (w == 11) w = -1;
            }

            w = -1;
            for (i = 0; i < 12; i++) {
                w++;
                opponent.push(new movingShieldOpponent(w, 0.5));
                if (w == 11) w = -1;
            }

            break;
        }

        case 7: {
            _player.fireCount = 18;
            _player.fireFrequency = 200;

            w = -1;
            var timer = 0;

            w = Math.round(rnd(11));
            for (i = 0; i < 23; i++) {
                w++;
                setTimeout("opponent.push(new BonusOpponent(" + w + ", 0.20))", timer);
                if (w == 11) w = -1;
                timer += 400;
            }

            w = Math.round(rnd(11));
            for (i = 0; i < 21; i++) {
                w--;
                setTimeout("opponent.push(new BonusOpponent(" + w + ", 0.20))", timer);
                if (w <= 0) w = 12;
                timer += 400;
            }

            w = Math.round(rnd(11));
            for (i = 0; i < 17; i++) {
                w++;
                setTimeout("opponent.push(new BonusOpponent(" + w + ", 0.20))", timer);
                if (w == 11) w = -1;
                timer += 350;
            }

            w = Math.round(rnd(11));
            for (i = 0; i < 31; i++) {
                w--;
                setTimeout("opponent.push(new BonusOpponent(" + w + ", 0.20))", timer);
                if (w <= 0) w = 12;
                timer += 300;
            }


            break;
        }

        case 8: {
            _player.fireCount = 18;
            _player.fireFrequency = 200;

            opponent.push(new BossOpponent(Math.round(rnd(11)), 0.1));

            w = -1;
            for (i = 0; i < 12; i++) {
                w++;
                opponent.push(new movingOpponent(w, 0.4));
                opponent.push(new shooterOpponent(w, 0.3));
                opponent.push(new shieldOpponent(w, 0.5));
                if (w == 11) w = -1;
            }

            break;
        }

        case 9: {
            _player.fireCount = 0;
            _player.fireFrequency = 10000;
            //            _msg.text("Thanks for playing", 3000);
            setTimeout("_msg.text(\"GAME OVER\"," + 800 * spd + ")", 100);
            opponent.push(new PauseOpponent(800 * spd));
            break;
        }

        case 10: {
            _player.fireCount = 0;
            _player.fireFrequency = 10000;
            gameIsRunning = false;
            setTimeout("reset_game()", 200);
            break;
        }
        default: {}
    }
    waves++;
}

function runGame(time) {
    if (runGameCount < runGameCountDefine * 0.75) {
        _msg.text(3 - Math.floor(runGameCount / runGameCountDefine * 4), 100);
    } else {
        _msg.text('1', 2); // PB was GO!!!, 300
    }
    runGameCount += time;
    if (runGameCount < runGameCountDefine) {
        _stars.speed = _stars.startSpeedDefine / (runGameCountDefine / runGameCount);
    } else {
        gameIsRunning = true;
        runGameCount = runGameCountDefine;
    }

    _background.draw();
    _stars.update(time);
    _player.update(time);
}

var logo = new Logo();
var logo_angle = 0;

function menu(time) { // PB front screen

    //        _background.draw();
    //_stars.update(time);
    //    logo_angle += 0.01;
    //     if (logo_angle > logo_angle) angle = 0;
    //     logo.move(_sx, _sy - _sh / 4, 0);
    //     logo.rotate(180, Math.round(Math.cos(logo_angle) * 360), 0);
    //     logo.distance = 14 * _ss;
    // 
    //     logo.draw();
    // 
    //     context.beginPath();
    //     context.fillStyle = 'rgba(255,255,255,.3)';
    //     context.font = "bold " + Math.round(48 * _ss) + "px Helvetica";
    //     context.textAlign = 'center';
    //     if ('ontouchstart' in document.documentElement) {
    //         //        context.fillText('Touch anywhere to play', _sx, _sy);
    //     } else {
    //         //        context.fillText('Click anywhere to play', _sx, _sy);
    //     }
    // 
    //     context.closePath();
}

var scoreTime = 0;

function anim() {

    _fps.update();
    var time = _fps.lastStep;

    if (inMenu) {
        menu(time);
        return;
    }

    if (runGameCount != runGameCountDefine) {
        runGame(time * speed); // PB * speed
        _msg.update(time);
        return;
    }

    if (gameIsRunning && _player.score && waves < 9) {
        scoreTime += time;
        if (scoreTime > 20) {
            _player.score -= Math.round(scoreTime / 20);
            scoreTime = 0;
        }
    }

    if (gameIsRunning && opponent.length == 0) {
        generate_waves();
    }

    if (gameIsRunning && _player.isHit) // hack background after hit player
    {
        context.beginPath();
        context.rect(0, 0, _sw, _sh);
        context.fillStyle = 'white';
        context.fill();
        context.closePath();

        _player.update(time);

        return;
    } else {
        _background.draw();
    }

    var i, o, m, om;

    // update particles (explosions)
    for (i = 0; i < particles.length; i++) {
        particles[i].update(time);
        if (particles[i].time < 0) {
            particles.remove(i);
        }
    }

    _stars.update(time);

    if (gameIsRunning) {

        // draw player missiles
        for (m = 0; m < missiles.length; m++) {
            missiles[m].update(time);
            if (missiles[m].depth < 0.1 || missiles[m].depth > 2.0) {
                missiles.remove(m);
            }
        }

        // draw opponent missiles
        for (om = 0; om < op_missiles.length; om++) {
            op_missiles[om].update(time);
            if (op_missiles[om].depth < 0.1 || op_missiles[om].depth > 2.0) {
                op_missiles.remove(om);
            }
        }

        // search opponents to remove and update objects
        for (i = 0; i < opponent.length; i++) {
            if (opponent[i].removed) {
                particles.push(new Explosion(opponent[i].x, opponent[i].y, "#f00"));
                particles.push(new Explosion(opponent[i].x, opponent[i].y, "#fff"));
                opponent.remove(i);
            } else {
                opponent[i].update(time);
            }
        }

        // PB
        if (waves < 9)
            _player.update(time);

        var count_depth;

        // detect collision between missiles and opponents
        for (m = 0; m < missiles.length; m++) {
            for (om = 0; om < opponent.length; om++) {
                if (!opponent[om].isHit) {
                    if (missiles[m].position == opponent[om].position) {
                        count_depth = (missiles[m].depth - opponent[om].depth) * 100;
                        if (count_depth > 0 && count_depth < 5) {
                            if (opponent[om].hit()) { // PB opponents hit
                                missiles.remove(m);
                                _player.score += 100;
                                PlaySound("pop");
                                break;
                            }
                        }
                    }
                }
            }
        }

        // detect collision between opponent missiles and player
        for (om = 0; om < op_missiles.length; om++) {
            if (op_missiles[om].position == _player.position) {
                count_depth = (op_missiles[om].depth - _player.depth) * 100;
                if (count_depth < 5 && count_depth > 0) { // PB plaher hit
                    PlaySound("loselife");
                    op_missiles.remove(om);
                    _player.hit();
                    break;
                }
            }
        }

        // detect collision between opponent and player
        for (o = 0; o < opponent.length; o++) {
            if (!opponent[o].isHit) { // PB collisiom
                if (opponent[o].position == _player.position && opponent[o].depth >= _player.depth) {
                    opponent[o].hit();
                    _player.score += 100;
                    _player.hit();
                    PlaySound("loselife")
                }
            }
        }
    }

    draw_gui();
    _msg.update(time);
}

function draw_gui() {
    var height = _sh > _sw ? _sw : _sh;
    context.beginPath();
    context.strokeStyle = 'rgba(255,255,255,.3)';
    context.lineWidth = 30;
    context.arc(_sx, _sy, height / 2, 0.7 * Math.PI, 1.3 * Math.PI, false);
    context.stroke();
    context.closePath();

    context.beginPath();
    context.strokeStyle = 'rgba(255,255,255,.3)';
    context.lineWidth = 30;
    context.arc(_sx, _sy, height / 2, 1.7 * Math.PI, 2.3 * Math.PI, false);
    context.stroke();
    context.closePath();

    context.beginPath();
    if (waves < 9)
        context.fillStyle = 'rgba(255,255,255,.3)';
    else
        context.fillStyle = 'rgba(255,0,0,1)';
    context.font = "bold " + Math.round(48 * _ss) + "px Helvetica";
    context.textAlign = 'center';
    context.fillText(_player.score.toString(), _sx, _sh / 10); // PB score is top middle
    context.closePath();

    if (_player.life > 0.0) {
        context.beginPath();
        context.strokeStyle = 'rgba(255,' + Math.round((_player.life) * 255) + ',' + Math.round((_player.life) * 255) + ',0.6)';
        context.lineWidth = 30;
        context.arc(_sx, _sy, height / 2, (1.0 - (_player.life * 0.3)) * Math.PI, (1.0 + (_player.life * 0.3)) * Math.PI, false);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.strokeStyle = 'rgba(255,' + Math.round((_player.life) * 255) + ',' + Math.round((_player.life) * 255) + ',0.6)';
        context.lineWidth = 30;
        context.arc(_sx, _sy, height / 2, (2.0 - (_player.life * 0.3)) * Math.PI, (2.0 + (_player.life * 0.3)) * Math.PI, false);
        context.stroke();
        context.closePath();
    }
}

function animate() {
    requestAnimationFrame(animate);
    anim();
}

function calculatePosition(pos) {
    var step = 360 / _player.available_moves;
    if (pos != _player.position) {
        _player.position = pos;
        _player.offset_angle = (_player.position * step - 90) - _player.mouse_angle
        if (_player.offset_angle > step) {
            _player.offset_angle = -step;
        }
        if (_player.offset_angle < -step) {
            _player.offset_angle = step;
        }
        _player.mouse_angle = _player.position * step - 90;
        console.log(_player.mouse_angle, _player.position);
    }
}

function btnRunGame(event) {
    if (inMenu) {
        InitSounds();
        inMenu = false;
        splash.hidden = true;
        calculatePosition(_player.available_moves / 4);
        runGameCountDefine = 3000;
        runGameCount = 0;
    } else {
        // windows phone hack
        //        if (gameIsRunning && navigator.userAgent.match(/Windows Phone/i)) {
        //            event.preventDefault();
        //            doTouchStart(event);
        //        }
    }
}

function doTouchStart(event, x, y) {
    if (inMenu) btnRunGame();
    if (!gameIsRunning) return;
    var canvas_x, canvas_y;
    //    if (!navigator.userAgent.match(/Windows Phone/i)) {
    event.preventDefault();
    canvas_x = event.targetTouches[0].pageX;
    canvas_y = event.targetTouches[0].pageY;
    //    } else {
    //        // windows phone hack
    //        canvas_x = event.x;
    //        canvas_y = event.y;
    //    }
    var pos = _player.position;
    if (canvas_x > canvas_y) {
        if (canvas_x < _sx) {
            pos++;
        } else {
            pos--;
        }
    } else {
        if (canvas_x < _sy) {
            pos++;
        } else {
            pos--;
        }
    }
    if (pos == _player.available_moves) pos = 0;
    if (pos == -1) pos = (_player.available_moves - 1);
    calculatePosition(pos);
}

function mouse(evt) {
    //    if (navigator.userAgent.match(/Windows Phone/i)) {
    //        return;
    //    }
    if (!gameIsRunning) return;
    evt = evt || event;
    var cursor_x = evt.pageX;
    var cursor_y = evt.pageY;
    var step = 360 / _player.available_moves;
    var kat = Math.atan2(cursor_y - _sh / 2, cursor_x - _sw / 2) * 180 / Math.PI;
    if (kat < 0) kat = 360 + kat;
    var pos = Math.round(kat / step);
    if (pos > (_player.available_moves - 1)) pos = 0;
    calculatePosition(pos);
}

function init() {
    canvas = document.getElementById('c');
    canvas.style.position = 'absolute';
    context = canvas.getContext('2d');
    if ('ontouchstart' in document.documentElement) {
        canvas.addEventListener("touchstart", doTouchStart, false);
    }
}

function start() {
    init();
    resize();
    animate();
    setInterval(function () {
        _fps.draw();
    }, 1000);
}

function resize() {
    _sw = document.documentElement.clientWidth;
    _sh = document.documentElement.clientHeight;
    _sx = Math.round(_sw / 2);
    _sy = Math.round(_sh / 2);
    _sz = 800;

    if (canvas) {
        canvas.width = _sw;
        canvas.height = _sh;
    }
    if (context) {
        _background.resize();
        _stars.resize();
    }
    _ss = _sh / 1024;
}


function showPressedButton(index) {
    console.log("Press: ", index);
    switch (index) {
        case 4: // LT
        case 14: // dleft
        case 2: // X 
        case 0: // A
            leftSwitchDown();
            break;
        case 6:
        case 7:
        case 8:
        case 9:
        case 11:
        case 16:
            break;
        case 15: // dright
        case 5: // RT
        case 3: // Y 
        case 1: // B left down
            rightSwitchDown();
            break;
        case 10: // XBox
            reset_game();;
            break;
        default:
    }
}

function removePressedButton(index) {
    console.log("Releasd: ", index);
    switch (index) {
        case 4: // LT
        case 14: // dleft
        case 2: // X 
        case 0: // A
            leftSwitchUp();
            break;
        case 6:
        case 7:
        case 8:
        case 9:
        case 11:
        case 16:
            break;
        case 15: // dright
        case 5: // RT
        case 3: // Y 
        case 1: // B left down
            rightSwitchUp();
            break;
        case 10: // XBox
            reset_game();;
            break;
        default:
    }
}

var gpad;

gamepads.addEventListener('connect', e => {
    console.log('Gamepad connected:');
    console.log(e.gamepad);
    gpad = e.gamepad;
    e.gamepad.addEventListener('buttonpress', e => showPressedButton(e.index));
    e.gamepad.addEventListener('buttonrelease', e => removePressedButton(e.index));
});

gamepads.addEventListener('disconnect', e => {
    console.log('Gamepad disconnected:');
    console.log(e.gamepad);
});

gamepads.start();

document.onmousemove = mouse;
document.onmousedown = btnRunGame;
window.onresize = resize;
