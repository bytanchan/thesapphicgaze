import './style.css'

import { animate, inView } from 'motion'
import { 
    AmbientLight,
    Clock,
    DirectionalLight,
    Group,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three'

/*
// MOVIE GENERATOR

// main.js
import { fetchRandomMovies } from './fetchMovies'; // Import the fetch function

// Display random movies
const displayRandomMovies = async () => {
  const movies = await fetchRandomMovies();
  const moviesContainer = document.querySelector('#random-movies');
  if (moviesContainer) {
    moviesContainer.innerHTML = ''; // Clear existing content

    movies.forEach(movie => {
      const movieElement = document.createElement('div');
      movieElement.className = 'movie';
      movieElement.innerHTML = `
        <img src="${movie.poster_url}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.description}</p>
      `;
      moviesContainer.appendChild(movieElement);
    });
  }
};

document.addEventListener('DOMContentLoaded', displayRandomMovies);


*/


import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { NoiseShader } from './noise.shader';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const sneakerTag = document.querySelector("section.sneaker")
const loaderTag = document.querySelector("div.loader")

// Initial fade-in animations for header and new-drop sections
animate(
    'header', 
{ 
    y: [-100, 0],
    opacity: [0, 1],
}, 
{ duration: 1, delay: 2.5 }
)

animate (
    'section.new-drop', {
        y: [-100, 0],
        opacity: [0, 1],
    }, 
    { duration: 1, delay: 2 }
)

animate('section.content p, section.content img', { opacity: 0 })

inView('section.content', (info) => {
    animate(info.target.querySelectorAll("p, img"), { opacity: 1 }, { duration: 1, delay: 0.5 })
})

const clock = new Clock()

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 0)
sneakerTag.appendChild( renderer.domElement );

// LIGHTING 
const ambience = new AmbientLight(0x404040)
camera.add(ambience)

const keyLight = new DirectionalLight( 0xffffff, 1)
keyLight.position.set(-1, 1, 3)
camera.add(keyLight)

const fillLight = new DirectionalLight( 0xffffff, 0.5)
fillLight.position.set(1, 1, 3)
camera.add(fillLight)

const backLight = new DirectionalLight (0xffffff, 1)
backLight.position.set(-1, 3, -1)
camera.add(backLight)

scene.add(camera)

// ... scene, camera, renderer, light setup ...
const gltfLoader = new GLTFLoader();
const loadGroup = new Group();
loadGroup.position.y = -20;

const scrollGroup = new Group();
scrollGroup.add(loadGroup);


// OBJECT IMPORT
gltfLoader.load("cherries.glb", (gltf) => {
  loadGroup.add(gltf.scene);

  // ANIMATION FOR CHERRY
  animate((t) => {
    loadGroup.position.y = -20 + 17.5 * t;
  }, { duration: 2, delay: 1 });

  // LOADER ANIMATION
  animate("div.loader", {
    y: "-100%",
  }, { duration: 1, delay: 1 });

  scene.add(scrollGroup); // Add the model group after it's loaded
}, 
  (xhr) => {
      // progress tracking...
  },
  (error) => {
      console.error('Error loading GLB model:', error);
  }
);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableZoom = false
controls.enablePan = false
controls.autoRotate = true
controls.autoRotateSpeed = 2
controls.update()

camera.position.z = 13;

// POST PROCESSING
const composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const noisePass = new ShaderPass(NoiseShader)
noisePass.uniforms.time.value = clock.getElapsedTime()
noisePass.uniforms.effect.value = 0
composer.addPass(noisePass)

const outputPass = new OutputPass();
composer.addPass( outputPass );

let scrollTimeout;

const render = () => {
    controls.update()

    scrollGroup.rotation.set(0, window.scrollY * 0.002, 0)

    noisePass.uniforms.time.value = clock.getElapsedTime()

    composer.render()
}

const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

const updateNoiseEffect = () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollFraction = window.scrollY / maxScroll;
    noisePass.uniforms.effect.value = scrollFraction * 5;  // Adjust the multiplier to control the distortion strength

    // Clear the previous timeout if any
    clearTimeout(scrollTimeout);

    // Set a timeout to gradually reset the distortion
    scrollTimeout = setTimeout(() => {
        const resetEffect = () => {
            if (noisePass.uniforms.effect.value > 0) {
                noisePass.uniforms.effect.value -= 0.01; // Adjust the decrement value to control the reset speed
                requestAnimationFrame(resetEffect);
            } else {
                noisePass.uniforms.effect.value = 0;
            }
        }
        resetEffect();
    }, 200); // Wait 200ms after the last scroll event before starting the reset
}

renderer.setAnimationLoop( render );
window.addEventListener("resize", resize)
window.addEventListener("scroll", updateNoiseEffect);
