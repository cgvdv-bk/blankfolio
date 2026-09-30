import fs from "node:fs";
import path from "node:path";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import { imageTransformPlugin as eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import CleanCSS from "clean-css";
import htmlmin from "html-minifier-terser";
import matter from "gray-matter";
import markdownIt from "markdown-it";
import { minify as jsmin } from "terser";

export default function (eleventyConfig) {
  // Passt absolute Pfade an den eingestellten pathPrefix an.
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  const md = markdownIt();

  // Erkennt den Produktions-Build.
  const isProduction = process.env.ELEVENTY_RUN_MODE === "build";

  // Kopiert statische Dateien unverändert in den Ausgabeordner.
  eleventyConfig.addPassthroughCopy("src/public");

  // Kopiert Bilder im Entwicklungsmodus unverändert.
  if (!isProduction) {
    eleventyConfig.addPassthroughCopy("src/**/*.{jpg,jpeg,png,webp,gif,svg}");
  }

  // Ergänzt Markdown-Daten um HTML und Bilder aus dem jeweiligen Ordner.
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
        console.error("Fehler beim Lesen der Bilder in:", filePath, err);
      }

      return {
        ...data,
        meta: data,
        html: md.render(content),
        images: projectImages,
      };
    },
  });

  // Berechnet Projektpfade und fortlaufende Projektnummern.
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

  // Stellt das aktuelle Jahr als Shortcode bereit.
  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  // Optimiert Bilder im Produktions-Build.
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

  // Minifiziert HTML im Produktions-Build.
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

  // Verarbeitet CSS und minifiziert es im Produktions-Build.
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

  // Verarbeitet JavaScript und minifiziert es im Produktions-Build.
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
    // Setzt die URL-Basis, zum Beispiel für GitHub Pages.
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
