Hier ist die überarbeitete Version der deutschen Übersetzung mit optimierter Grammatik und Rechtschreibung:

<div align="center" width="100%">
    <img src="./saasfly-logo.svg" width="128" alt="" />
</div>

# Saasfly </br>

[![GitHub Actions Workflow Status][check-workflow-badge]][check-workflow-badge-link] [![GitHub License][github-license-badge]][github-license-badge-link]  [![Discord][discord-badge]][discord-badge-link] [![Saasfly][made-by-nextify-badge]][made-by-nextify-badge-link]
[![English](https://img.shields.io/badge/-English-grey.svg)](README.md)

Eine einfach zu verwendende und unternehmenstaugliche Next.js-Vorlage.

Sie müssen keine Vorlagen mehr kaufen; Saasfly bietet eine vollständige Open-Source-Lösung zum schnellen und einfachen Erstellen von SaaS-Anwendungen.

> **[Nextify](https://nextify.ltd)** bietet eine komplette Enterprise-SaaS-Lösung an. Kontaktieren Sie uns unter [contact@nextify.ltd](mailto:contact@nextify.ltd), wenn Sie Interesse an einer Besprechung Ihres Projekts haben oder wenn Sie einfach ein Gespräch mit uns führen möchten. Zögern Sie bitte nicht, uns zu kontaktieren.

> ❤️ Wir bieten **kostenlose technische Unterstützung und Bereitstellungsdienste für gemeinnützige Organisationen** an.
>
> 🙌 Alle Gewinne aus unseren Open-Source-Projekten werden **ausschließlich zur Unterstützung von Open-Source-Initiativen und wohltätigen Zwecken verwendet**.

## ⚡ Live-Demo

Probieren Sie es selbst aus!

Demo-Server 1 (Standort: Washington, USA): <https://show.saasfly.io>

Demo-Server 2 (Standort: Tokio, Japan): <https://demo.saasfly.io>

Weitere Dokumentation finden Sie unter <https://document.saasfly.io>.

## 🌟 Stern-Verlauf

[![Star History Chart](https://api.star-history.com/svg?repos=saasfly/saasfly&type=Timeline)](https://star-history.com/#saasfly/saasfly&Timeline)

## 🚀 Erste Schritte

### 🖱 One-Click-Vorlage

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaasfly%2Fsaasfly&env=NEXT_PUBLIC_APP_URL,NEXTAUTH_URL,NEXTAUTH_SECRET,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,RESEND_API_KEY,RESEND_FROM&install-command=bun%20install&build-command=bun%20run%20build&root-directory=apps%2Fnextjs)

### 📋 Voraussetzungen

Stellen Sie vor dem Start sicher, dass Sie Folgendes installiert haben:

1. [Bun](https://bun.sh/), [Node.js](https://nodejs.org/) und [Git](https://git-scm.com/)

   1. Linux

    ```bash
      curl -sL https://gist.github.com/tianzx/874662fb204d32390bc2f2e9e4d2df0a/raw -o ~/downloaded_script.sh && chmod +x ~/downloaded_script.sh && source ~/downloaded_script.sh
    ```

   2. macOS

    ```bash
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      brew install git
      brew install oven-sh/bun/bun
      brew install nvm
    ```

2. [PostgreSQL](https://www.postgresql.org/)
   1. Sie können entweder Vercel Postgres oder einen lokalen PostgreSQL-Server verwenden (fügen Sie die POSTGRES_URL-Umgebungsvariable in .env.local hinzu)
      ```bash
         POSTGRES_URL = ''
      ```

### Installation

Für den Einstieg mit dieser Vorlage bieten wir zwei Möglichkeiten an:

1. Verwenden Sie den Befehl `bun create` (🌟dringend empfohlen🌟):

```bash
bun create saasfly 
```

2. Klonen Sie das Repository manuell:

```bash
git clone https://github.com/saasfly/saasfly.git
cd saasfly
bun install
```

### Einrichtung

Führen Sie die folgenden Schritte aus, um Ihr Projekt einzurichten:

1. Richten Sie die Umgebungsvariablen ein:

```bash
cp .env.example .env.local
// (Sie müssen eine Datenbank vorbereitet haben, bevor Sie diesen Befehl ausführen)
bun db:push
```

2. Starten Sie den Entwicklungsserver:

```bash
bun run dev:web
```

3. Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser, um das Ergebnis zu sehen.

4. (Optional Alpha) `bun run tailwind-config-viewer`
   Öffnen Sie [http://localhost:3333](http://localhost:3333) im Browser, um Ihre Tailwind CSS Konfiguration anzuzeigen.

### Weitere Hinweise

Nach dem 1. Juni 2025 verwenden wir Clerk als standardmäßigen Authentifizierungsanbieter.

Hier finden Sie die NextAuth Implementierung ( https://github.com/aeonai/aeon/tree/feature-nextauth ).

## 🥺 Projekt-Roadmap

1. Admin-Dashboard-Seite (in Alpha!!!)
   2. Derzeit ist nur eine statische Seite verfügbar, die Integration mit der Headless-Architektur ist geplant
   3. Sie können Ihr Admin-Konto angeben, indem Sie **ADMIN_EMAIL="admin@aeon.ai,root@aeon.ai"** in .env.local ändern und auf host:port/admin/dashboard zugreifen
   4. Aus Sicherheitsgründen werden wir vorerst keine Online-Demos bereitstellen.
2. Mehrsprachige README-Dateien
3. TODO

## ⭐ Funktionen

### 🐭 Frameworks

- **[Next.js](https://nextjs.org/)** - Das React-Framework für das Web (mit **App Directory**)
- **[NextAuth.js](https://next-auth.js.org/)** - Authentifizierung für Next.js
- **[Kysely](https://kysely.dev/)** - Der typsichere SQL-Abfrageersteller für TypeScript
- **[Prisma](https://www.prisma.io/)** - ORM der nächsten Generation für Node.js und TypeScript, verwendet als Schemaverwaltungstool
- **[React-email](https://react.email/)** - Ein React-Renderer zum Erstellen schöner E-Mails mit React-Komponenten

### 🐮 Plattformen

- **[Clerk](https://go.clerk.com/uKDp7Au)** - Die umfassendste Benutzerverwaltungsplattform
- **[Vercel](https://vercel.com/)** – Stellen Sie Ihre Next.js-App ganz einfach bereit
- **[Stripe](https://stripe.com/)** – Zahlungsabwicklung für Internetunternehmen
- **[Resend](https://resend.com/)** – E-Mail-Marketing-Plattform für Entwickler

### 🐯 Unternehmensfunktionen

- **[i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)** - Unterstützung für Internationalisierung
- **[SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)** - Suchmaschinenoptimierung
- **[MonoRepo](https://turbo.build/)** - Monorepo für eine bessere Code-Verwaltung
- **[T3 Env](https://env.t3.gg/)** - Verwalten Sie Ihre Umgebungsvariablen mit Leichtigkeit

### 🐰 Datenbeschaffung

- **[trpc](https://trpc.io/)** – End-to-End typsichere APIs leicht gemacht
- **[tanstack/react-query](https://react-query.tanstack.com/)** – Hooks zum Abrufen, Zwischenspeichern und Aktualisieren asynchroner Daten in React

### 🐲 Globale Zustandsverwaltung

- **[Zustand](https://zustand.surge.sh/)** – Kleine, schnelle und skalierbare Zustandsverwaltung für React

### 🐒 UI

- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-First-CSS-Framework für eine schnelle UI-Entwicklung
- **[Shadcn/ui](https://ui.shadcn.com/)** – Wiederverwendbare Komponenten, die mit Radix UI und Tailwind CSS erstellt wurden
- **[Framer Motion](https://framer.com/motion)** – Motion-Bibliothek für React zur einfachen Animation von Komponenten
- **[Lucide](https://lucide.dev/)** – Wunderschöne, einfache, pixelgenaue Symbole
- **[next/font](https://nextjs.org/docs/basic-features/font-optimization)** – Optimieren Sie benutzerdefinierte Schriftarten und entfernen Sie externe Netzwerkanforderungen zur Leistungsverbesserung

### 🐴 Code-Qualität

- **[TypeScript](https://www.typescriptlang.org/)** – Statischer Typprüfer für durchgängige Typsicherheit
- **[Prettier](https://prettier.io/)** – Opinionated Code Formatter für einen konsistenten Code-Stil
- **[ESLint](https://eslint.org/)** – Pluggable Linter für Next.js und TypeScript
- **[Husky](https://typicode.github.io/husky)** – Git-Hooks leicht gemacht

### 🐑 Leistung

- **[Vercel Analytics](https://vercel.com/analytics)** – Echtzeit-Leistungsmetriken für Ihre Next.js-App
- **[bun.sh](https://bun.sh/)** – npm-Alternative für eine schnellere und zuverlässigere Paketverwaltung

### 🐘 Datenbank

- **[PostgreSQL](https://www.postgresql.org/)** – Die weltweit fortschrittlichste Open-Source-Datenbank

## 📦 Apps und Pakete

- `web`: Die Hauptanwendung von Next.js
- `ui`: Gemeinsam genutzte UI-Komponenten
- `db`: Datenbankschema und Utilities
- `auth`: Authentifizierungs-Utilities
- `email`: E-Mail-Vorlagen und Utilities

## 📜 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen finden Sie in der Datei [LICENSE](./LICENSE).

## 🙏 Credits

Dieses Projekt wurde von shadcns [Taxonomy](https://github.com/shadcn-ui/taxonomy) und t3-oss' [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) inspiriert.

<!-- Badges and links -->

[check-workflow-badge]: https://img.shields.io/github/actions/workflow/status/saasfly/saasfly/ci.yml?label=ci
[github-license-badge]: https://img.shields.io/badge/License-MIT-green.svg
[discord-badge]: https://img.shields.io/discord/1204690198382911488?color=7b8dcd&link=https%3A%2F%2Fsaasfly.io%2Fdiscord
[made-by-nextify-badge]: https://img.shields.io/badge/made_by-nextify-blue?color=FF782B&link=https://nextify.ltd/

[check-workflow-badge-link]: https://github.com/saasfly/saasfly/actions/workflows/check.yml
[github-license-badge-link]: https://github.com/saasfly/saasfly/blob/main/LICENSE
[discord-badge-link]: https://discord.gg/8SwSX43wnD
[made-by-nextify-badge-link]: https://nextify.ltd