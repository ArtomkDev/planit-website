# PlanIt Website

Next.js website for PlanIt, including the hosted legal pages.

## Local Development

```powershell
npm run dev
```

Open `http://localhost:3000/uk`.

## Firebase Hosting

Firebase deploys the static Next.js export from `out` to the existing `planit-hub` Hosting site through the `legal` target.

Run this once on your PC:

```powershell
npm run firebase:login
```

Build and deploy a preview version first:

```powershell
npm run deploy:firebase:preview
```

Build and deploy to production:

```powershell
npm run deploy:firebase
```

Useful checks before publishing:

```powershell
npm run lint
npm run build:firebase
```

If the site was already built and only the Firebase upload needs to be repeated:

```powershell
npm run deploy:firebase:skip-build
```
