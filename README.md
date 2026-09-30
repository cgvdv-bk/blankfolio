# Blankfolio

Blankfolio ist eine Portfolio-Vorlage für den Coding-Grundlagenkurs. Du kannst Texte, Projekte und Bilder anpassen, die Website lokal ansehen und sie anschließend über GitHub Pages veröffentlichen.

## Voraussetzungen

- [Node.js 22](https://nodejs.org/) und npm
- Ein GitHub-Konto

npm wird zusammen mit Node.js installiert.

## Eigenes Repository erstellen

Erstelle auf GitHub aus dieser Vorlage ein eigenes Repository. Klicke dazu auf **Use this template** und dann auf **Create a new repository**. Klone anschließend dein neues Repository auf deinen Computer:

```sh
git clone https://github.com/DEIN-NAME/DEIN-REPOSITORY.git
cd DEIN-REPOSITORY
```

Ersetze `DEIN-NAME` und `DEIN-REPOSITORY` durch deinen GitHub-Benutzernamen und den Namen deines Repositorys. Wenn du das Projekt bereits geklont hast, öffne stattdessen dessen Ordner im Terminal oder in VS Code.

## Website lokal starten

Installiere im Projektordner die benötigten Pakete und starte anschließend den Entwicklungsserver:

```sh
npm install
npm run dev
```

Öffne danach [http://localhost:8080](http://localhost:8080) im Browser. Änderungen an den Dateien werden während der Entwicklung neu geladen. Beende den Server im Terminal mit `Ctrl+C`.

## Inhalte anpassen

- **Seitentitel und Name:** Ändere `title` und `name` in `src/settings/info.json`.
- **Info- und Kontaktseite:** Bearbeite `src/info/info.md` und `src/info/contact.md`.
- **Darstellung:** Passe die CSS-Dateien in `src/styles/` an.
- **Bilder und weitere statische Dateien:** Lege sie in `src/public/` ab.

### Projekt bearbeiten oder hinzufügen

Jedes Projekt liegt in einem eigenen Ordner unter `src/projects/`. Darin befinden sich eine `info.md`-Datei und die Projektbilder. In der Markdown-Datei stehen am Anfang die Angaben für Titel, Kategorie und Jahr:

```yaml
---
title: Mein Projekt
category: Plakatgestaltung
year: 2026
---
```

Schreibe die Projektbeschreibung unterhalb der drei Bindestriche. Lege die Bilder desselben Projekts in denselben Ordner. Alle Bilder erscheinen auf der Projektseite; das erste Bild dient als Vorschaubild in der Übersicht.

Für ein neues Projekt kopiere einen vorhandenen Projektordner, gib dem neuen Ordner die nächste Nummer, zum Beispiel `004_mein-projekt`, und ersetze Text und Bilder. Die Nummern sorgen für eine übersichtliche Ordnerliste. Die Projektseiten werden automatisch erstellt.

## Wichtige Ordner

```text
src/
├── index.html       Startseite
├── info/            Info- und Kontakttexte
├── layouts/         Vorlagen für die Seiten
├── projects/        Projekte, Texte und Bilder
├── public/          Schriftarten und statische Dateien
├── scripts/         Globale und seitenspezifische JavaScript-Dateien:
│   ├── global.js       Skripte für alle Seiten
│   └── layouts/        Skripte für einzelne Seitentypen
├── settings/        Seitentitel und Name
└── styles/          CSS-Dateien für die Gestaltung:
   ├── global.css       CSS-Regeln für alle Seiten
   ├── reset.css        Grundlegende CSS-Regeln
   └── layouts/         CSS-Dateien für einzelne Seitentypen
```

## Website bauen

Mit diesem Befehl erstellst du eine fertige Version der Website:

```sh
npm run build
```

Die Dateien werden im Ordner `dist/` erzeugt. Ändere diesen Ordner nicht von Hand; er wird bei jedem Build neu erstellt.

## Auf GitHub Pages veröffentlichen

1. Öffne auf GitHub die Einstellungen deines Repositorys unter **Settings → Pages**.
2. Wähle bei **Build and deployment** als Quelle **GitHub Actions**.
3. Übernimm deine Änderungen in den Branch `main`:

   ```sh
   git add .
   git commit -m "Portfolio anpassen"
   git push
   ```

Nach dem Push baut GitHub Actions die Website und veröffentlicht sie. Den Status findest du im Reiter **Actions**; nach erfolgreicher Veröffentlichung erscheint die Website-Adresse in den Pages-Einstellungen. Der Workflow passt die Pfade automatisch an den Namen deines Repositorys an.

GitHub Pages eignet sich für kleinere Websites: Die veröffentlichte Website darf höchstens 1 GB groß sein. Außerdem gilt eine weiche Bandbreitengrenze von 100 GB pro Monat; ein Deployment darf höchstens 10 Minuten dauern. Weitere Informationen findest du in der [Dokumentation zu den GitHub-Pages-Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

### Bei einem anderen Anbieter veröffentlichen

Wenn dein Webhosting-Anbieter FTP-Zugriff ermöglicht, kannst du die Website auch dort veröffentlichen. Führe zuerst `npm run build` aus und übertrage anschließend den Inhalt des Ordners `dist/` mit einem FTP-Programm in das Webverzeichnis deines Servers.
