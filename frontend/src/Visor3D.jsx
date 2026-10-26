import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { crearModelo } from './visor3d/modelos';

const FONDO = '#171717';
const SUELO = '#262626';
const POSICION_CAMARA = new THREE.Vector3(3.2, 2.2, 3.2);

function soportaWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function liberarEscena(escena) {
  escena.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const materiales = Array.isArray(obj.material) ? obj.material : [obj.material];
      materiales.forEach((m) => m.dispose());
    }
  });
}

function Visor3D({ tipo = 'Motocicleta', color = 'Rojo', titulo, onClose }) {
  const contenedorRef = useRef(null);
  const controlesRef = useRef(null);
  const [autoRotar, setAutoRotar] = useState(true);
  const autoRotarRef = useRef(autoRotar);
  const [errorWebGL] = useState(() => !soportaWebGL());

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || errorWebGL) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (err) {
      console.error('WebGL no disponible:', err);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    contenedor.appendChild(renderer.domElement);

    const escena = new THREE.Scene();
    escena.background = new THREE.Color(FONDO);

    const camara = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camara.position.copy(POSICION_CAMARA);

    escena.add(new THREE.HemisphereLight('#ffffff', '#333333', 1.2));
    const luz = new THREE.DirectionalLight('#ffffff', 2);
    luz.position.set(4, 6, 3);
    luz.castShadow = true;
    luz.shadow.mapSize.set(1024, 1024);
    escena.add(luz);

    const suelo = new THREE.Mesh(
      new THREE.CircleGeometry(3, 48),
      new THREE.MeshStandardMaterial({ color: SUELO, roughness: 1 })
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    escena.add(suelo);

    const modelo = crearModelo(tipo, color);
    const caja = new THREE.Box3().setFromObject(modelo);
    const centro = caja.getCenter(new THREE.Vector3());
    modelo.position.x -= centro.x;
    modelo.position.z -= centro.z;
    escena.add(modelo);

    const controles = new OrbitControls(camara, renderer.domElement);
    controles.enableDamping = true;
    controles.enablePan = false;
    controles.minDistance = 2;
    controles.maxDistance = 8;
    controles.maxPolarAngle = Math.PI / 2 - 0.05;
    controles.target.set(0, 0.7, 0);
    controles.autoRotateSpeed = 1.5;
    controles.autoRotate = autoRotarRef.current;
    controles.update();
    controlesRef.current = controles;

    const ajustarTamano = () => {
      const { clientWidth, clientHeight } = contenedor;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      camara.aspect = clientWidth / clientHeight;
      camara.updateProjectionMatrix();
    };
    ajustarTamano();
    const observador = new ResizeObserver(ajustarTamano);
    observador.observe(contenedor);

    renderer.setAnimationLoop(() => {
      controles.update();
      renderer.render(escena, camara);
    });

    return () => {
      renderer.setAnimationLoop(null);
      observador.disconnect();
      controles.dispose();
      controlesRef.current = null;
      liberarEscena(escena);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [tipo, color, errorWebGL]);

  useEffect(() => {
    autoRotarRef.current = autoRotar;
    if (controlesRef.current) controlesRef.current.autoRotate = autoRotar;
  }, [autoRotar]);

  useEffect(() => {
    if (!onClose) return undefined;
    const alPresionar = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onClose]);

  const reiniciarVista = () => {
    const controles = controlesRef.current;
    if (!controles) return;
    controles.object.position.copy(POSICION_CAMARA);
    controles.target.set(0, 0.7, 0);
    controles.update();
  };

  return (
    <div className="panel p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{titulo || `Visor 3D - ${tipo}`}</h3>
          <p className="text-xs text-white/60">Arrastra para rotar, usa la rueda o pellizca para acercar.</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="btn btn-xs btn-outline" aria-label="Cerrar visor 3D">
            Cerrar
          </button>
        )}
      </div>

      {errorWebGL ? (
        <p className="alert-error">Tu navegador no soporta WebGL; no se puede mostrar el modelo 3D.</p>
      ) : (
        <div
          ref={contenedorRef}
          className="w-full h-[50vh] min-h-64 max-h-[480px] rounded-lg overflow-hidden border border-white/10 touch-none"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setAutoRotar((v) => !v)} className="btn btn-xs btn-light" disabled={errorWebGL}>
          {autoRotar ? 'Pausar rotación' : 'Rotar automáticamente'}
        </button>
        <button type="button" onClick={reiniciarVista} className="btn btn-xs btn-outline" disabled={errorWebGL}>
          Reiniciar vista
        </button>
      </div>
    </div>
  );
}

export default Visor3D;
