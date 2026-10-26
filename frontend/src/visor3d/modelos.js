import * as THREE from 'three';

const COLORES = {
  rojo: '#c8102e',
  guindo: '#6d1a2b',
  negro: '#1a1a1a',
  blanco: '#f2f2f2',
  azul: '#1f4fbf',
  celeste: '#4aa3df',
  verde: '#1f8a3b',
  amarillo: '#f2c200',
  naranja: '#e8731a',
  gris: '#9a9a9a',
  plata: '#b8b8b8',
  plomo: '#6b6b6b',
  cafe: '#6b3e1f',
  marron: '#6b3e1f',
};

export function colorDesdeNombre(nombre) {
  const clave = (nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .split(/\s+/)[0];
  return COLORES[clave] || COLORES.rojo;
}

function crearMateriales(colorCarroceria) {
  return {
    carroceria: new THREE.MeshStandardMaterial({ color: colorCarroceria, metalness: 0.3, roughness: 0.45 }),
    negro: new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8 }),
    llanta: new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.95 }),
    metal: new THREE.MeshStandardMaterial({ color: '#a6a6a6', metalness: 0.85, roughness: 0.3 }),
    vidrio: new THREE.MeshStandardMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.3, roughness: 0.1 }),
    faro: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4cc', emissiveIntensity: 0.8 }),
  };
}

function caja(material, [ancho, alto, profundidad], [x, y, z]) {
  const malla = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, profundidad), material);
  malla.position.set(x, y, z);
  return malla;
}

function cilindro(material, radio, largo, [x, y, z], rotacion = [0, 0, 0]) {
  const malla = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, largo, 20), material);
  malla.position.set(x, y, z);
  malla.rotation.set(...rotacion);
  return malla;
}

function rueda(mat, radio, [x, y, z]) {
  const grupo = new THREE.Group();
  grupo.add(new THREE.Mesh(new THREE.TorusGeometry(radio, radio * 0.28, 16, 40), mat.llanta));
  grupo.add(cilindro(mat.metal, radio * 0.45, radio * 0.35, [0, 0, 0], [Math.PI / 2, 0, 0]));
  grupo.position.set(x, y, z);
  return grupo;
}

function faro(mat, [x, y, z]) {
  const malla = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 16), mat.faro);
  malla.position.set(x, y, z);
  return malla;
}

function frenteMoto(mat, x) {
  const grupo = new THREE.Group();
  for (const z of [-0.08, 0.08]) {
    grupo.add(cilindro(mat.metal, 0.03, 0.75, [x - 0.1, 0.62, z], [0, 0, 0.35]));
  }
  grupo.add(cilindro(mat.negro, 0.025, 0.65, [x - 0.2, 1.0, 0], [Math.PI / 2, 0, 0]));
  grupo.add(faro(mat, [x - 0.03, 0.88, 0]));
  return grupo;
}

function crearMotocicleta(mat) {
  const g = new THREE.Group();
  g.add(rueda(mat, 0.32, [0.75, 0.32, 0]));
  g.add(rueda(mat, 0.32, [-0.75, 0.32, 0]));
  g.add(frenteMoto(mat, 0.75));
  g.add(caja(mat.carroceria, [0.55, 0.22, 0.3], [0.15, 0.76, 0]));
  g.add(caja(mat.negro, [0.6, 0.1, 0.26], [-0.32, 0.82, 0]));
  g.add(caja(mat.metal, [0.4, 0.3, 0.25], [-0.05, 0.47, 0]));
  g.add(caja(mat.carroceria, [0.4, 0.06, 0.2], [-0.72, 0.72, 0]));
  g.add(caja(mat.metal, [0.75, 0.05, 0.05], [-0.4, 0.36, 0.1]));
  g.add(cilindro(mat.metal, 0.04, 0.6, [-0.45, 0.35, 0.2], [0, 0, Math.PI / 2]));
  return g;
}

