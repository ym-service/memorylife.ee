import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import QRCode from 'qrcode';
import { useTheme } from '../context/ThemeContext.jsx';

const TEXTURE_RESOLUTION = 1024;
const MATERIALS = [
  { id: 'steel', label: 'Steel' },
  { id: 'copper', label: 'Copper' },
  { id: 'matte', label: 'Matte steel' },
];

const SHAPE_OPTIONS = [
  { id: 'ellipse', label: 'Элипсообразная' },
  { id: 'star5', label: 'Звезда 5-конечная' },
  { id: 'star4', label: '4-конечная звезда Давида' },
];

const defaultDimensions = { width: 10, height: 10, depth: 0.2 };

const buildStarShape = (points, width, height, innerScale = 0.45) => {
  const shape = new THREE.Shape();
  const outerRadiusX = width / 2;
  const outerRadiusY = height / 2;
  const innerRadiusX = outerRadiusX * innerScale;
  const innerRadiusY = outerRadiusY * innerScale;
  const totalPoints = points * 2;
  const step = (Math.PI * 2) / totalPoints;

  for (let i = 0; i < totalPoints; i += 1) {
    const angle = i * step - Math.PI / 2;
    const useOuter = i % 2 === 0;
    const radiusX = useOuter ? outerRadiusX : innerRadiusX;
    const radiusY = useOuter ? outerRadiusY : innerRadiusY;
    const x = radiusX * Math.cos(angle);
    const y = radiusY * Math.sin(angle);
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
};

const buildShape2D = (shapeType, width, height) => {
  switch (shapeType) {
    case 'ellipse': {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, width / 2, height / 2, 0, Math.PI * 2, false, 0);
      return shape;
    }
    case 'star5':
      return buildStarShape(5, width, height);
    case 'star4':
      return buildStarShape(4, width, height, 0.5);
    default: {
      const rect = new THREE.Shape();
      rect.moveTo(-width / 2, -height / 2);
      rect.lineTo(width / 2, -height / 2);
      rect.lineTo(width / 2, height / 2);
      rect.lineTo(-width / 2, height / 2);
      rect.closePath();
      return rect;
    }
  }
};

const createGeometryForShape = (shapeType, size) => {
  const { width, height, depth } = size;
  const shape2d = buildShape2D(shapeType, width, height);
  const geometry = new THREE.ExtrudeGeometry(shape2d, {
    depth,
    bevelEnabled: false,
    steps: 1,
  });
  geometry.center();
  return geometry;
};

