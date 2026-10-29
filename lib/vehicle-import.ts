import { COMMON_CAR_FEATURES } from "@/app/data/car-features";
import {
  vehicleReference,
  type BodyType,
  type Dealership,
  type FuelType,
  type SellerType,
  type Vehicle,
} from "@/app/data/vehicles";

// Bulk inventory import: a plain one-sheet Excel/Sheets table whose columns map
// onto the Vehicle model. Photos are not part of it: imported vehicles are
// created without photos and stay hidden from the public site until photos are
// uploaded from the edit modal.

export const TEMPLATE_FILE_NAME = "Plantilla_Carga_Inventario_Vehiculos.xlsx";

const KM_PER_MILE = 1.60934;
const BODY_TYPES: BodyType[] = ["Auto", "SUV", "Deportivo", "Clásico", "Moto"];
const TRANSMISSIONS = ["Automática", "Manual"];
const FUELS: Record<string, FuelType> = {
  Nafta: "Gasoline",
  Diésel: "Diesel",
  Híbrido: "Hybrid",
  Eléctrico: "Electric",
};
const CURRENCIES = ["USD", "ARS"] as const;
const SELLERS: Record<string, SellerType> = {
  Concesionaria: "dealer",
  Particular: "private",
};
type Column = {
  key: string;
  header: string;
  width: number;
  /** Fixed choices, offered as a dropdown in the template. */
  options?: string[];
  wrap?: boolean;
};

export const COLUMNS: Column[] = [
  { key: "reference", header: "Referencia", width: 14 },
  { key: "bodyType", header: "Tipo_Vehiculo", width: 16, options: BODY_TYPES },
  { key: "make", header: "Marca", width: 16 },
  { key: "model", header: "Modelo", width: 18 },
  { key: "version", header: "Version", width: 20 },
  { key: "year", header: "Año", width: 8 },
  { key: "km", header: "Kilometraje", width: 14 },
  { key: "transmission", header: "Transmision", width: 14, options: TRANSMISSIONS },
  { key: "fuel", header: "Combustible", width: 14, options: Object.keys(FUELS) },
  { key: "color", header: "Color", width: 14 },
  { key: "price", header: "Precio", width: 14 },
  { key: "currency", header: "Moneda", width: 10, options: [...CURRENCIES] },
  { key: "warranty", header: "Garantia", width: 18 },
  { key: "special", header: "Condicion_Especial", width: 22 },
  { key: "seller", header: "Tipo_Vendedor", width: 16, options: Object.keys(SELLERS) },
  { key: "dealership", header: "Concesionaria", width: 22 },
  { key: "location", header: "Ubicacion", width: 22 },
  { key: "sellerPhone", header: "Telefono_Vendedor", width: 18 },
  { key: "badge", header: "Etiqueta", width: 14 },
  { key: "features", header: "Equipamiento", width: 30, wrap: true },
  { key: "description", header: "Descripcion", width: 48, wrap: true },
];

const SAMPLES: Record<string, string | number>[] = [
  {
    reference: "0101",
    bodyType: "SUV",
    make: "Toyota",
    model: "Corolla Cross",
    version: "XEI 2.0 CVT",
    year: 2022,
    km: 38000,
    transmission: "Automática",
    fuel: "Nafta",
    color: "Gris",
    price: 28500,
    currency: "USD",
    warranty: "6 meses",
    special: "Único dueño",
    seller: "Concesionaria",
    dealership: "Autohaus Punta",
    badge: "Certificado",
    features: "Aire acondicionado / Climatizador; Cámara de reversa; Frenos ABS",
    description: "Service oficial completo, excelente estado general.",
  },
  {
    reference: "0102",
    bodyType: "Auto",
    make: "Volkswagen",
    model: "Golf",
    version: "Highline 1.4 TSI",
    year: 2019,
    km: 62000,
    transmission: "Manual",
    fuel: "Nafta",
    color: "Blanco",
    price: 24500000,
    currency: "ARS",
    seller: "Particular",
    location: "Tigre, Buenos Aires",
    sellerPhone: "5491155550101",
    features: "Bluetooth; Sensores de estacionamiento",
    description: "Papeles al día, listo para transferir.",
  },
  {
    reference: "0103",
    bodyType: "Auto",
    make: "Tesla",
    model: "Model 3",
    version: "Long Range",
    year: 2023,
    km: 15000,
    transmission: "Automática",
    fuel: "Eléctrico",
    color: "Negro",
    price: 41000,
    currency: "USD",
    warranty: "12 meses",
    seller: "Concesionaria",
    dealership: "Montevideo Motors",
    description: "Batería con 98% de salud, cargador incluido.",
  },
  {
    reference: "0104",
    bodyType: "Moto",
    make: "Honda",
    model: "CB 500F",
    year: 2021,
    km: 9000,
    transmission: "Manual",
    fuel: "Nafta",
    color: "Rojo",
    price: 9800,
    currency: "USD",
    special: "Con accesorios",
    seller: "Particular",
    location: "San Isidro, Buenos Aires",
    sellerPhone: "5491155550104",
    description: "Con baúl y protectores.",
  },
];

