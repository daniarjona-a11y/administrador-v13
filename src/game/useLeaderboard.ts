21:25:24.655 Running build in Washington, D.C., USA (East) – iad1
21:25:24.656 Build machine configuration: 2 cores, 8 GB
21:25:24.793 Cloning github.com/daniarjona-a11y/administrador-v13 (Branch: main, Commit: f72dc27)
21:25:25.710 Cloning completed: 917.000ms
21:25:25.911 Restored build cache from previous deployment (DF1BVFiQF5nGezJhVCyzRyXbednc)
21:25:26.282 Running "vercel build"
21:25:26.297 Vercel CLI 59.17.0
21:25:26.807 Installing dependencies...
21:25:27.567 
21:25:27.568 up to date in 640ms
21:25:27.568 
21:25:27.568 65 packages are looking for funding
21:25:27.568   run `npm fund` for details
21:25:27.568 npm warn allow-scripts 1 package has install scripts not yet covered by allowScripts:
21:25:27.568 npm warn allow-scripts   esbuild@0.21.5 (postinstall: node install.js)
21:25:27.569 npm warn allow-scripts
21:25:27.569 npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
21:25:27.603 Running "npm run build"
21:25:27.698 
21:25:27.698 > vite-react-typescript-starter@0.0.0 build
21:25:27.698 > vite build
21:25:27.698 
21:25:27.943 vite v5.4.8 building for production...
21:25:28.014 transforming...
21:25:28.306 Browserslist: caniuse-lite is outdated. Please run:
21:25:28.306   npx update-browserslist-db@latest
21:25:28.306   Why you should do it regularly: https://github.com/browserslist/update-db#readme
21:25:29.872 ✓ 1577 modules transformed.
21:25:29.875 x Build failed in 1.89s
21:25:29.875 error during build:
21:25:29.875 src/App.tsx (5:9): "useLeaderboard" is not exported by "src/game/useLeaderboard.ts", imported by "src/App.tsx".
21:25:29.875 file: /vercel/path0/src/App.tsx:5:9
21:25:29.875 
21:25:29.875 3: import type { Screen } from '@/game/types';
21:25:29.875 4: import { useGame } from '@/game/useGame';
21:25:29.875 5: import { useLeaderboard } from '@/game/useLeaderboard';
21:25:29.875             ^
21:25:29.875 6: import { HomeScreen } from '@/components/HomeScreen';
21:25:29.875 7: import { RulesScreen } from '@/components/RulesScreen';
21:25:29.875 
21:25:29.875     at getRollupError (file:///vercel/path0/node_modules/rollup/dist/es/shared/parseAst.js:395:41)
21:25:29.875     at error (file:///vercel/path0/node_modules/rollup/dist/es/shared/parseAst.js:391:42)
21:25:29.875     at Module.error (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:15535:16)
21:25:29.875     at Module.traceVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:15984:29)
21:25:29.875     at ModuleScope.findVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:13770:39)
21:25:29.875     at FunctionScope.findVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:5252:38)
21:25:29.875     at FunctionBodyScope.findVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:5252:38)
21:25:29.875     at Identifier.bind (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:5035:40)
21:25:29.875     at CallExpression.bind (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:2855:23)
21:25:29.875     at CallExpression.bind (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:11235:15)
21:25:29.903 Error: Command "npm run build" exited with 1
