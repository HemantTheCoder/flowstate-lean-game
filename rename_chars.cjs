const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'client/src');
const pathsToProcess = [
    path.join(baseDir, 'data/story.ts'),
];

['chapters', 'cases'].forEach(folder => {
    const dirPath = path.join(baseDir, 'data', folder);
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            if (file.endsWith('.ts')) {
                pathsToProcess.push(path.join(dirPath, file));
            }
        });
    }
});

let updatedCount = 0;

pathsToProcess.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    let updated = content.replace(/\bMira\b/g, 'Ranjit')
        .replace(/\bRao\b/g, 'Rajiv')
        .replace(/\bOld Foreman\b/g, 'Anil')
        .replace(/\bForeman\b/g, 'Anil');

    // RESTORE character IDs
    updated = updated.replace(/character:\s*'Ranjit'/g, "character: 'Mira'")
        .replace(/character:\s*'Rajiv'/g, "character: 'Rao'")
        .replace(/character:\s*'Anil'/g, "character: 'Old Foreman'");

    if (content !== updated) {
        fs.writeFileSync(file, updated, 'utf8');
        console.log('Updated texts in: ' + file);
        updatedCount++;
    }
});

console.log(`Finished processing. ${updatedCount} files updated.`);
