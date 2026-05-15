import fs from "fs";
import path from "path";

export interface ColorToken {
  name: string;
  hex: string;
  usage: string;
}

export interface SemanticToken {
  token: string;
  value: string;
  hex: string;
  usage: string;
}

export interface TypographyToken {
  name: string;
  size: string;
  weight: string;
  lineHeight: string;
  sample: string;
  font: string;
  note: string;
  className: string;
}

export interface SpacingToken {
  name: string;
  value: string;
  usage: string;
}

export function parseColorTokens(cssContent: string) {
  const colors: Record<string, ColorToken[]> = {};
  let currentCategory = "Other";

  const lines = cssContent.split("\n");
  lines.forEach((line) => {
    const categoryMatch = line.match(/\/\*\s+(.+)\s+\*\//);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim().toLowerCase().replace(" ", "");
      if (currentCategory === "neutral") currentCategory = "neutral";
      if (currentCategory === "skyblue") currentCategory = "skyBlue";
      if (currentCategory === "oceanblue") currentCategory = "oceanBlue";
      return;
    }

    const varMatch = line.match(
      /--color-([a-z0-9-]+):\s*([^;]+);(?:\s*\/\*\s*usage:\s*(.+)\s*\*\/)?/,
    );
    if (varMatch) {
      const name = varMatch[1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      const hex = varMatch[2].trim();
      const usage = varMatch[3]?.trim() || "";

      if (!colors[currentCategory]) {
        colors[currentCategory] = [];
      }
      colors[currentCategory].push({
        name,
        hex,
        usage,
      });
    }
  });

  return colors;
}

export function parseSemanticTokens(cssContent: string) {
  const categories: Record<string, SemanticToken[]> = {};
  let currentCategory = "other";

  const lines = cssContent.split("\n");
  lines.forEach((line) => {
    const categoryMatch = line.match(/\/\*\s+(.+)\s+\*\//);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim().toLowerCase();
      return;
    }

    const varMatch = line.match(
      /--color-([a-z0-9-]+):\s*([^;]+);(?:\s*\/\*\s*usage:\s*(.+)\s*\*\/)?/,
    );
    if (varMatch) {
      const token = `color-${varMatch[1]}`;
      const value = varMatch[2].trim();
      const usage = varMatch[3]?.trim() || "";

      if (!categories[currentCategory]) {
        categories[currentCategory] = [];
      }
      categories[currentCategory].push({
        token,
        value,
        hex: value, // In page context we will resolve this if needed
        usage,
      });
    }
  });

  return categories;
}

export function parseTypographyTokens(cssContent: string) {
  // This is more complex because it involves classes.
  // For now, we'll return a hardcoded list or a simplified parser.
  // Given the request, let's try to extract key info from classes.

  const typography: TypographyToken[] = [];
  const classRegex = /\.text-([a-z0-9-]+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = classRegex.exec(cssContent)) !== null) {
    const className = `text-${match[1]}`;
    const properties = match[2];
    const name = match[1]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const size = properties.match(/font-size:\s*([^;]+);/)?.[1] || "";
    const weight = properties.match(/font-weight:\s*([^;]+);/)?.[1] || "";
    const lineHeight = properties.match(/line-height:\s*([^;]+);/)?.[1] || "";
    const fontVar =
      properties.match(/font-family:\s*var\(--([^)]+)\);/)?.[1] || "";

    typography.push({
      name,
      size,
      weight,
      lineHeight,
      sample: name.includes("Hero")
        ? "Find Your Next Adventure"
        : "The quick brown fox jumps over the lazy dog",
      font: fontVar.includes("hero") ? "tahu" : "poppins",
      note: fontVar.includes("hero") ? "TAHU - Hero sections only" : "Poppins",
      className,
    });
  }

  return typography;
}

export function parseSpacingTokens(cssContent: string) {
  const spacing: SpacingToken[] = [];
  const lines = cssContent.split("\n");
  lines.forEach((line) => {
    const varMatch = line.match(
      /--spacing-([a-z0-9-]+):\s*([^;]+);(?:\s*\/\*\s*usage:\s*(.+)\s*\*\/)?/,
    );
    if (varMatch) {
      spacing.push({
        name: varMatch[1],
        value: varMatch[2].trim(),
        usage: varMatch[3]?.trim() || "",
      });
    }
  });
  return spacing;
}
