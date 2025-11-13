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
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'ellipse', label: 'Ellipse' },
  { id: 'star5', label: 'Five-point star' },
  { id: 'star4', label: 'Star of David' },
];

const SHAPE_SAFE_SCALE = {
  rectangle: 0.96,
  ellipse: 0.9,
  star5: 0.6,
  star4: 0.58,
};

const SHAPE_SAFE_BORDER_SCALE = {
  rectangle: 0.96,
  ellipse: 0.92,
  star5: 0.82,
  star4: 0.8,
};

const LABEL_SCALE_FACTOR = 0.75;

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
    case 'rectangle': {
      const rect = new THREE.Shape();
      rect.moveTo(-width / 2, -height / 2);
      rect.lineTo(width / 2, -height / 2);
      rect.lineTo(width / 2, height / 2);
      rect.lineTo(-width / 2, height / 2);
      rect.closePath();
      return rect;
    }
    case 'ellipse': {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, width / 2, height / 2, 0, Math.PI * 2, false, 0);
      return shape;
    }
    case 'star5':
      return buildStarShape(5, width, height);
    case 'star4':
      return buildStarShape(4, width, height, 0.5);
    default:
      return buildShape2D('rectangle', width, height);
  }
};

const assignMaterialGroups = (geometry) => {
  const { index, attributes } = geometry;
  const position = attributes?.position;
  if (!index || !position) {
    geometry.clearGroups();
    geometry.addGroup(0, attributes?.position?.count || 0, 0);
    geometry.groupsNeedUpdate = true;
    return;
  }

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  const frontZ = bbox?.max?.z ?? 0.1;
  const backZ = bbox?.min?.z ?? -0.1;
  const epsilon = Math.max(1e-4, (frontZ - backZ) * 0.01);

  geometry.clearGroups();
  const faceCount = index.count / 3;
  let currentMaterial = null;
  let segmentStart = 0;

  const materialForFace = (faceOffset) => {
    const a = index.getX(faceOffset);
    const b = index.getX(faceOffset + 1);
    const c = index.getX(faceOffset + 2);
    const avgZ = (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3;
    if (frontZ - avgZ < epsilon) return 0; // front cap
    if (avgZ - backZ < epsilon) return 2; // back cap
    return 1; // side wall
  };

  for (let face = 0; face < faceCount; face += 1) {
    const offset = face * 3;
    const materialIndex = materialForFace(offset);
    if (currentMaterial === null) {
      currentMaterial = materialIndex;
      segmentStart = offset;
    } else if (materialIndex !== currentMaterial) {
      geometry.addGroup(segmentStart, offset - segmentStart, currentMaterial);
      segmentStart = offset;
      currentMaterial = materialIndex;
    }

    if (face === faceCount - 1) {
      geometry.addGroup(segmentStart, index.count - segmentStart, currentMaterial);
    }
  }
  geometry.groupsNeedUpdate = true;
};

const remapFrontFaceUVs = (geometry) => {
  const position = geometry.attributes?.position;
  const normal = geometry.attributes?.normal;
  const uv = geometry.attributes?.uv;
  if (!position || !normal || !uv) {
    return;
  }

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  if (!bbox) {
    return;
  }

  const widthRange = Math.max(1e-3, bbox.max.x - bbox.min.x);
  const heightRange = Math.max(1e-3, bbox.max.y - bbox.min.y);

  for (let i = 0; i < position.count; i += 1) {
    const nz = normal.getZ(i);
    if (Math.abs(nz) > 0.5) {
      const x = position.getX(i);
      const y = position.getY(i);
      const u = (x - bbox.min.x) / widthRange;
      const v = (y - bbox.min.y) / heightRange;
      if (nz > 0) {
        uv.setXY(i, u, v);
      } else {
        uv.setXY(i, 1 - u, v);
      }
    }
  }
  uv.needsUpdate = true;
};

const createGeometryForShape = (shapeType, size) => {
  const { width, height, depth } = size;
  const shape2d = buildShape2D(shapeType, width, height);
  const geometry = new THREE.ExtrudeGeometry(shape2d, {
    depth,
    bevelEnabled: false,
    steps: 1,
    material: 0,
    extrudeMaterial: 1,
  });
  geometry.center();
  assignMaterialGroups(geometry);
  remapFrontFaceUVs(geometry);
  return geometry;
};

const build2dOutlinePoints = (shapeType, width, height) => {
  switch (shapeType) {
    case 'rectangle':
      return [
        [-width / 2, -height / 2],
        [width / 2, -height / 2],
        [width / 2, height / 2],
        [-width / 2, height / 2],
      ];
    case 'ellipse': {
      const steps = 64;
      const pts = [];
      for (let i = 0; i < steps; i += 1) {
        const theta = (i / steps) * Math.PI * 2;
        pts.push([(width / 2) * Math.cos(theta), (height / 2) * Math.sin(theta)]);
      }
      return pts;
    }
    case 'star5':
      return buildStarShape(5, width, height).getPoints(32).map((p) => [p.x, p.y]);
    case 'star4':
      return buildStarShape(4, width, height, 0.5).getPoints(32).map((p) => [p.x, p.y]);
    default:
      return [
        [-width / 2, -height / 2],
        [width / 2, -height / 2],
        [width / 2, height / 2],
        [-width / 2, height / 2],
      ];
  }
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
    async ({
      text,
      url: qrUrl,
      border: borderEnabled,
      slug: slugLabel,
      shape: shapeType,
      plateWidthCm,
      plateHeightCm,
    }) => {
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

      const plateWidth = Math.max(0.1, plateWidthCm || 10);
      const plateHeight = Math.max(0.1, plateHeightCm || 10);
      const plateWidthMm = plateWidth * 10;
      const plateHeightMm = plateHeight * 10;

      const safeZone = TEXTURE_RESOLUTION * 0.08;
      const workingWidth = TEXTURE_RESOLUTION - safeZone * 2;
      const workingHeight = TEXTURE_RESOLUTION - safeZone * 2;
      const safeScale = SHAPE_SAFE_SCALE[shapeType] ?? 0.85;
      const safeWidth = workingWidth * safeScale;
      const safeHeight = workingHeight * safeScale;
      const safeLeft = safeZone + (workingWidth - safeWidth) / 2;
      const safeTop = safeZone + (workingHeight - safeHeight) / 2;

      const aspect = plateHeight ? plateWidth / plateHeight : 1;
      const repeatX = aspect > 1 ? 1 / aspect : 1;
      const repeatY = aspect > 1 ? 1 : aspect;
      const offsetX = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
      const offsetY = aspect > 1 ? 0 : (1 - aspect) / 2;
      const texWidth = repeatX * TEXTURE_RESOLUTION;
      const texHeight = repeatY * TEXTURE_RESOLUTION;

      const mapPlateToCanvas = (x, y) => {
        const normX = plateWidth > 0 ? x / plateWidth + 0.5 : 0.5;
        const normY = plateHeight > 0 ? y / plateHeight + 0.5 : 0.5;
        return [
          offsetX * TEXTURE_RESOLUTION + normX * texWidth,
          offsetY * TEXTURE_RESOLUTION + normY * texHeight,
        ];
      };

      if (borderEnabled) {
        const insetMm = 1.5;
        const insetCm = insetMm / 10;
        const insetWidth = Math.max(plateWidth - insetCm * 2, plateWidth * 0.1);
        const insetHeight = Math.max(plateHeight - insetCm * 2, plateHeight * 0.1);
        const outline = build2dOutlinePoints(shapeType, insetWidth, insetHeight);
        if (outline.length) {
          const lineWidthMm = 2;
          const lineWidthPxX = (lineWidthMm / plateWidthMm) * texWidth;
          const lineWidthPxY = (lineWidthMm / plateHeightMm) * texHeight;
          ctx.lineWidth = Math.max(2, (lineWidthPxX + lineWidthPxY) / 2);
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          const [firstX, firstY] = outline[0];
          const [startX, startY] = mapPlateToCanvas(firstX, firstY);
          ctx.moveTo(startX, startY);
          for (let i = 1; i < outline.length; i += 1) {
            const [x, y] = outline[i];
            const [px, py] = mapPlateToCanvas(x, y);
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      const label = text.length ? text : 'Memorylife';
      let fontSize = safeWidth * 0.22 * LABEL_SCALE_FACTOR;
      ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
      const maxLabelWidth = safeWidth * 0.9;
      while (ctx.measureText(label).width > maxLabelWidth && fontSize > 34) {
        fontSize -= 4;
        ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
      }
      const labelY = safeTop + fontSize * 0.8;
      ctx.fillText(label, canvas.width / 2, labelY);

      const slugFontSize = Math.max(fontSize * 0.35, safeWidth * 0.07) * LABEL_SCALE_FACTOR;
      ctx.font = `500 ${slugFontSize}px 'Inter', sans-serif`;
      ctx.fillStyle = '#d1d5db';
      const slugY = labelY + slugFontSize * 1.2;
      ctx.fillText(slugLabel, canvas.width / 2, slugY);
      ctx.fillStyle = '#ffffff';

      const qrAvailableHeight = safeTop + safeHeight - slugY - slugFontSize * 0.8;
      const qrSize =
        Math.min(safeWidth, Math.max(qrAvailableHeight, safeHeight * 0.4)) * 0.92 * LABEL_SCALE_FACTOR;
      const spacingOffset = safeHeight * 0.05;
      const qrTopClamp = Math.max(slugY + slugFontSize * 0.6 + spacingOffset, safeTop);
      let qrTop = qrTopClamp;
      if (qrTop + qrSize > safeTop + safeHeight) {
        qrTop = safeTop + safeHeight - qrSize;
      }
      const qrLeft = canvas.width / 2 - qrSize / 2;
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
      ctx.drawImage(qrCanvas, qrLeft, qrTop, qrSize, qrSize);
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
        shape,
        plateWidthCm: dimensions.width,
        plateHeightCm: dimensions.height,
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

    // --- НАЧАЛО ИСПРАВЛЕНИЯ МАСШТАБИРОВАНИЯ ---
    // Логика масштабирования UV для вписывания квадратной текстуры (1024x1024)
    // в лицевую панель с размерами dimensions.width x dimensions.height
  const { width, height } = dimensions;
  const aspect = height ? width / height : 1;

    // Текстура должна быть привязана к краям, а не повторяться
    engravingTexture.wrapS = THREE.ClampToEdgeWrapping;
    engravingTexture.wrapT = THREE.ClampToEdgeWrapping;

    if (aspect > 1) {
      // Табличка шире, чем выше
      engravingTexture.repeat.set(1 / aspect, 1);
      engravingTexture.offset.set((1 - 1 / aspect) / 2, 0);
    } else {
      // Табличка выше (или квадрат)
      engravingTexture.repeat.set(1, aspect);
      engravingTexture.offset.set(0, (1 - aspect) / 2);
    }
    // --- КОНЕЦ ИСПРАВЛЕНИЯ МАСШТАБИРОВАНИЯ ---

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
    materialInstance.side = THREE.FrontSide;

    disposeMaterial(state.plaqueMesh.material);

    const sideMaterial = materialInstance.clone();
    sideMaterial.map = null;
    sideMaterial.bumpMap = null;
    sideMaterial.roughnessMap = material === 'matte' ? sideMaterial.roughnessMap : null;
    sideMaterial.metalnessMap = null;
    sideMaterial.side = THREE.DoubleSide;

    const backMaterial = sideMaterial.clone();
    backMaterial.side = THREE.BackSide;

    if (state.plaqueMesh.geometry.isExtrudeGeometry && state.plaqueMesh.geometry.groups.length) {
      for (const group of state.plaqueMesh.geometry.groups) {
        if (group.materialIndex === undefined || group.materialIndex === null) {
          group.materialIndex = 1;
        }
      }
    }

    state.plaqueMesh.material = [materialInstance, sideMaterial, backMaterial];
    capturePreview();
  }, [
    border,
    capturePreview,
    dimensions.height,
    dimensions.width,
    engravingSlug,
    engravingText,
    engravingUrl,
    generateEngravingCanvas,
    material,
    shape,
  ]);

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

          <label
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Plate shape
            <select
              value={shape}
              onChange={(event) => setShape(event.target.value)}
              className={`${controlInputClasses} cursor-pointer`}
            >
              {SHAPE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

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
