import markdownIt from "markdown-it";
import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import { imageTransformPlugin as eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import htmlmin from "html-minifier-terser";
import CleanCSS from "clean-css";
import cssnano from "cssnano";
import { minify as jsmin } from "terser";
// 1. NEU: Eleventy Base Plugin importieren
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // 2. NEU: HTML Base Plugin aktivieren (wandelt z. B. href="/projects/..." passend um)
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  const md = markdownIt();

  // Umgebung prüfen: Ist es der finale Produktions-Build?
  const isProduction = process.env.ELEVENTY_RUN_MODE === "build";

  // Passthroughs für Styles, Schriften & Bilder
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

      return {
        ...data,
        meta: data,
        html: md.render(content),
        images: projectImages,
      };
    },
  });

  // Zentrales URL-Rewriting basierend auf dem Frontmatter-Titel
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      if (data.page.filePathStem.startsWith("/projects/")) {
        if (data.title) {
          const slugify = eleventyConfig.getFilter("slugify");
          const cleanSlug = slugify(data.title);
          return `/projects/${cleanSlug}/`;
        }

        const pathParts = data.page.filePathStem.split("/");
        const folderName = pathParts[2];

        if (folderName) {
          const cleanSlug = folderName.replace(/^\d+_+/, "");
          return `/projects/${cleanSlug}/`;
        }
      }

      return data.permalink;
    },

    projectIndex: (data) => {
      if (data.collections.projects) {
        const idx = data.collections.projects.findIndex(
          (p) => p.inputPath === data.page.inputPath,
        );
        const num = idx !== -1 ? idx + 1 : 1;
        return String(num).padStart(3, "0");
      }
      return "001";
    },

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
    compile: async function (inputContent) {
      if (isProduction) {
        const minified = new CleanCSS({}).minify(inputContent);
        return async () => minified.styles;
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
    // 3. NEU: Dynamisches pathPrefix für GitHub Pages (liest den Repo-Namen aus)
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: {
      input: "src",
      output: "dist",
      includes: "layouts",
      data: "settings",
    },
    htmlTemplateEngine: "njk",
  };
}
