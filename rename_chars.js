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

    // Safety: we only replace inside double quotes to protect object properties and tags
    // Or we do a global replace and revert specific known character IDs.

    let updated = content.replace(/\bMira\b/g, 'Ranjit')
        .replace(/\bRao\b/g, 'Rajiv')
        .replace(/\bOld Foreman\b/g, 'Anil')
        .replace(/\bForeman\b/g, 'Anil');

    // RESTORE character IDs that might have been hit
    // Character bindings are typically: character: 'Mira'
    updated = updated.replace(/character:\s*'Ranjit'/g, "character: 'Mira'")
        .replace(/character:\s*'Rajiv'/g, "character: 'Rao'")
        .replace(/character:\s*'Anil'/g, "character: 'Old Foreman'"); // we used Old Foreman for ID

    // Restore any imports if any: e.g. import { DAY_5_GOOD_Mira } - usually no such things exist.

    if (content !== updated) {
        fs.writeFileSync(file, updated, 'utf8');
        console.log('Updated texts in: ' + file);
        updatedCount++;
    }
});

console.log(`Finished processing. ${updatedCount} files updated.`);
