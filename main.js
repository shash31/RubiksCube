import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import solve from './solver.js'

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(innerWidth, innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, innerWidth / innerHeight, 0.1, 100 );
camera.position.set( 10, 6, 10 );
// camera.lookAt( 0, 0, 0 );

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

const COLORS = {
  WHITE:  0xffffff,
  YELLOW: 0xffd500,
  RED:    0xb71234,
  ORANGE: 0xff5800,
  GREEN:  0x009b48,
  BLUE:   0x0046ad,
  BLACK:  0x111111, // inner faces
};
const HEX_TO_COLORS = {
  'ffffff' : 'w',
  'ffd500': 'y',
  'b71234' : 'r',
  'ff5800': 'o',
  '009b48': 'g',
  '0046ad' : 'b',
  '111111' : 'black'
};

let flatCubeState = ""; // For solver

function buildCube() {
  for (let x = -1; x <= 1; x++) {
    // rubikscube.push([])
    for (let y = -1; y <= 1; y++) {
      // rubikscube[x+1].push([])
      for (let z = -1; z <= 1; z++) {
        const materials = [
          x ===  1 ? COLORS.RED    : COLORS.BLACK, // +x
          x === -1 ? COLORS.ORANGE : COLORS.BLACK, // -x
          y ===  1 ? COLORS.WHITE  : COLORS.BLACK, // +y
          y === -1 ? COLORS.YELLOW : COLORS.BLACK, // -y
          z ===  1 ? COLORS.GREEN  : COLORS.BLACK, // +z
          z === -1 ? COLORS.BLUE   : COLORS.BLACK, // -z
        ].map(c => new THREE.MeshBasicMaterial({ color: c }));

        const cubie = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), materials);
        cubie.position.set(x, y, z);
        // rubikscube.attach(cubie);
        scene.attach(cubie);
        // rubikscube[x+1][y+1].push(cubie);
      }
    }
  }
}

buildCube()

let isTurning = false
let elapsedTime = 0
let turningDuration = 0.8
let targetAngle
let rotationSpeed
let pivotGroup
let rotationAxis
let turningFace

const slider = document.getElementById("myRange");
slider.addEventListener("input", function() {
  turningDuration = 0.8 - ((this.value/100)*0.79);
});

const moveQueue = [] // Moves stored as regular notation

const zaxisfaces = ['B', 'S', 'F']
const xaxisfaces = ['L', 'M', 'R']
const yaxisfaces = ['D', 'E', 'U']

function processMove() {
  if (isTurning) return;

  const m = moveQueue.shift()

  if (m[0] == 'F' || m[0] == 'S' || m[0] == 'B') {
    rotationAxis = 'z'
    turningFace = scene.children.filter(cubie => cubie.position.z == (zaxisfaces.indexOf(m[0]) - 1))

    if (m.length > 1) {
      if (m[1] == "'" || m[1] == '"') { // Anti-clockwise
        targetAngle = Math.PI * 0.5
        if (m[0] == 'B') targetAngle = -Math.PI * 0.5
      } else if (m[1] == '2') {
        targetAngle = Math.PI
      }
    } else {
      targetAngle = -Math.PI * 0.5
      if (m[0] == 'B') targetAngle = Math.PI * 0.5
    }
  } else if (m[0] == 'R' || m[0] == 'M' || m[0] == 'L') {
    rotationAxis = 'x'
    turningFace = scene.children.filter(cubie => cubie.position.x == (xaxisfaces.indexOf(m[0]) - 1))

    if (m.length > 1) {
      if (m[1] == "'" || m[1] == '"') { // Anti-clockwise
        targetAngle = -Math.PI * 0.5
        if (m[0] == 'R') targetAngle = Math.PI * 0.5
      } else if (m[1] == '2') {
        targetAngle = Math.PI
      }
    } else {
      targetAngle = Math.PI * 0.5
      if (m[0] == 'R') targetAngle = -Math.PI * 0.5
    }
  } else if (m[0] == 'U' || m[0] == 'E' || m[0] == 'D') {
    rotationAxis = 'y'
    turningFace = scene.children.filter(cubie => cubie.position.y == (yaxisfaces.indexOf(m[0]) - 1))

    if (m.length > 1) {
      if (m[1] == "'" || m[1] == '"') { // Anti-clockwise
        targetAngle = -Math.PI * 0.5
        if (m[0] == 'U') targetAngle = Math.PI * 0.5
      } else if (m[1] == '2') {
        targetAngle = Math.PI
      }
    } else {
      targetAngle = Math.PI * 0.5
      if (m[0] == 'U') targetAngle = -Math.PI * 0.5
    }
  } else {
    // Invalid input
    return;
  }

  pivotGroup = new THREE.Group()
  for (const cubie of turningFace) {
    pivotGroup.attach(cubie)
  }
  scene.attach(pivotGroup)

  // Starting turn animation
  isTurning = true
  elapsedTime = 0
  rotationSpeed = targetAngle / turningDuration
}

