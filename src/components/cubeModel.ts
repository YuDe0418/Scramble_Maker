import {
  ExtrudeGeometry, Group, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial,
  Quaternion, Shape, Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { getTurn } from '../engine/cubeMoves';
import type { Move } from '../engine/cubeMoves';
import type { CubeState, StickerColor } from '../engine/cubeState';
import { stickerColors } from './stickerColors';

const axes = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
const plastic = new RoundedBoxGeometry(0.963, 0.963, 0.963, 3, 0.083);
const plasticMaterial = new MeshStandardMaterial({ color: '#11121c', roughness: 0.37, metalness: 0.14 });

function makeStickerGeometry() {
  const h = 0.408;
  const r = 0.068;
  const shape = new Shape();
  shape.moveTo(-h + r, -h);
  shape.lineTo(h - r, -h);
  shape.quadraticCurveTo(h, -h, h, -h + r);
  shape.lineTo(h, h - r);
  shape.quadraticCurveTo(h, h, h - r, h);
  shape.lineTo(-h + r, h);
  shape.quadraticCurveTo(-h, h, -h, h - r);
  shape.lineTo(-h, -h + r);
  shape.quadraticCurveTo(-h, -h, -h + r, -h);
  return new ExtrudeGeometry(shape, {
    depth: 0.013, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 5,
  });
}

const stickerGeometry = makeStickerGeometry();
const materials = Object.fromEntries(Object.entries(stickerColors).map(([color, hex]) => [color,
  new MeshPhysicalMaterial({ color: hex, roughness: 0.32, clearcoat: 0.38, clearcoatRoughness: 0.35 }),
])) as Record<StickerColor, MeshPhysicalMaterial>;

export function makeCubeModel(state: CubeState) {
  const group = new Group();
  group.name = 'CUBEX cube';
  const byId = new Map<string, Group>();
  for (const cubie of state) {
    const part = new Group();
    part.name = cubie.id;
    const body = new Mesh(plastic, plasticMaterial);
    body.castShadow = true;
    part.add(body);
    for (const sticker of cubie.stickers) {
      const mesh = new Mesh(stickerGeometry, materials[sticker.color]);
      const normal = new Vector3(...sticker.normal);
      mesh.name = sticker.color;
      mesh.position.copy(normal).multiplyScalar(0.489);
      mesh.quaternion.setFromUnitVectors(axes[2], normal);
      part.add(mesh);
    }
    byId.set(cubie.id, part);
    group.add(part);
  }

  const basis = new Matrix4();
  const x = new Vector3();
  const y = new Vector3();
  const z = new Vector3();
  const rotation = new Quaternion();

  function setPose(snapshot: CubeState, move?: Move, fraction = 0) {
    const turn = move && fraction > 0 ? getTurn(move) : undefined;
    if (turn) {
      const eased = fraction * fraction * (3 - 2 * fraction);
      rotation.setFromAxisAngle(axes[turn.axis], turn.angle * eased);
    }
    for (const { id, position, orientation } of snapshot) {
      const part = byId.get(id)!;
      part.position.set(...position);
      basis.makeBasis(x.set(...orientation[0]), y.set(...orientation[1]), z.set(...orientation[2]));
      part.quaternion.setFromRotationMatrix(basis);
      if (turn && position[turn.axis] === turn.side) {
        part.position.applyQuaternion(rotation);
        part.quaternion.premultiply(rotation);
      }
    }
  }

  setPose(state);
  return { group, setPose };
}