/** Loads exceljs on demand (it is large) and copes with CJS/ESM interop. */
async function loadExcel(): Promise<typeof import("exceljs")> {
  const mod = await import("exceljs");
  return mod.default ?? mod;
}

/** Builds the template (header + sample rows) and downloads it in the browser. */
export async function downloadTemplate() {
  const { Workbook } = await loadExcel();
  const wb = new Workbook();
  const ws = wb.addWorksheet("Inventario");
  ws.columns = COLUMNS.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width,
  }));
  for (const row of SAMPLES) ws.addRow(row);

  const header = ws.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F3864" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
  COLUMNS.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    if (c.wrap) col.alignment = { vertical: "top", wrapText: true };
    if (c.options) {
      for (let r = 2; r <= 300; r++) {
        ws.getCell(r, i + 1).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${c.options.join(",")}"`],
        };
      }
    }
  });
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = TEMPLATE_FILE_NAME;
  a.click();
  URL.revokeObjectURL(url);
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Maps accent/underscore-insensitive text to one of the allowed values. */
function pick<T extends string>(raw: string, options: readonly T[]) {
  return options.find((o) => norm(o) === norm(raw));
}

/** Cell contents as plain text (handles rich text, formulas and hyperlinks). */
function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    const v = value as {
      text?: unknown;
      result?: unknown;
      richText?: { text: string }[];
      hyperlink?: string;
    };
    if (v.richText) return v.richText.map((t) => t.text).join("").trim();
    if (v.text != null) return cellText(v.text);
    if (v.result != null) return cellText(v.result);
    if (v.hyperlink) return v.hyperlink;
    if (value instanceof Date) return value.toISOString();
  }
  return String(value).trim();
}

