import { SceneObject } from '../types';

export function generatePrompt(objects: SceneObject[], bgColor: string = 'white'): string {
  const mainObj = objects.find(o => o.isMain);
  const secondaryObjs = objects.filter(o => !o.isMain);

  if (!mainObj) return "Please add a main object.";

  const style = "STYLE: Very Simple Minimalistic Playful UI Fintech Aesthetic 3d render, without small details and any text. Vivid contrast.";
  const view = "VIEW: front 3/4 orthographic view, no perspective, no isometry.";
  
  const composition = generateComposition(mainObj, secondaryObjs);
  
  const material = "MATERIAL: big very matte metallic for main object and very matte silver metallic shader for additional objects.";
  const lighting = "LIGHTING: very soft matte contrast studio lighting with soft rim light";
  const colors = "COLOR PALETTE: Cyan #19BCE5 (dark tint - 054777), Purple #DB6EEE (dark tint - 962AD5) , Light Beige #F1EEE4, Graphite #1F282C.";
  const background = `BACKGROUND: flat ${bgColor} color.`;
  const aspect = "ASPECT RATIO of image is 1:1";

  return `${style}\n${view}\n${composition}\n${material}\n${lighting}\n${colors}\n${background}\n${aspect}`;
}

function generateComposition(main: SceneObject, secondaries: SceneObject[]): string {
  let text = `COMPOSITION: A ${getRotationDesc(main.rotation)} ${getSizeDesc(main.scale)} ${getColorDesc(main.color)} ${main.type}`;
  
  const mainType = main.type.toLowerCase();
  if (mainType.includes('telephone')) text += " 1990s cyberpunk telephone handset with sharp medium-sized round bevel, without wire and buttons";
  if (mainType.includes('credit card')) text += " horizontally blank front side of silver credit card with a small flat white circle printed on it (5% offset from top right corner)";

  secondaries.forEach((obj, index) => {
    const posDesc = getRelativePosition(obj.position, main.position);
    const rotDesc = getRotationDesc(obj.rotation, main.rotation);
    const colorDesc = getColorDesc(obj.color);
    
    text += `. And layered on ${posDesc} of a main object is a ${colorDesc} ${getSizeDesc(obj.scale)} ${obj.type}`;
    const objType = obj.type.toLowerCase();
    if (objType.includes('cursor')) text += " (with rounded corners with metallic thin shell on its contour)";
    if (objType.includes('label')) text += " horizontal label with round corners and five white asteriks typed on it";
    
    text += ` which is ${rotDesc}`;
  });

  return text + ".";
}

function getRotationDesc(rotation: [number, number, number], relativeTo?: [number, number, number]): string {
  const [x, y, z] = rotation;
  const rx = Math.round((x * 180) / Math.PI);
  const ry = Math.round((y * 180) / Math.PI);
  const rz = Math.round((z * 180) / Math.PI);
  
  let desc = "hovering";
  
  // Basic orientation
  if (Math.abs(rx) < 10 && Math.abs(ry) < 10 && Math.abs(rz) < 10) {
    desc = "perfectly upright";
  } else {
    const parts = [];
    if (Math.abs(rz) > 10) parts.push(`tilted ${rz}deg on its Z-axis`);
    if (Math.abs(rx) > 10) parts.push(`pitched ${rx}deg on its X-axis`);
    if (Math.abs(ry) > 10) parts.push(`yawed ${ry}deg on its Y-axis`);
    desc = parts.join(", ");
  }

  if (relativeTo) {
    // Simple logic to see if it's "facing" the main object
    // This is a bit of a stretch for a prompt but let's try to add "angled towards the center"
    desc += " and dynamically angled in space";
  }

  return desc;
}

function getSizeDesc(scale: number): string {
  const baseSize = 1.0;
  const ratio = scale / baseSize;
  if (ratio > 1.5) return "extra large";
  if (ratio > 1.2) return "large";
  if (ratio < 0.5) return "tiny";
  if (ratio < 0.8) return "small";
  return "medium-sized";
}

function getColorDesc(color: string): string {
  switch (color) {
    case 'cyan': return "cyan-colored #19BCE5";
    case 'purple': return "vivid purple #DB6EEE";
    case 'silver': return "silver-colored";
    case 'purple-frosted': return "light-purple frosted glass";
    case 'cyan-frosted': return "light-cyan frosted glass";
    case 'graphite': return "graphite-colored #1F282C";
    default: return "white";
  }
}

function getRelativePosition(pos: [number, number, number], mainPos: [number, number, number]): string {
  const dx = pos[0] - mainPos[0];
  const dy = pos[1] - mainPos[1];
  const dz = pos[2] - mainPos[2];

  let horizontal = "";
  if (dx < -0.1) horizontal = "left";
  else if (dx > 0.1) horizontal = "right";

  let vertical = "";
  if (dy < -0.1) vertical = "bottom";
  else if (dy > 0.1) vertical = "top";

  let depth = "";
  if (dz < -0.1) depth = "behind";
  else if (dz > 0.1) depth = "in front";

  const offsetX = Math.round(Math.abs(dx) * 100);
  const offsetY = Math.round(Math.abs(dy) * 100);
  const offsetZ = Math.round(Math.abs(dz) * 100);

  let parts = [];
  if (horizontal) parts.push(`${horizontal} (${offsetX}% from center)`);
  if (vertical) parts.push(`${vertical} (${offsetY}% from center)`);
  if (depth) parts.push(`${depth} (${offsetZ}% from center)`);

  if (parts.length === 0) return "on top";
  return parts.join(" ");
}
