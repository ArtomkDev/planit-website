export const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse2D;
  uniform vec3 uCameraPos;
  uniform float uMouseActive;
  uniform float uEntrance;
  uniform int uShape1;
  uniform int uShape2;
  uniform float uMorph;
  uniform float uExplosion;
  uniform float uAspect;

  attribute vec3 aSeed;
  attribute vec3 aRandomDir;

  varying vec3 vWorldPosition;
  varying float vHighlight;
  varying float vDepth;

  vec3 getShapePos(int mode, vec3 seed, float time) {
    float u = seed.x * 6.2831853;
    float v = seed.y * 6.2831853;
    float r = seed.z;

    if (mode == 0) {
      float p = 3.0;
      float q = 4.0;
      float rad = 18.0 + (r - 0.5) * 8.0;
      return vec3(
        (rad + 6.0 * cos(v)) * cos(p * u),
        (rad + 6.0 * cos(v)) * sin(p * u),
        6.0 * sin(v) + sin(q * u) * 18.0
      );
    } else if (mode == 1) {
      float x = (seed.x - 0.5) * 180.0;
      float y = (fract(seed.y - time * 0.15) - 0.5) * 120.0;
      float z = (r - 0.5) * 15.0;
      return vec3(x, y, z);
    } else if (mode == 2) {
      float path = (seed.x - 0.5) * 140.0;
      float spread = r * 18.0;
      float angle = seed.y * 6.2831853 + time * 1.5;
      return vec3(
        path,
        sin(path * 0.1 + time) * 20.0 + cos(angle) * spread,
        cos(path * 0.1 + time) * 20.0 + sin(angle) * spread
      );
    } else if (mode == 3) {
      float h = seed.x;
      float size = (1.0 - h) * 45.0;
      return vec3(
        (seed.y - 0.5) * size,
        (h - 0.5) * 45.0,
        (r - 0.5) * size
      );
    } else if (mode == 4) {
      float h = (seed.x - 0.5) * 100.0;
      float angle = seed.x * 40.0 + time * 3.0;
      float rad = 20.0;
      float strand = step(0.5, seed.y) * 3.14159;
      return vec3(
        rad * cos(angle + strand) + (r - 0.5) * 6.0,
        h,
        rad * sin(angle + strand) + (r - 0.5) * 6.0
      );
    } else {
      float R = 28.0;
      float r2 = 12.0 * r;
      return vec3(
        (R + r2 * cos(v)) * cos(u),
        (R + r2 * cos(v)) * sin(u),
        r2 * sin(v)
      );
    }
  }

  void main() {
    vec3 pos1 = getShapePos(uShape1, aSeed, uTime);
    vec3 pos2 = getShapePos(uShape2, aSeed, uTime);
    vec3 basePos = mix(pos1, pos2, uMorph);

    vec3 eps = vec3(0.001, 0.0, 0.0);
    vec3 pos1_eps = getShapePos(uShape1, aSeed + eps, uTime);
    vec3 pos2_eps = getShapePos(uShape2, aSeed + eps, uTime);
    vec3 basePos_eps = mix(pos1_eps, pos2_eps, uMorph);

    vec3 tangent = normalize(basePos_eps - basePos);
    if (length(tangent) < 0.01) tangent = vec3(1.0, 0.0, 0.0);
    
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, tangent));
    if (length(right) < 0.01) right = vec3(0.0, 0.0, 1.0);
    vec3 realUp = cross(tangent, right);

    mat3 rotation = mat3(right, realUp, tangent);
    vec3 localPosition = rotation * position;

    float scatterDist = (1.0 - uEntrance) * 300.0 + (uExplosion * 80.0);
    vec3 scatteredPos = basePos + aRandomDir * scatterDist;

    vec3 instanceCenter = (modelMatrix * vec4(scatteredPos, 1.0)).xyz;

    vec4 viewPos = viewMatrix * vec4(instanceCenter, 1.0);
    vec4 clipPos = projectionMatrix * viewPos;
    vec2 ndcPos = clipPos.xy / clipPos.w;

    vec2 aspectMouse = uMouse2D * vec2(uAspect, 1.0);
    vec2 aspectNdc = ndcPos * vec2(uAspect, 1.0);
    
    float dist2D = length(aspectNdc - aspectMouse);
    float depthFactor = smoothstep(-70.0, -10.0, viewPos.z);
    
    float influence = (1.0 - smoothstep(0.0, 0.25, dist2D)) * uMouseActive * uEntrance * depthFactor;

    vec4 worldPos = vec4(instanceCenter + mat3(modelMatrix) * localPosition, 1.0);

    if (influence > 0.0) {
      vec3 pushDir = normalize(vec3((ndcPos - uMouse2D) * vec2(uAspect, 1.0), 1.0));
      worldPos.xyz += pushDir * influence * 18.0; 
      worldPos.xyz += cross(pushDir, vec3(0.0, 0.0, 1.0)) * influence * 8.0;
    }

    float wave = sin(uTime * 3.0 + worldPos.x * 0.1) * cos(uTime * 2.0 + worldPos.y * 0.1);
    worldPos.xyz += normalize(worldPos.xyz) * wave * 2.0 * uEntrance;

    vWorldPosition = worldPos.xyz;
    vHighlight = influence;
    vDepth = depthFactor;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const fragmentShader = `
  varying vec3 vWorldPosition;
  varying float vHighlight;
  varying float vDepth;
  
  uniform float uTime;
  uniform float uExplosion;
  uniform int uPalette1;
  uniform int uPalette2;
  uniform float uMorph;

  vec3 hex(int rgb) {
    return vec3(float((rgb >> 16) & 255) / 255.0, float((rgb >> 8) & 255) / 255.0, float(rgb & 255) / 255.0);
  }

  vec3 getPaletteColor(int pal, float t) {
    vec3 c1, c2, c3;
    
    if (pal == 0) {
      c1 = hex(0x3EF7D2);
      c2 = hex(0xF45B8A);
      c3 = hex(0x1E1B4B); 
    } else if (pal == 1) {
      c1 = hex(0x991B1B);
      c2 = hex(0x09090B);
      c3 = hex(0xEF4444);
    } else if (pal == 2) {
      c1 = hex(0x06B6D4);
      c2 = hex(0x3EF7D2);
      c3 = hex(0x1D4ED8);
    } else if (pal == 3) {
      c1 = hex(0xF59E0B);
      c2 = hex(0x451A03);
      c3 = hex(0xFDE68A);
    } else if (pal == 4) {
      c1 = hex(0x8B5CF6);
      c2 = hex(0xF45B8A);
      c3 = hex(0x4C1D95);
    } else {
      c1 = hex(0x3EF7D2);
      c2 = hex(0x09090B);
      c3 = hex(0xF45B8A);
    }

    float mix1 = sin(t * 6.2831853) * 0.5 + 0.5;
    vec3 base = mix(c1, c2, mix1);
    return mix(base, c3, cos(t * 12.56637) * 0.5 + 0.5);
  }

  void main() {
    float t = fract(((vWorldPosition.x + vWorldPosition.y) / 80.0) + (uTime * 0.08));

    vec3 color1 = getPaletteColor(uPalette1, t);
    vec3 color2 = getPaletteColor(uPalette2, t);
    vec3 baseColor = mix(color1, color2, uMorph);

    vec3 explodeColor = vec3(1.0, 0.9, 0.7);
    baseColor = mix(baseColor, explodeColor, uExplosion * 0.85);

    vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), vHighlight * 0.95);

    float dist = length(vWorldPosition);
    float alpha = smoothstep(85.0, 15.0, dist) * smoothstep(2.0, 15.0, dist);

    alpha = clamp(alpha + vHighlight * 0.9, 0.0, 1.0);
    finalColor *= mix(0.15, 1.0, vDepth);

    gl_FragColor = vec4(finalColor, alpha * (1.0 - uExplosion * 0.4));
  }
`;