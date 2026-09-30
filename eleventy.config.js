import markdownIt from "markdown-it";
import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import { imageTransformPlugin as eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import htmlmin from "html-minifier-terser";
import postcss from "postcss";
import cssnano from "cssnano";
import { minify as jsmin } from "terser";

export default function (eleventyConfig) {
  const md = markdownIt();

  // Umgebung prüfen: Ist es der finale Produktions-Build?
  const isProduction = process.env.ELEVENTY_RUN_MODE === "build";

  // Passthroughs für Styles, Schriften & Bilder
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/public");

  // Bilder-Passthrough: NUR im lokalen Entwicklungsmodus aktiv!
  if (!isProduction) {
    eleventyConfig.addPassthroughCopy("src/**/*.{jpg,jpeg,png,webp,gif,svg}");
  }

  // Bilder aus den Projektordnern auslesen
  eleventyConfig.addDataExtension("md", {
    parser: (fileContent, filePath) => {
      const { data, content } = matter(fileContent);
      const folderPath = path.dirname(filePath);
      let projectImages = [];

      try {
        if (fs.existsSync(folderPath)) {
          const files = fs.readdirSync(folderPath);
          const fileExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif",
            ".svg",
          ];

          const webFolderPath = folderPath.replace(/^\.\/src|^src/, "");

          projectImages = files
            .filter((file) =>
              fileExtensions.includes(path.extname(file).toLowerCase()),
            )
            .map((file) => `${webFolderPath}/${file}`);
        }
      } catch (err) {
        console.error("Error reading images in::", filePath, err);
      }

      // FIX: Wir mappen 'meta' flach in das Rückgabeobjekt,
      // damit Eleventy Variablen wie 'title' direkt auf oberster Ebene (data.title) findet!
      return {
        ...data,
        meta: data, // Beibehalten, falls du es in Nunjucks so abfragst
        html: md.render(content),
        images: projectImages,
      };
    },
  });

  // Zentrales URL-Rewriting basierend auf dem Frontmatter-Titel
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      // Prüfen, ob die Datei im Projects-Ordner liegt
      if (data.page.filePathStem.startsWith("/projects/")) {
        // 1. Fallback: Wenn ein 'title' existiert, nutzen wir diesen
        if (data.title) {
          // FIX: Richtiger Abruf des eingebauten slugify-Filters in Eleventy
          const slugify = eleventyConfig.getFilter("slugify");
          const cleanSlug = slugify(data.title);
          return `/projects/${cleanSlug}/`;
        }

        // 2. Fallback: Falls mal kein Titel da ist, nutzen wir die alte Ordner-Logik
        const pathParts = data.page.filePathStem.split("/");
        const folderName = pathParts[2];

        if (folderName) {
          const cleanSlug = folderName.replace(/^\d+_+/, "");
          return `/projects/${cleanSlug}/`;
        }
      }

      // Standard-Permalink für alle anderen Seiten
      return data.permalink;
    },

    // Berechnet die aktuelle Projekt-Nummer
    projectIndex: (data) => {
      if (data.collections.projects) {
        const idx = data.collections.projects.findIndex(
          (p) => p.inputPath === data.page.inputPath,
        );
        const num = idx !== -1 ? idx + 1 : 1;
        // Wandelt die Zahl in einen String um und füllt sie links mit Nullen auf, bis sie 3 Zeichen lang ist
        return String(num).padStart(3, "0");
      }
      return "001";
    },

    // NEU: Holt die Gesamtanzahl mit führenden Nullen (z.B. "011")
    projectTotal: (data) => {
      if (data.collections.projects) {
        const total = data.collections.projects.length;
        return String(total).padStart(3, "0");
      }
      return "000";
    },
  });

  // Globale Funktionen
  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  // Eleventy Image Plugin Konfiguration
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: isProduction ? ["avif", "webp", "jpeg"] : ["auto"],
    widths: isProduction ? [800, 1200, 1600, "auto"] : ["auto"],
    transformOnRequest: !isProduction,
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
        sizes: "100vw",
      },
    },
  });

  // Minifier für HTML
  eleventyConfig.addTransform("htmlmin", async function (content) {
    const isHtml =
      this.page.outputPath && this.page.outputPath.endsWith(".html");

    if (isProduction && isHtml) {
      return await htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      });
    }
    return content;
  });

  // CSS Verarbeitung (Minifizierung nur in Production)
  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (inputContent, inputPath) {
      if (isProduction) {
        const result = await postcss([cssnano({ preset: "default" })]).process(
          inputContent,
          { from: inputPath },
        );
        return async () => result.css;
      }
      return async () => inputContent;
    },
  });

  // JS Verarbeitung (Minifizierung nur in Production)
  eleventyConfig.addTemplateFormats("js");
  eleventyConfig.addExtension("js", {
    outputFileExtension: "js",
    compile: async function (inputContent) {
      if (isProduction) {
        const minified = await jsmin(inputContent, {
          format: { comments: false },
        });
        return async () => minified.code;
      }
      return async () => inputContent;
    },
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "layouts",
      data: "settings",
    },
    htmlTemplateEngine: "njk",
  };
}