const PlatePreview = ({ title, url, slug, onOptionsChange, onSnapshot }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const engravingCanvasRef = useRef(null);
  const snapshotCallbackRef = useRef(onSnapshot);

  const [material, setMaterial] = useState('steel');
  const [border, setBorder] = useState(false);
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const [shape, setShape] = useState(SHAPE_OPTIONS[0].id);

  const engravingText = (title || 'Memorylife').trim();
  const engravingUrl = (url || 'https://memorylife.local/legacy/sample').trim();
  const engravingSlug = (slug || 'legacy-preview').trim();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    snapshotCallbackRef.current = onSnapshot;
  }, [onSnapshot]);

  const dimensionFields = useMemo(
    () => [
      { id: 'width', label: 'Width (cm)', min: 6, max: 30, step: 0.5 },
      { id: 'height', label: 'Height (cm)', min: 6, max: 25, step: 0.5 },
      {
        id: 'depth',
        label: 'Thickness (mm)',
        min: 1,
        max: 20,
        step: 0.5,
        toDisplay: (value) => parseFloat((value * 10).toFixed(2)),
        toState: (value) => value / 10,
      },
    ],
    []
  );

  const disposeMaterial = (mat) => {
    if (!mat) return;
    const list = Array.isArray(mat) ? mat : [mat];
    list.forEach((m) => {
      ['map', 'bumpMap', 'roughnessMap', 'metalnessMap'].forEach((key) => {
        if (m[key]) {
          m[key].dispose();
          m[key] = null;
        }
      });
      m.dispose();
    });
  };

  const initializeScene = useCallback(() => {
    if (!canvasRef.current || typeof window === 'undefined') {
      return;
    }

    const canvas = canvasRef.current;
    const parent = canvas.parentElement || canvas;
    const width = parent.clientWidth || 480;
    const height = width * 0.75;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(25, 25, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 80;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(1, 1.2, 1);
    scene.add(directional);

    const geometry = createGeometryForShape(SHAPE_OPTIONS[0].id, defaultDimensions);
    const placeholderMaterial = new THREE.MeshStandardMaterial({ color: 0x5a6072 });
    const plaqueMesh = new THREE.Mesh(geometry, placeholderMaterial);
    scene.add(plaqueMesh);

    const state = {
      scene,
      camera,
      renderer,
      controls,
      plaqueMesh,
      engravingTexture: null,
      animationFrame: null,
      currentMaterial: placeholderMaterial,
      revision: 0,
    };

    new RGBELoader()
      .setPath('https://threejs.org/examples/textures/equirectangular/')
      .load('venice_sunset_1k.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
      });

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      state.animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const resizeRenderer = () => {
      if (!canvas.parentElement) return;
      const parentWidth = canvas.parentElement.clientWidth || width;
      const parentHeight = parentWidth * 0.75;
      renderer.setSize(parentWidth, parentHeight, false);
      renderer.setPixelRatio(window.devicePixelRatio);
      camera.aspect = parentWidth / parentHeight;
      camera.updateProjectionMatrix();
    };

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(resizeRenderer);
      observer.observe(canvas.parentElement);
      state.resizeObserver = observer;
    } else {
      window.addEventListener('resize', resizeRenderer);
      state.windowResizeHandler = resizeRenderer;
    }

    resizeRenderer();
    stateRef.current = state;

    return () => {
      if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
      if (state.resizeObserver) state.resizeObserver.disconnect();
      if (state.windowResizeHandler) window.removeEventListener('resize', state.windowResizeHandler);
      controls.dispose();
      renderer.dispose();
      disposeMaterial(state.plaqueMesh.material);
      state.plaqueMesh.geometry.dispose();
      if (state.engravingTexture) state.engravingTexture.dispose();
      state.scene.clear();
      stateRef.current = null;
    };
  }, []);

  const capturePreview = useCallback(() => {
    const state = stateRef.current;
    if (!state?.renderer || !snapshotCallbackRef.current) {
      return;
    }
    try {
      const dataUrl = state.renderer.domElement.toDataURL('image/png');
      snapshotCallbackRef.current(dataUrl);
    } catch (error) {
      console.error('Failed to capture preview', error);
    }
  }, []);

  const createBrushedTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_RESOLUTION;
    canvas.height = TEXTURE_RESOLUTION;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d9dfe6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1800; i += 1) {
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y + Math.random() * 8 - 4);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    return texture;
  };

  const combineTextures = (baseTexture, engravingCanvas) => {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_RESOLUTION;
    canvas.height = TEXTURE_RESOLUTION;
    const ctx = canvas.getContext('2d');
    if (baseTexture.image) {
      ctx.drawImage(baseTexture.image, 0, 0, canvas.width, canvas.height);
    }
    if (engravingCanvas) {
      const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const engravingData = engravingCanvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const pixels = baseData.data;
      const engravingPixels = engravingData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        if (engravingPixels[i] > 180) {
          pixels[i] = Math.min(255, pixels[i] + 35);
          pixels[i + 1] = Math.min(255, pixels[i + 1] + 35);
          pixels[i + 2] = Math.min(255, pixels[i + 2] + 35);
        }
      }
      ctx.putImageData(baseData, 0, 0);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  const generateEngravingCanvas = useCallback(
    async ({ text, url: qrUrl, border: borderEnabled, slug: slugLabel }) => {
      if (!engravingCanvasRef.current) {
        engravingCanvasRef.current = document.createElement('canvas');
      }
      const canvas = engravingCanvasRef.current;
      canvas.width = TEXTURE_RESOLUTION;
      canvas.height = TEXTURE_RESOLUTION;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (borderEnabled) {
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, canvas.width - ctx.lineWidth * 2, canvas.height - ctx.lineWidth * 2);
      }

      const label = text.length ? text : 'Memorylife';
      let fontSize = 140;
      ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
      while (ctx.measureText(label).width > canvas.width * 0.8 && fontSize > 30) {
        fontSize -= 6;
        ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
      }
      ctx.fillText(label, canvas.width / 2, canvas.height * 0.18);

      ctx.font = `500 ${Math.max(36, fontSize * 0.4)}px 'Inter', sans-serif`;
      ctx.fillStyle = '#d1d5db';
      ctx.fillText(slugLabel, canvas.width / 2, canvas.height * 0.28);
      ctx.fillStyle = '#ffffff';

      const qrSize = TEXTURE_RESOLUTION * 0.5;
      const qrCanvas = document.createElement('canvas');
      try {
        await QRCode.toCanvas(qrCanvas, qrUrl || 'https://memorylife.local', {
          width: qrSize,
          margin: 0,
          color: {
            dark: '#ffffff',
            light: '#000000',
          },
          errorCorrectionLevel: 'M',
        });
      } catch (err) {
        console.error('QR generation failed', err);
      }
      ctx.drawImage(qrCanvas, (canvas.width - qrSize) / 2, canvas.height * 0.38, qrSize, qrSize);
      return canvas;
    },
    []
  );

  const updateGeometry = useCallback(
    (size, selectedShape) => {
      const state = stateRef.current;
      if (!state?.plaqueMesh) {
        return;
      }
      state.plaqueMesh.geometry.dispose();
      state.plaqueMesh.geometry = createGeometryForShape(selectedShape, size);
      const cameraDistance = Math.max(size.width, size.height) * 1.6;
      state.camera.position.set(cameraDistance, cameraDistance, cameraDistance);
      state.controls.target.set(0, 0, 0);
      state.controls.update();
      capturePreview();
    },
    [capturePreview]
  );

  const updateMaterial = useCallback(async () => {
    const state = stateRef.current;
    if (!state?.plaqueMesh) {
      return;
    }
    const revision = state.revision + 1;
    state.revision = revision;

    let engravingCanvas;
    try {
      engravingCanvas = await generateEngravingCanvas({
        text: engravingText,
        url: engravingUrl,
        border,
        slug: engravingSlug,
      });
    } catch (err) {
      console.error('Failed to build engraving map', err);
      return;
    }

    if (state.revision !== revision) {
      return;
    }

    const engravingTexture = new THREE.CanvasTexture(engravingCanvas);
    engravingTexture.magFilter = THREE.NearestFilter;
    engravingTexture.minFilter = THREE.NearestFilter;

    if (state.engravingTexture) {
      state.engravingTexture.dispose();
    }
    state.engravingTexture = engravingTexture;

    const bumpScale = 0.05;
    let materialInstance;

    if (material === 'copper' || material === 'steel') {
      const isCopper = material === 'copper';
      materialInstance = new THREE.MeshPhysicalMaterial({
        color: isCopper ? 0xb87333 : 0xc0c0c0,
        metalness: isCopper ? 0.9 : 1.0,
        roughness: isCopper ? 0.3 : 0.2,
        clearcoat: isCopper ? 0.5 : 0.3,
        clearcoatRoughness: isCopper ? 0.2 : 0.1,
        roughnessMap: engravingTexture,
        metalnessMap: engravingTexture,
        bumpMap: engravingTexture,
        bumpScale,
        envMapIntensity: 1,
      });

      materialInstance.roughnessMap.magFilter = THREE.NearestFilter;
      materialInstance.roughnessMap.minFilter = THREE.NearestFilter;
      materialInstance.metalnessMap.magFilter = THREE.NearestFilter;
      materialInstance.metalnessMap.minFilter = THREE.NearestFilter;
    } else {
      const brushedTexture = createBrushedTexture();
      materialInstance = new THREE.MeshPhysicalMaterial({
        color: 0xd7d9de,
        metalness: 0.35,
        roughness: 0.85,
        map: engravingTexture,
        roughnessMap: brushedTexture,
        bumpMap: engravingTexture,
        bumpScale: -bumpScale,
        clearcoat: 0.04,
        clearcoatRoughness: 0.7,
        envMapIntensity: 0.3,
      });
    }

    disposeMaterial(state.plaqueMesh.material);

    if (material === 'copper' || material === 'steel') {
      const baseMaterial = materialInstance.clone();
      baseMaterial.map = null;
      baseMaterial.bumpMap = null;
      baseMaterial.roughnessMap = null;
      baseMaterial.metalnessMap = null;
      state.plaqueMesh.material = [
        baseMaterial.clone(),
        baseMaterial.clone(),
        baseMaterial.clone(),
        baseMaterial.clone(),
        materialInstance,
        baseMaterial.clone(),
      ];
    } else {
      const baseMaterial = materialInstance.clone();
      baseMaterial.map = null;
      baseMaterial.bumpMap = null;
      state.plaqueMesh.material = [
        baseMaterial.clone(),
        baseMaterial.clone(),
        baseMaterial.clone(),
        baseMaterial.clone(),
        materialInstance,
        baseMaterial.clone(),
      ];
    }
    capturePreview();
  }, [border, capturePreview, engravingSlug, engravingText, engravingUrl, generateEngravingCanvas, material]);

  useEffect(() => {
    const cleanup = initializeScene();
    return cleanup;
  }, [initializeScene]);

  useEffect(() => {
    updateGeometry(dimensions, shape);
  }, [dimensions, shape, updateGeometry]);

  useEffect(() => {
    updateMaterial();
  }, [updateMaterial]);

  useEffect(() => {
    const timeout = setTimeout(() => capturePreview(), 600);
    return () => clearTimeout(timeout);
  }, [capturePreview]);

  useEffect(() => {
    if (!onOptionsChange) {
      return;
    }
    onOptionsChange({
      material,
      border,
      shape,
      widthCm: parseFloat(dimensions.width.toFixed(2)),
      heightCm: parseFloat(dimensions.height.toFixed(2)),
      thicknessMm: parseFloat((dimensions.depth * 10).toFixed(2)),
    });
  }, [
    border,
    dimensions.depth,
    dimensions.height,
    dimensions.width,
    material,
    shape,
    onOptionsChange,
  ]);

  const handleDimensionChange = (field, value) => {
    const numeric = parseFloat(value);
    setDimensions((prev) => ({
      ...prev,
      [field.id]: Number.isNaN(numeric)
        ? prev[field.id]
        : field.toState
        ? field.toState(numeric)
        : numeric,
    }));
  };

  if (typeof window === 'undefined') {
    return null;
  }

  const controlInputClasses = `mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
    isDark
      ? 'border-white/10 bg-white/5 text-white focus:border-brand-400 focus:ring-brand-400/30'
      : 'border-slate-300 bg-white text-slate-900 focus:border-brand-500 focus:ring-brand-200'
  }`;

  const getDisplayValue = (field) =>
    field.toDisplay && typeof field.toDisplay === 'function'
      ? field.toDisplay(dimensions[field.id])
      : dimensions[field.id];

  return (
    <div
      className={`rounded-[2.2rem] p-[2px] ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)]'
          : 'bg-gradient-to-br from-slate-200 via-slate-100 to-white shadow-card'
      }`}
    >
      <div
        className={`rounded-[2.1rem] p-6 ${
          isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
        }`}
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-brand-300">Memorylife</p>
          <h2 className="text-2xl font-semibold">{engravingText}</h2>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-300">3D QR plaque preview</p>
        </div>
        <div
          className={`mt-5 overflow-hidden rounded-3xl ${
            isDark ? 'bg-slate-900/40' : 'bg-slate-100'
          }`}
        >
          <canvas ref={canvasRef} className="block h-[320px] w-full" />
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">Material</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {MATERIALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMaterial(item.id)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                    material === item.id
                      ? isDark
                        ? 'border-brand-400 bg-white/10 text-white'
                        : 'border-brand-500 bg-brand-50 text-brand-700'
                      : isDark
                      ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">Форма</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {SHAPE_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setShape(item.id)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                    shape === item.id
                      ? isDark
                        ? 'border-brand-400 bg-white/10 text-white'
                        : 'border-brand-500 bg-brand-50 text-brand-700'
                      : isDark
                      ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {dimensionFields.map((field) => (
              <label
                key={field.id}
                className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {field.label}
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={getDisplayValue(field)}
                  onChange={(event) => handleDimensionChange(field, event.target.value)}
                  className={controlInputClasses}
                />
              </label>
            ))}
          </div>

          <label
            className={`flex items-center gap-3 text-sm font-medium ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={border}
              onChange={(event) => setBorder(event.target.checked)}
              className={`h-4 w-4 rounded  text-brand-400 focus:ring-brand-400 ${
                isDark ? 'border-white/30 bg-transparent' : 'border-slate-300 bg-white'
              }`}
            />
            Engraved border
          </label>

          <div
            className={`rounded-2xl border border-dashed p-4 text-sm ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-200'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <p className="font-semibold">Live QR URL:</p>
            <p className="break-all text-sm">{engravingUrl}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-brand-400">
              Slug: {engravingSlug}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatePreview;
