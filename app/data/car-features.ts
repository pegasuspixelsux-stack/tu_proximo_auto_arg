export interface CarFeature {
  id: string;
  label: string;
}

export const COMMON_CAR_FEATURES: CarFeature[] = [
  { id: "climateControl", label: "Aire acondicionado / Climatizador" },
  { id: "powerSteering", label: "Dirección asistida" },
  { id: "powerWindows", label: "Alzacristales eléctricos" },
  { id: "centralLocking", label: "Cierre centralizado" },
  { id: "leatherSeats", label: "Asientos de cuero" },
  { id: "sunroof", label: "Techo solar / Panorámico" },
  { id: "cruiseControl", label: "Control de crucero" },
  { id: "touchscreen", label: "Pantalla táctil multimedia" },
  { id: "carPlayAndroidAuto", label: "Apple CarPlay / Android Auto" },
  { id: "bluetooth", label: "Conexión Bluetooth" },
  { id: "backupCamera", label: "Cámara de reversa" },
  { id: "parkingSensors", label: "Sensores de estacionamiento" },
  { id: "absBrakes", label: "Frenos ABS" },
  { id: "stabilityControl", label: "Control de estabilidad (ESP)" },
  { id: "airbags", label: "Airbags" },
  { id: "isofix", label: "Anclajes ISOFIX" },
  { id: "alloyWheels", label: "Llantas de aleación" },
  { id: "ledHeadlights", label: "Faros LED" },
  { id: "fogLights", label: "Faros antiniebla" },
];

export const CAR_FEATURE_LABEL = Object.fromEntries(
  COMMON_CAR_FEATURES.map((f) => [f.id, f.label]),
) as Record<string, string>;
