import fs from "fs";
import path from "path";
import {
    parseColorTokens,
    parseSemanticTokens,
    parseTypographyTokens,
    parseSpacingTokens,
} from "@/shared/utils/design-tokens";
import { DesignSystemShowcase } from "../components";

export default function DesignPage() {
    const colorsPath = path.join(
        process.cwd(),
        "shared",
        "styles",
        "colors.css",
    );
    const semanticPath = path.join(
        process.cwd(),
        "shared",
        "styles",
        "semantics.css",
    );
    const typographyPath = path.join(
        process.cwd(),
        "shared",
        "styles",
        "typography.css",
    );
    const spacingPath = path.join(
        process.cwd(),
        "shared",
        "styles",
        "spacing.css",
    );

    const colorsCss = fs.readFileSync(colorsPath, "utf8");
    const semanticCss = fs.readFileSync(semanticPath, "utf8");
    const typographyCss = fs.readFileSync(typographyPath, "utf8");
    const spacingCss = fs.existsSync(spacingPath)
        ? fs.readFileSync(spacingPath, "utf8")
        : "";

    const colors = parseColorTokens(colorsCss);
    const semanticTokens = parseSemanticTokens(semanticCss);
    const typography = parseTypographyTokens(typographyCss);
    const spacing = parseSpacingTokens(spacingCss);

    return (
        <DesignSystemShowcase
            colors={colors}
            semanticTokens={semanticTokens}
            typography={typography}
            spacing={spacing}
        />
    );
}
