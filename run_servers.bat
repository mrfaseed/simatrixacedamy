@echo off
echo ===============================================
echo Server running module - Developed by @mrfxseed 
echo ===============================================

echo Starting Backend Server (Flask) in a new window...
start cmd /k "cd backend && call venv\Scripts\activate.bat && python -m src.seed && python app.py"

echo Starting Frontend Server (Vite) in a new window...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting!
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo You can close this window now.
pause




> frontend@0.0.0 dev
> vite

7:31:38 pm [vite] (client) Re-optimizing dependencies because vite config has changed

  VITE v8.0.15  ready in 796 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
(!) Failed to run dependency scan. Skipping dependency pre-bundling. Error: The following dependencies are imported but could not be resolved:

  recharts (imported by C:/simatrix/simatrix_academy/frontend/src/components/dashboard.tsx)
  @radix-ui/react-collapsible (imported by C:/simatrix/simatrix_academy/frontend/src/components/ui/collapsible.tsx)
  @radix-ui/react-separator (imported by C:/simatrix/simatrix_academy/frontend/src/components/ui/separator.tsx)
  @radix-ui/react-avatar (imported by C:/simatrix/simatrix_academy/frontend/src/components/ui/avatar.tsx)
  @radix-ui/react-dropdown-menu (imported by C:/simatrix/simatrix_academy/frontend/src/components/ui/dropdown-menu.tsx)
  clsx (imported by C:/simatrix/simatrix_academy/frontend/src/lib/utils.ts)
  tailwind-merge (imported by C:/simatrix/simatrix_academy/frontend/src/lib/utils.ts)

Are they installed?
    at file:///C:/simatrix/simatrix_academy/frontend/node_modules/vite/dist/node/chunks/node.js:31610:33
    at async file:///C:/simatrix/simatrix_academy/frontend/node_modules/vite/dist/node/chunks/node.js:23338:15


