const REQUIRED_HEADERS = ["bloco", "apartamento", "nome", "telefone"] as const;
const OPTIONAL_HEADERS = ["principal", "observacao"] as const;

const ALL_HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

export type ImportRow = {
  rowNumber: number;
  building: string;
  unit: string;
  name: string;
  phone: string;
  isPrimary: boolean;
  notes: string | null;
  errors: string[];
};

export type ImportPreview = {
  rows: ImportRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  detectedHeaders: string[];
  missingHeaders: string[];
  buildings: string[];
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if ((char === "," || char === ";") && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeader(header: string) {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("55")) {
    return `+${digits}`;
  }

  if (digits.length >= 10) {
    return `+55${digits}`;
  }

  return digits;
}

function parseBoolean(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return ["sim", "s", "true", "1", "principal", "yes", "y"].includes(normalized);
}

export function parseCsv(csvText: string): ImportPreview {
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      rows: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      detectedHeaders: [],
      missingHeaders: [...REQUIRED_HEADERS],
      buildings: []
    };
  }

  const headerCells = splitCsvLine(lines[0]!).map(normalizeHeader);
  const headerMap: Record<string, number> = {};

  for (const header of ALL_HEADERS) {
    const index = headerCells.findIndex((cell) => cell === header);
    if (index >= 0) {
      headerMap[header] = index;
    }
  }

  const missingHeaders = REQUIRED_HEADERS.filter((header) => headerMap[header] === undefined);
  const dataLines = lines.slice(1);
  const buildingsSet = new Set<string>();

  const rows: ImportRow[] = dataLines.map((line, idx) => {
    const cells = splitCsvLine(line);
    const building = headerMap.bloco !== undefined ? cells[headerMap.bloco]?.trim() ?? "" : "";
    const unit = headerMap.apartamento !== undefined ? cells[headerMap.apartamento]?.trim() ?? "" : "";
    const name = headerMap.nome !== undefined ? cells[headerMap.nome]?.trim() ?? "" : "";
    const phoneRaw = headerMap.telefone !== undefined ? cells[headerMap.telefone]?.trim() ?? "" : "";
    const phone = normalizePhone(phoneRaw);
    const isPrimary = parseBoolean(
      headerMap.principal !== undefined ? cells[headerMap.principal] : undefined
    );
    const notesRaw = headerMap.observacao !== undefined ? cells[headerMap.observacao]?.trim() ?? "" : "";
    const notes = notesRaw.length > 0 ? notesRaw : null;

    const errors: string[] = [];

    if (!building) {
      errors.push("Bloco obrigatório.");
    }

    if (!unit) {
      errors.push("Apartamento obrigatório.");
    }

    if (!name) {
      errors.push("Nome do morador obrigatório.");
    }

    if (!phone) {
      errors.push("Telefone obrigatório.");
    }

    if (building) {
      buildingsSet.add(building);
    }

    return {
      rowNumber: idx + 2,
      building,
      unit,
      name,
      phone,
      isPrimary,
      notes,
      errors
    };
  });

  const validRows = rows.filter((row) => row.errors.length === 0).length;

  return {
    rows,
    totalRows: rows.length,
    validRows,
    invalidRows: rows.length - validRows,
    detectedHeaders: headerCells,
    missingHeaders,
    buildings: Array.from(buildingsSet.values()).sort()
  };
}

export const IMPORT_TEMPLATE_CSV =
  "bloco,apartamento,nome,telefone,principal,observacao\nBloco 1,101,Ana Silva,11999990000,sim,Morador principal\nBloco 1,101,Carlos Silva,11988887777,nao,Familiar\nBloco 2,202,Mariana Costa,11977776666,sim,";

export const IMPORT_HEADERS_DESCRIPTION = [
  { name: "bloco", required: true, example: "Bloco 1" },
  { name: "apartamento", required: true, example: "101" },
  { name: "nome", required: true, example: "Ana Silva" },
  { name: "telefone", required: true, example: "+55 11 99999-0000" },
  { name: "principal", required: false, example: "sim / não" },
  { name: "observacao", required: false, example: "Texto livre" }
];