function dissolvePivotGroup() {
  while (pivotGroup.children.length > 0) {
    scene.attach(pivotGroup.children[0])
  }

  scene.remove(pivotGroup)

  // Snapping cubies in place to avoid small floating point drift
  for (const cubie of turningFace) {
    cubie.position.x = Math.round(cubie.position.x)
    cubie.position.y = Math.round(cubie.position.y)
    cubie.position.z = Math.round(cubie.position.z)
  }
}

window.pn = pn;
function pn(alg) {
  for (let i = 0; i < alg.length; i++) {
    if (i < alg.length - 1 && (alg[i+1] == "'" || alg[i+1] == '"' || alg[i+1] == "2")) {
      moveQueue.push(alg[i] + alg[i+1])
    } else {
      moveQueue.push(alg[i]) // processMove() handles invalid input
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code == 'KeyF') {
    moveQueue.push('F')
  } else if (event.code == 'KeyG') { // F'
    moveQueue.push("F'")
  } else if (event.code == 'KeyS') {
    moveQueue.push('S')
  } else if (event.code == 'KeyA') { // S'
    moveQueue.push("S'")
  } else if (event.code == 'KeyB') {
    moveQueue.push('B')
  } else if (event.code == 'KeyN') { // B'
    moveQueue.push("B'")
  } else if (event.code == 'KeyU') {
    moveQueue.push('U')
  } else if (event.code == 'KeyY') { // U'
    moveQueue.push("U'")
  } else if (event.code == 'KeyE') {
    moveQueue.push('E')
  } else if (event.code == 'KeyW') { // E'
    moveQueue.push("E'")
  } else if (event.code == 'KeyD') {
    moveQueue.push('D')
  } else if (event.code == 'KeyC') { // D'
    moveQueue.push("D'")
  } else if (event.code == 'KeyR') {
    moveQueue.push('R')
  } else if (event.code == 'KeyT') { // R'
    moveQueue.push("R'")
  } else if (event.code == 'KeyM') {
    moveQueue.push('M')
  } else if (event.code == 'KeyN') { // M'
    moveQueue.push("M'")
  } else if (event.code == 'KeyL') {
    moveQueue.push('L')
  } else if (event.code == 'KeyK') { // L'
    moveQueue.push("L'")
  }
});

const scrambleButton = document.getElementById('scramble');
scrambleButton.addEventListener('click', () => {
  const moves = ['F', 'B', 'U', 'D', 'R', 'L']
  const turn = ['', "'", '2']
  console.log('Scramble:')
  let prevFace = -1
  for (let i = 0; i < 25; i++) {
    let randomFace = Math.floor(Math.random()*6)
    while (randomFace == prevFace) randomFace = Math.floor(Math.random()*6)
    prevFace = randomFace

    const direction = Math.floor(Math.random()*3)
    const move = moves[randomFace] + turn[direction]
    console.log(move)
    moveQueue.push(move)
  }
  console.log('SCRAMBLE OVER')
})