function crearTorito(mat) {
  const g = new THREE.Group();
  g.add(rueda(mat, 0.28, [1.0, 0.28, 0]));
  g.add(rueda(mat, 0.28, [-0.6, 0.28, 0.58]));
  g.add(rueda(mat, 0.28, [-0.6, 0.28, -0.58]));
  g.add(cilindro(mat.metal, 0.03, 1.16, [-0.6, 0.28, 0], [Math.PI / 2, 0, 0]));
  g.add(cilindro(mat.metal, 0.03, 0.5, [0.93, 0.5, 0], [0, 0, 0.3]));

  g.add(caja(mat.negro, [1.6, 0.08, 1.05], [-0.2, 0.5, 0]));
  g.add(caja(mat.carroceria, [1.45, 0.45, 1.1], [-0.25, 0.77, 0]));
  g.add(caja(mat.carroceria, [0.45, 0.65, 0.7], [0.75, 0.82, 0]));
  g.add(faro(mat, [0.99, 0.95, 0]));
  g.add(caja(mat.vidrio, [0.04, 0.55, 0.95], [0.75, 1.42, 0]));
  g.add(caja(mat.negro, [0.5, 0.12, 0.5], [0.25, 1.05, 0]));
  g.add(caja(mat.negro, [0.4, 0.12, 0.95], [-0.65, 1.05, 0]));
  g.add(caja(mat.negro, [0.08, 0.5, 0.95], [-0.88, 1.3, 0]));

  for (const [x, z] of [[0.75, 0.5], [0.75, -0.5], [-0.95, 0.55], [-0.95, -0.55]]) {
    g.add(cilindro(mat.negro, 0.025, 0.85, [x, 1.4, z]));
  }
  g.add(caja(mat.carroceria, [1.95, 0.06, 1.25], [-0.1, 1.84, 0]));
  return g;
}

function crearMotocar(mat) {
  const g = new THREE.Group();
  g.add(rueda(mat, 0.3, [1.0, 0.3, 0]));
  g.add(rueda(mat, 0.3, [-0.75, 0.3, 0.62]));
  g.add(rueda(mat, 0.3, [-0.75, 0.3, -0.62]));
  g.add(cilindro(mat.metal, 0.03, 1.24, [-0.75, 0.3, 0], [Math.PI / 2, 0, 0]));
  g.add(frenteMoto(mat, 1.0));

  g.add(caja(mat.carroceria, [0.5, 0.22, 0.3], [0.45, 0.78, 0]));
  g.add(caja(mat.negro, [0.45, 0.1, 0.28], [0.05, 0.84, 0]));
  g.add(caja(mat.metal, [0.35, 0.3, 0.25], [0.3, 0.5, 0]));
  g.add(caja(mat.metal, [1.1, 0.07, 0.1], [0.0, 0.48, 0]));

  g.add(caja(mat.carroceria, [1.3, 0.08, 1.35], [-0.75, 0.66, 0]));
  g.add(caja(mat.carroceria, [1.3, 0.35, 0.05], [-0.75, 0.87, 0.65]));
  g.add(caja(mat.carroceria, [1.3, 0.35, 0.05], [-0.75, 0.87, -0.65]));
  g.add(caja(mat.carroceria, [0.05, 0.35, 1.35], [-1.38, 0.87, 0]));
  g.add(caja(mat.negro, [0.05, 0.5, 1.35], [-0.12, 0.95, 0]));
  return g;
}

const CONSTRUCTORES = {
  Motocicleta: crearMotocicleta,
  Torito: crearTorito,
  Motocar: crearMotocar,
};

export function crearModelo(tipo, nombreColor) {
  const construir = CONSTRUCTORES[tipo] || crearMotocicleta;
  const modelo = construir(crearMateriales(colorDesdeNombre(nombreColor)));
  modelo.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
    }
  });
  return modelo;
}
