export type ObjectType = string;
export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface SceneObject {
  id: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: 'cyan' | 'purple' | 'silver' | 'white' | 'purple-frosted' | 'cyan-frosted' | 'graphite';
  isMain: boolean;
}

export interface AppState {
  objects: SceneObject[];
}