const solveButton = document.getElementById('solve');
solveButton.addEventListener('click', () => {
  if (isTurning || moveQueue.length > 0) return

  // Get cube state as a flat array of 54 stickers in (ULFRBD) order
  const flatCubeState = Array(54).fill(0);

  // Materials order(+x, -x, +y, -y, +z, -z)
  const normals = [
    [1, 0, 0], [-1, 0, 0], // Right, Left
    [0, 1, 0], [0, -1, 0], // Up, Down
    [0, 0, 1], [0, 0, -1], // Front, Back
  ]
  
  for (const cubie of scene.children) {
    const cur_pos = cubie.position

    // Applying quaternions to all initial directions to find new current directions
    // +x, -x, +y, -y, +z, -z
    for (let i = 0; i < 6; i++) {
      const color = HEX_TO_COLORS[cubie.material[i].color.getHexString()]
      if (color == 'black') continue // Inner face

      const normal = new THREE.Vector3(normals[i][0], normals[i][1], normals[i][2])
      normal.applyQuaternion(cubie.quaternion)
      normal.round() // Getting updated direction

      let final_ind
      // ULFRBD Order
      if (normal.x != 0) {
        if (normal.x == 1) { // Right face
          // Getting local x and y on face
          const x = 2 - (cur_pos.z + 1)
          const y = 2 - (cur_pos.y + 1)
          const ind_on_face = (y*3) + x

          final_ind = (3*9) + ind_on_face
        } else if (normal.x == -1) { // Left face
          // Getting local x and y on face
          const x = cur_pos.z + 1
          const y = 2 - (cur_pos.y + 1)
          const ind_on_face = (y*3) + x

          final_ind = (1*9) + ind_on_face
        }
      } else if (normal.y != 0) {
        if (normal.y == 1) { // Up face
          // Getting local x and y on face
          const x = cur_pos.x + 1
          const y = cur_pos.z + 1
          const ind_on_face = (y*3) + x

          final_ind = (0*9) + ind_on_face
        } else if (normal.y == -1) { // Down face
          // Getting local x and y on face
          const x = cur_pos.x + 1
          const y = 2 - (cur_pos.z + 1)
          const ind_on_face = (y*3) + x

          final_ind = (5*9) + ind_on_face
        }
      } else if (normal.z != 0) {
        if (normal.z == 1) { // Front face
          // Getting local x and y on face
          const x = cur_pos.x + 1
          const y = 2 - (cur_pos.y + 1)
          const ind_on_face = (y*3) + x

          final_ind = (2*9) + ind_on_face
        } else if (normal.z == -1) { // Back face
          // Getting local x and y on face
          const x = 2 - (cur_pos.x + 1)
          const y = 2 - (cur_pos.y + 1)
          const ind_on_face = (y*3) + x

          final_ind = (4*9) + ind_on_face
        }
      }
      flatCubeState[final_ind] = color
    }
  }

  for (let i = 0; i < 6; i++) {
    console.log(flatCubeState.slice(i*9, (i*9)+9))
  }
  console.log('PARSED CUBE STATE TO FLAT ARRAY')

  const solution = solve(flatCubeState);
  pn(solution)
})

const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', () => {
  moveQueue.length = 0

  scene.traverse((object) => {
    if (!object.isMesh) return;

    if (object.geometry) {
        object.geometry.dispose();
    }

    if (object.material) {
        if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
        } else {
            object.material.dispose();
        }
    }
  });

  scene.clear();

  buildCube();
})

const timer = new THREE.Timer()

function animate( time ) {
  timer.update(time);
  const delta = timer.getDelta();

  if (isTurning) {
    elapsedTime += delta

    if (elapsedTime >= turningDuration) {
      // Rotation finished
      // Snap into place
      if (rotationAxis == 'x') pivotGroup.rotation.x = targetAngle
      else if (rotationAxis == 'y') pivotGroup.rotation.y = targetAngle
      else if (rotationAxis == 'z') pivotGroup.rotation.z = targetAngle

      isTurning = false
      dissolvePivotGroup()

      if (moveQueue.length > 0) processMove()
    } else {
      if (rotationAxis == 'x') pivotGroup.rotation.x += rotationSpeed*delta
      else if (rotationAxis == 'y') pivotGroup.rotation.y += rotationSpeed*delta
      else if (rotationAxis == 'z') pivotGroup.rotation.z += rotationSpeed*delta
    }
  } else {
    if (moveQueue.length > 0) processMove()
  }

  controls.update();

  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