/** "1.234,5" / "1,234.5" / "1234" -> number (NaN when not numeric). */
function toNumber(raw: string) {
  let s = raw.replace(/[^\d.,-]/g, "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
  else if (lastDot > lastComma && /\.\d{3}($|\.)/.test(s) && lastComma < 0)
    s = s.replace(/\./g, "");
  else s = s.replace(/,/g, "");
  return s === "" ? NaN : Number(s);
}

/** Spreadsheet-managed fields. Photos, id, dates and order are never in the file. */
export type VehicleFields = Omit<
  Vehicle,
  "id" | "createdAt" | "image" | "images" | "order"
>;

export type ImportRow = {
  data: VehicleFields;
  /** The vehicle this row updates, matched by Referencia; absent for new vehicles. */
  existing?: Vehicle;
};

export type ImportResult = {
  rows: ImportRow[];
  errors: string[];
};

/** Technical-sheet rows the spreadsheet owns; other rows are kept on update. */
const MANAGED_SPECS = ["Versión", "Garantía", "Condición especial"];

/** Reads an uploaded .xlsx and validates every row against the vehicle model. */
export async function parseInventoryFile(
  file: File,
  existing: Vehicle[],
  dealerships: Dealership[],
): Promise<ImportResult> {
  const { Workbook } = await loadExcel();
  const wb = new Workbook();
  try {
    await wb.xlsx.load(await file.arrayBuffer());
  } catch {
    return { rows: [], errors: ["No se pudo leer el archivo. Usá un .xlsx."] };
  }
  const ws = wb.worksheets[0];
  if (!ws) return { rows: [], errors: ["El archivo no tiene hojas."] };

  // Header text -> column number, ignoring case, accents and underscores.
  const colOf = new Map<string, number>();
  ws.getRow(1).eachCell((cell, n) => colOf.set(norm(cellText(cell.value)), n));
  const missing = COLUMNS.filter((c) => !colOf.has(norm(c.header))).map(
    (c) => c.header,
  );
  if (missing.length)
    return {
      rows: [],
      errors: [
        `Faltan columnas: ${missing.join(", ")}. Descargá la plantilla y no cambies los encabezados.`,
      ],
    };

  const errors: string[] = [];
  const rows: ImportRow[] = [];
  // Referencia is the unique key: a known one updates that vehicle, a new one creates it.
  const byReference = new Map(existing.map((v) => [vehicleReference(v), v]));
  const seen = new Set<string>();
  const featureByLabel = new Map(
    COMMON_CAR_FEATURES.flatMap((f) => [
      [norm(f.label), f.id] as const,
      [norm(f.id), f.id] as const,
    ]),
  );

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (key: string) =>
      cellText(row.getCell(colOf.get(norm(COLUMNS.find((c) => c.key === key)!.header))!).value);
    if (!COLUMNS.some((c) => get(c.key))) return; // blank row

    const problems: string[] = [];
    const need = (key: string, label: string) => {
      const v = get(key);
      if (!v) problems.push(`${label} es obligatorio`);
      return v;
    };

    const reference = need("reference", "Referencia");
    if (reference) {
      if (!/^[A-Za-z0-9-]{1,20}$/.test(reference))
        problems.push("Referencia solo admite letras, números y guiones (máx. 20)");
      else if (seen.has(reference))
        problems.push(`la Referencia ${reference} está repetida en el archivo`);
      else seen.add(reference);
    }

    const bodyType = pick(need("bodyType", "Tipo_Vehiculo"), BODY_TYPES);
    if (get("bodyType") && !bodyType)
      problems.push(`Tipo_Vehiculo debe ser: ${BODY_TYPES.join(", ")}`);

    const make = need("make", "Marca");
    const model = need("model", "Modelo");

    const year = toNumber(need("year", "Año"));
    if (get("year") && !(Number.isInteger(year) && year >= 1900 && year <= 2100))
      problems.push("Año inválido");

    const km = toNumber(need("km", "Kilometraje"));
    if (get("km") && !(km >= 0)) problems.push("Kilometraje inválido");

    const transmission = pick(need("transmission", "Transmision"), TRANSMISSIONS);
    if (get("transmission") && !transmission)
      problems.push(`Transmision debe ser: ${TRANSMISSIONS.join(", ")}`);

    const fuelName = pick(need("fuel", "Combustible"), Object.keys(FUELS));
    if (get("fuel") && !fuelName)
      problems.push(`Combustible debe ser: ${Object.keys(FUELS).join(", ")}`);

    const price = toNumber(need("price", "Precio"));
    if (get("price") && !(price >= 0)) problems.push("Precio inválido");

    const currency = pick(need("currency", "Moneda"), CURRENCIES);
    if (get("currency") && !currency)
      problems.push("Moneda debe ser USD o ARS");

    const sellerName = pick(need("seller", "Tipo_Vendedor"), Object.keys(SELLERS));
    if (get("seller") && !sellerName)
      problems.push("Tipo_Vendedor debe ser Concesionaria o Particular");
    const sellerType = sellerName ? SELLERS[sellerName] : undefined;

    let dealership: Dealership | undefined;
    let location = get("location");
    let sellerPhone = "";
    if (sellerType === "dealer") {
      const name = need("dealership", "Concesionaria");
      dealership = dealerships.find((d) => norm(d.name) === norm(name));
      if (name && !dealership)
        problems.push(`la concesionaria "${name}" no existe en el panel`);
      location = dealership?.location ?? location;
    } else if (sellerType === "private") {
      location = need("location", "Ubicacion");
      sellerPhone = get("sellerPhone").replace(/\D/g, "");
      if (!/^\d{8,15}$/.test(sellerPhone))
        problems.push("Telefono_Vendedor debe tener 8 a 15 dígitos con código de país");
    }

    const features: string[] = [];
    for (const label of get("features").split(/[;\n]+/).map((s) => s.trim()).filter(Boolean)) {
      const id = featureByLabel.get(norm(label));
      if (id) features.push(id);
      else problems.push(`Equipamiento desconocido: "${label}"`);
    }

    if (problems.length) {
      errors.push(`Fila ${rowNumber}: ${problems.join("; ")}.`);
      return;
    }

    const known = byReference.get(reference);
    const specs: Record<string, string> = Object.fromEntries(
      Object.entries(known?.specs ?? {}).filter(
        ([k]) => !MANAGED_SPECS.includes(k),
      ),
    );
    if (get("version")) specs["Versión"] = get("version");
    if (get("warranty")) specs["Garantía"] = get("warranty");
    if (get("special")) specs["Condición especial"] = get("special");

    rows.push({
      existing: known,
      data: {
      reference,
      make,
      model,
      year,
      price,
      priceCurrency: currency,
      mileage: Math.round(km / KM_PER_MILE),
      transmission: transmission!,
      fuelType: FUELS[fuelName!],
      bodyType: bodyType!,
      color: get("color"),
      specs,
      features,
      description: get("description"),
      location,
      sellerType: sellerType!,
      ...(dealership && { dealership }),
      ...(sellerType === "private" && { sellerPhone }),
      ...(get("badge") && { badge: get("badge") }),
      },
    });
  });

  if (!rows.length && !errors.length)
    errors.push("El archivo no tiene filas con datos.");
  return { rows, errors };
}
