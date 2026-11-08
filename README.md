# React + Vite

## Backend configuration

Set `VITE_API_URL` to the backend's absolute HTTP(S) API URL ending in `/api`,
for example `http://localhost:8080/api`. A trailing slash is optional.
All REST calls use this URL; the SockJS endpoint is derived from the same
backend path by replacing `/api` with `/gameplay`.

For Vercel, set `VITE_API_URL` in the project environment variables for each
deployment environment and redeploy. Vite embeds `VITE_` variables in the
frontend build, so never put secrets in them. The backend must separately allow
the frontend origin through CORS (and its SockJS origin configuration).

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
