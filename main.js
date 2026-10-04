import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(innerWidth, innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, innerWidth / innerHeight, 0.1, 100 );
camera.position.set( 5, 4, 10 );
camera.lookAt( 0, 0, 0 );

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

const cubies = [];

for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
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
      cubies.push(cubie);
    }
  }
}

function animate( time ) {
  time *= 0.001;  // convert time to seconds

  controls.update();

  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

function rotate(face, axis, angle) {
  const pivot = new THREE.Group()
  for (const cubie of face) {
    pivot.attach(cubie)
  }
  scene.attach(pivot)
  if (axis == 'x') {
    pivot.rotateX(angle)
  } else if (axis == 'y') {
    pivot.rotateY(angle)
  } else if (axis == 'z') {
    pivot.rotateZ(angle)
  }

  while (pivot.children.length > 0) {
    scene.attach(pivot.children[0])
  }

  scene.remove(pivot)
}

window.parseNotation = parseNotation;
function parseNotation(alg) {
  for (let i = 0; i < alg.length; i++) {
    const face = []
    const m = alg[i];
    if (m == 'F' || m == 'S' || m == 'B') {
      for (const child of scene.children) {
        if ((m == 'F' && child.position.z == 1) || (m == 'S' && child.position.z == 0) || (m == 'B' && child.position.z == -1)) {
          face.push(child)
        }
      }
      if (i < alg.length - 1) {
        if (alg[i + 1] == "'" || alg[i + 1] == '"') {
          rotate(face, 'z', Math.PI * 0.5)
        } else if (alg[i + 1] == '2') {
          rotate(face, 'z', Math.PI)
        } else {
          rotate(face, 'z', Math.PI * 1.5)
        }
      } else {
        rotate(face, 'z', Math.PI * 1.5)
      }
    } else if (m == 'R' || m == 'M' || m == 'L') {
      for (const child of scene.children) {
        if ((m == 'R' && child.position.x == 1) || (m == 'M' && child.position.x == 0) || (m == 'L' && child.position.x == -1)) {
          face.push(child)
        }
      }
      if (i < alg.length - 1) {
        if (alg[i + 1] == "'" || alg[i + 1] == '"') {
          rotate(face, 'x', Math.PI * 0.5)
        } else if (alg[i + 1] == '2') {
          rotate(face, 'x', Math.PI)
        } else {
          rotate(face, 'x', Math.PI * 1.5)
        }
      } else {
        rotate(face, 'x', Math.PI * 1.5)
      }
    } else if (m == 'U' || m == 'E' || m == 'D') {
      for (const child of scene.children) {
        if ((m == 'U' && child.position.y == 1) || (m == 'E' && child.position.y == 0) || (m == 'D' && child.position.y == -1)) {
          face.push(child)
        }
      }
      if (i < alg.length - 1) {
        if (alg[i + 1] == "'" || alg[i + 1] == '"') {
          rotate(face, 'y', Math.PI * 0.5)
        } else if (alg[i + 1] == '2') {
          rotate(face, 'y', Math.PI)
        } else {
          rotate(face, 'y', Math.PI * 1.5)
        }
      } else {
        rotate(face, 'y', Math.PI * 1.5)
      }
    }

    for (const cubie of face) {
      cubie.position.x = Math.round(cubie.position.x)
      cubie.position.y = Math.round(cubie.position.y)
      cubie.position.z = Math.round(cubie.position.z)
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code == 'KeyF') {
    parseNotation('F')
  } else if (event.code == 'KeyS') {
    parseNotation('S')
  } else if (event.code == 'KeyB') {
    parseNotation('B')
  } else if (event.code == 'KeyU') {
    parseNotation('U')
  } else if (event.code == 'KeyE') {
    parseNotation('E')
  } else if (event.code == 'KeyD') {
    parseNotation('D')
  } else if (event.code == 'KeyR') {
    parseNotation('R')
  } else if (event.code == 'KeyM') {
    parseNotation('M')
  } else if (event.code == 'KeyL') {
    parseNotation('L')
  }
});

