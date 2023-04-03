import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'dat.gui'

// Boilerplate stuff
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Orbit
const orbit = new OrbitControls( camera, renderer.domElement );
orbit.enableZoom = true;

// Test cube
const brewers = new THREE.MeshBasicMaterial( { color: 0x12284B } );
const cardinals = new THREE.MeshBasicMaterial( { color: 0xC41E3A } );
const cubs = new THREE.MeshBasicMaterial( { color: 0x0E3386 } );
const tie = new THREE.MeshBasicMaterial( { color: 0xFFFF00 } );
var outline = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
const mats = [brewers, cardinals, cubs];


// UI stuff
let records = {
    brewers: {
        w: 2,
        l: 1,
    },
    cardinals: {
        w: 2,
        l: 1
    },
    cubs: {
        w: 1,
        l: 2
    },
}
const GAMES = 30;
const gui = new GUI();
const brewFolder = gui.addFolder('Brewers');
brewFolder.add(records.brewers, 'w', 0, GAMES).step(1).name("Wins").onChange(makeFaces);
brewFolder.add(records.brewers, 'l', 0, GAMES).step(1).name("Losses").onChange(makeFaces);
const cardFolder = gui.addFolder('Cardinals');
cardFolder.add(records.cardinals, 'w', 0, GAMES).step(1).name("Wins").onChange(makeFaces);
cardFolder.add(records.cardinals, 'l', 0, GAMES).step(1).name("Losses").onChange(makeFaces);
const cubFolder = gui.addFolder('Cubs');
cubFolder.add(records.cubs, 'w', 0, GAMES).step(1).name("Wins").onChange(makeFaces);
cubFolder.add(records.cubs, 'l', 0, GAMES).step(1).name("Losses").onChange(makeFaces);

function retMaterial(wins) {
    let max_wins = Math.max(...wins);
    let num_teams = wins.filter(x => x == max_wins).length;
    return num_teams > 1 ? tie : mats[wins.indexOf(max_wins)];
}

function purgeMeshes() {
    for (let i = scene.children.length - 1; i >= 0; i--) {
        if (scene.children[i].type === "Mesh")
            scene.remove(scene.children[i]);
    }   
}

function makeFace(brew_wins, card_wins, cub_wins) {
    let face = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), retMaterial([brew_wins, card_wins, cub_wins]));
    face.translateX(brew_wins);
    face.translateY(card_wins);
    face.translateZ(cub_wins);
    // var geo = new THREE.EdgesGeometry( face.geometry );
    // var wireframe = new THREE.LineSegments( geo, outline );
    // face.add(wireframe);
    return face;
}

function fixFace(face, x, y, z) {
    face.translateX(x);
    face.translateY(y);
    face.translateZ(z);
}

function makeFaces() {
    purgeMeshes();
    const BREW_GAMES = GAMES - (records.brewers.w + records.brewers.l);
    const CARD_GAMES = GAMES - (records.cardinals.w + records.cardinals.l);
    const CUB_GAMES = GAMES - (records.cubs.w + records.cubs.l);

    const BREW_MAX = BREW_GAMES + records.brewers.w;
    const CARD_MAX = CARD_GAMES + records.cardinals.w;
    const CUB_MAX = CUB_GAMES + records.cubs.w;
    // Card and Brewers
    for (let brew_wins = records.brewers.w; brew_wins < BREW_MAX; brew_wins++) {
        for (let card_wins = records.cardinals.w; card_wins < CARD_MAX; card_wins++) {
            let face_min = makeFace(brew_wins, card_wins, records.cubs.w);
            face_min.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            scene.add(face_min);
            let face_max = makeFace(brew_wins, card_wins, CUB_MAX);
            scene.add(face_max);
        }
    }
    // Brewers and Cubs
    for (let brew_wins = records.brewers.w; brew_wins < BREW_MAX; brew_wins++) {
        for (let cub_wins = records.cubs.w; cub_wins < CUB_MAX; cub_wins++) {
            let face_min = makeFace(brew_wins, records.cardinals.w, cub_wins);
            face_min.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            fixFace(face_min, 0, .5, .5);
            scene.add(face_min);
            let face_max = makeFace(brew_wins, CARD_MAX, cub_wins);
            face_max.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
            fixFace(face_max, 0, -.5, -.5);
            scene.add(face_max);
        }
    }
    // Card and Cubs
    for (let cub_wins = records.cubs.w; cub_wins < CUB_MAX; cub_wins++) {
        for (let card_wins = records.cardinals.w; card_wins < CARD_MAX; card_wins++) {
            let face_min = makeFace(records.brewers.w, card_wins, cub_wins);
            face_min.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            fixFace(face_min, .5, 0, .5);
            scene.add(face_min);
            let face_max = makeFace(BREW_MAX, card_wins, cub_wins);
            face_max.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            fixFace(face_max, -.5, 0, -.5);
            scene.add(face_max);
        }
    }
}

makeFaces();


camera.position.x = -(GAMES + 5);
camera.position.y = -(GAMES + 5);
camera.position.z = -(GAMES + 5);

// Point lights
const light = new THREE.PointLight( 0xff0000, 5 );
light.position.set( 1.5, 1.5, 1.5 );
const light2 = new THREE.PointLight( 0xff0000, 5 );
light2.position.set( -1.5, -1.5, -1.5 );
scene.add( light );
scene.add(light2);

function animate() {
    requestAnimationFrame( animate );

    renderer.render( scene, camera );
}
animate();