import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const distDir = join(rootDir, 'dist');

// Asegurar que Git, GitHub CLI y Node estén en el PATH en Windows
const localAppData = process.env.LOCALAPPDATA || '';
const extraPaths = [
  join(localAppData, 'Programs', 'nodejs'),
  join(localAppData, 'Programs', 'gh', 'bin'),
  join(localAppData, 'Programs', 'MinGit', 'cmd'),
  join(localAppData, 'Programs', 'MinGit', 'mingw64', 'bin'),
].filter((p) => existsSync(p));

const env = {
  ...process.env,
  PATH: [...extraPaths, process.env.PATH || process.env.Path || ''].join(';'),
};

function run(cmd, cwd = rootDir) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, env, stdio: 'inherit' });
}

// 1. Compilar versión de producción con base '/profelisto/'
run('npx vite build');

// 2. Asegurar .nojekyll y 404.html para rutas SPA en GitHub Pages
writeFileSync(join(distDir, '.nojekyll'), '');
copyFileSync(join(distDir, 'index.html'), join(distDir, '404.html'));

// 3. Obtener URL remota del repositorio principal
const remoteUrl = execSync('git remote get-url origin', { cwd: rootDir, env })
  .toString()
  .trim();

// 4. Subir el contenido de dist/ a la rama gh-pages
run('git init', distDir);
run('git config user.name "elatractivodigital"', distDir);
run('git config user.email "elatractivodigital@gmail.com"', distDir);
run('git checkout -B gh-pages', distDir);
run('git add -A', distDir);
run('git commit -m "Deploy ProfeListo to GitHub Pages"', distDir);
run(`git push -f "${remoteUrl}" gh-pages:gh-pages`, distDir);

console.log('\n✓ Despliegue subido correctamente a la rama gh-pages.');
