const fs = require('fs');
const path = require('path');

const ENDPOINT_STRING = 'import.meta.env.VITE_ENDPOINT || "http://localhost:8080"';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Fix string interpolations first
    if (content.includes('import.meta.env.VITE_SERVER_ENDPOINT || "http://localhost:8080"')) {
        content = content.replace(/import\.meta\.env\.VITE_SERVER_ENDPOINT[^}]*/g, ENDPOINT_STRING);
        changed = true;
    }

    // Replace literal "http://localhost:8080/..." with `${ENDPOINT}/...`
    const literalUrlRegex = /"http:\/\/localhost:8080([^"]*)"/g;
    if (literalUrlRegex.test(content)) {
        content = content.replace(literalUrlRegex, (match, path) => {
            if (path === "") return ENDPOINT_STRING;
            if (path.startsWith("/")) return `\`\$\{${ENDPOINT_STRING}\}${path}\``;
            return `\`\$\{${ENDPOINT_STRING}\}/${path}\``;
        });
        changed = true;
    }

    // Replace literal `http://localhost:8080/...` inside template strings
    const templateVarRegex = /http:\/\/localhost:8080([^\`]*)/g;
    if (templateVarRegex.test(content)) {
        content = content.replace(templateVarRegex, (match, path) => {
            if (path.startsWith("/")) return `\$\{${ENDPOINT_STRING}\}${path}`;
            return `\$\{${ENDPOINT_STRING}\}/${path}`;
        });
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done replacing endpoints!');
