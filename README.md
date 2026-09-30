# Blankfolio

Blankfolio ist eine speziell für den Coding-Grundlagenkurs entwickelte Portfolio-Vorlage. Sie basiert auf dem Prinzip eines Static Site Generators und ermöglicht es dir, bereits mit einfachen Grundkenntnissen in HTML und CSS eine eigene Website zu bauen. Blankfolio nimmt dir dabei die Strukturierung ab: Es generiert automatisch eine Projektübersicht und die passenden Unterseiten für deine Arbeiten. Bei der Veröffentlichung sorgt das Tool zudem für Optimierungen, wie etwa die automatische Ausgabe moderner und web-optimierter Bildformate.

## Voraussetzungen

- Installiere [Node.js 22](https://nodejs.org/) auf deinem Computer.
- Erstelle einen GitHub Account und melde dich damit in [VS Code](https://code.visualstudio.com/docs/sourcecontrol/github#_sign-in-to-github-for-git-operations) und auf der [GitHub-Website](https://github.com) an.

## Schritt 1: Eigenes Repository erstellen

Erstelle auf GitHub aus dieser Vorlage ein eigenes Repository. Klicke dazu oben rechts auf `Use this template` und dann auf `Create a new repository`.

Klone das neue Repository danach auf deinen Computer. Öffne dazu das Terminal in VS Code über `Terminal > Neues Terminal` und führe folgenden Befehl aus:

```sh
git clone https://github.com/DEIN-NAME/DEIN-REPOSITORY.git
cd DEIN-REPOSITORY
```

Ersetze `DEIN-NAME` und `DEIN-REPOSITORY` durch deinen GitHub-Benutzernamen und den Namen deines Repositorys.

## Schritt 2: Website lokal starten

Führe im Terminal nacheinander die folgenden Befehle aus, um die benötigten Pakete zu installieren und die Website zu starten:

```sh
npm install
npm run dev
```

Öffne danach [http://localhost:8080](http://localhost:8080) im Browser. Änderungen an den Dateien werden während der Entwicklung neu geladen. Beende den Server im Terminal mit `Ctrl+C`.

## Schritt 3: Inhalte anpassen

- **Seitentitel und Name:** Ändere `title` und `name` in `src/settings/info.json`.
- **Info- und Kontaktseite:** Bearbeite `src/info/info.md` und `src/info/contact.md`.
- **Darstellung:** Passe die CSS-Dateien in `src/styles/` an.
- **Bilder und weitere statische Dateien:** Lege sie in `src/public/` ab.

## Schritt 4: Projekt bearbeiten oder hinzufügen

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

## Schritt 5: Website bauen

Mit diesem Befehl erstellst du eine fertige Version der Website:

```sh
npm run build
```

Die Dateien werden im Ordner `dist/` erzeugt. Ändere diesen Ordner nicht von Hand; er wird bei jedem Build neu erstellt.

## Schritt 6: Auf GitHub Pages veröffentlichen

1. Öffne auf GitHub die Einstellungen deines Repositorys unter **Settings → Pages**.
2. Wähle bei **Build and deployment** als Quelle **GitHub Actions**.
3. Führe im geöffneten Terminal nacheinander diese Befehle aus, um deine Änderungen in den Branch `main` zu übernehmen und zu GitHub hochzuladen:

   ```sh
   git add .
   git commit -m "Portfolio anpassen"
   git push
   ```

Nach dem Push baut GitHub Actions die Website und veröffentlicht sie. Den Status findest du im Reiter **Actions**; nach erfolgreicher Veröffentlichung erscheint die Website-Adresse in den Pages-Einstellungen. Der Workflow passt die Pfade automatisch an den Namen deines Repositorys an.

GitHub Pages eignet sich für kleinere Websites: Die veröffentlichte Website darf höchstens 1 GB groß sein. Außerdem gilt eine weiche Bandbreitengrenze von 100 GB pro Monat; ein Deployment darf höchstens 10 Minuten dauern. Weitere Informationen findest du in der [Dokumentation zu den GitHub-Pages-Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

### Bei einem anderen Anbieter veröffentlichen

Wenn dein Webhosting-Anbieter FTP-Zugriff ermöglicht, kannst du die Website auch dort veröffentlichen. Führe zuerst `npm run build` aus und übertrage anschließend den Inhalt des Ordners `dist/` mit einem FTP-Programm in das Webverzeichnis deines Servers.

### Wichtige Ordner

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
