const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec, execSync } = require('child_process');

function getReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Parses a single migration file and extracts table name, columns, and foreign keys.
 *
 * @param {string} filePath - The path to the migration file.
 * @returns {Object} An object containing the parsed migration data.
 */
function parseMigrationFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const tableName = content.match(/Schema::create\('(\w+)'/);
    const columns = content.match(/\$table->\w+\(['"][\w_]+['"]/g);
    const foreignKeys = content.match(/\$table->foreign\(['"][\w_]+['"]\)->references\(['"][\w_]+['"]\)->on\(['"][\w_]+['"]\)/g);

    return {
        name: path.basename(filePath),
        table: tableName ? tableName[1] : 'Unknown',
        columns: columns ? columns.map(col => {
            const match = col.match(/\$table->(\w+)\(['"](\w+)['"]/);
            return match ? { type: match[1], name: match[2] } : null;
        }).filter(Boolean) : [],
        foreignKeys: foreignKeys ? foreignKeys.map(fk => {
            const match = fk.match(/foreign\(['"](\w+)['"]\)->references\(['"](\w+)['"]\)->on\(['"](\w+)['"]\)/);
            return match ? { column: match[1], references: match[2], on: match[3] } : null;
        }).filter(Boolean) : []
    };
}

/**
 * Recursively retrieves all migration files from a directory and its subdirectories.
 *
 * @param {string} dir - The directory to search for migration files.
 * @returns {string[]} An array of file paths to migration files.
 */
function getAllMigrationFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            // Recursively search subdirectories.
            results = results.concat(getAllMigrationFiles(file));
        } else if (file.endsWith('.php')) {
            results.push(file);
        }
    });
    return results;
}

/**
 * Generates Mermaid ERD code from parsed migration data.
 *
 * @param {Object[]} migrations - An array of parsed migration objects.
 * @returns {string} Mermaid ERD code as a string.
 */
function generateMermaidERD(migrations) {
    let mermaidCode = 'erDiagram\n';

    migrations.forEach(migration => {
        mermaidCode += `    ${migration.table} {\n`;
        migration.columns.forEach(column => {
            mermaidCode += `        ${column.type} ${column.name}\n`;
        });
        mermaidCode += '    }\n';
    });

    migrations.forEach(migration => {
        migration.foreignKeys.forEach(fk => {
            mermaidCode += `    ${migration.table} ||--o{ ${fk.on} : "${fk.column}"\n`;
        });
    });

    return mermaidCode;
}

/**
 * Creates or overwrites the directory to store the summary files.
 *
 * @returns {string} The path to the created or overwritten summary directory.
 */
function createSummaryDirectory() {
    const summaryDir = path.join(process.cwd(), 'db-summary');
    if (fs.existsSync(summaryDir)) {
        // Remove existing directory and its contents
        fs.rmSync(summaryDir, { recursive: true, force: true });
    }
    fs.mkdirSync(summaryDir);
    return summaryDir;
}

/**
 * Writes a text summary of the database structure to a file.
 *
 * @param {string} summaryDir - The directory to write the summary file to.
 * @param {Object[]} migrations - An array of parsed migration objects.
 */
function writeTextSummary(summaryDir, migrations) {
    let summary = 'Laravel Application Database Summary:\n';
    summary += '====================================\n\n';

    migrations.forEach(migration => {
        summary += `Table: ${migration.table}\n`;
        summary += `Migration: ${migration.name}\n`;
        summary += 'Columns:\n';
        migration.columns.forEach(column => {
            summary += `  - ${column.name} (${column.type})\n`;
        });
        if (migration.foreignKeys.length > 0) {
            summary += 'Foreign Keys:\n';
            migration.foreignKeys.forEach(fk => {
                summary += `  - ${fk.column} references ${fk.references} on ${fk.on}\n`;
            });
        }
        summary += '\n';
    });

    fs.writeFileSync(path.join(summaryDir, 'text-summary.txt'), summary);
    console.log('Text summary saved to db-summary/text-summary.txt.');
}

/**
 * Writes Mermaid ERD code to a file.
 *
 * @param {string} summaryDir - The directory to write the ERD file to.
 * @param {string} mermaidCode - The Mermaid ERD code to write.
 */
function writeMermaidERD(summaryDir, mermaidCode) {
    fs.writeFileSync(path.join(summaryDir, 'erd.mmd'), mermaidCode);
    console.log('Mermaid ERD code saved to db-summary/erd.mmd.');
}

/**
 * Checks if Mermaid CLI is installed and available.
 *
 * @returns {boolean} True if Mermaid CLI is available, false otherwise.
 */
function isMermaidCliAvailable() {
    try {
        execSync('mmdc --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Provides instructions for using the Mermaid Live Editor.
 */
function provideMermaidInstructions() {
    console.log('To visualize the ERD:');
    console.log('1. Copy the contents of db-summary/erd.mmd');
    console.log('2. Visit https://mermaid-js.github.io/mermaid-live-editor/');
    console.log('3. Paste the code and click "Render"');
}

/**
 * Generates a PNG image of the ERD using Mermaid CLI if available, otherwise provides instructions.
 *
 * @param {string} summaryDir - The directory containing the Mermaid ERD code file.
 */
function generateERDImage(summaryDir) {
    const mmdPath = path.join(summaryDir, 'erd.mmd');
    const pngPath = path.join(summaryDir, 'erd.png');

    if (isMermaidCliAvailable()) {
        exec(`mmdc -i ${mmdPath} -o ${pngPath}`, (error, stdout, stderr) => {
            if (error) {
                console.log('Error generating ERD image. Mermaid CLI might not be installed correctly.');
                provideMermaidInstructions();
            } else {
                console.log('ERD image saved to db-summary/erd.png.');
            }
        });
    } else {
        console.log('Mermaid CLI is not installed. PNG generation is not available.');
        provideMermaidInstructions();
    }
}

/**
 * Summarizes migrations by parsing files, generating summaries, and creating output files.
 *
 * @param {string} migrationsPath - The path to the migrations directory.
 */
function summarizeMigrations(migrationsPath) {
    if (!fs.existsSync(migrationsPath)) {
        console.error(`Error: The directory ${migrationsPath} does not exist.`);
        return;
    }

    const files = getAllMigrationFiles(migrationsPath);
    const migrations = files.map(file => parseMigrationFile(file));

    const summaryDir = createSummaryDirectory();
    writeTextSummary(summaryDir, migrations);

    const mermaidCode = generateMermaidERD(migrations);
    writeMermaidERD(summaryDir, mermaidCode);

    generateERDImage(summaryDir);
}

/**
 * Main execution function that handles user input and initiates the migration summarization process.
 */
function main() {
    console.log('Laravel Database Summarizer');
    console.log('===========================');

    if (process.argv.length > 2) {
        const laravelProjectPath = process.argv[2];
        const migrationsPath = path.join(laravelProjectPath, 'database', 'migrations');
        summarizeMigrations(migrationsPath);
    } else {
        const rl = getReadlineInterface();
        rl.question('Please enter the path to your Laravel project: ', (laravelProjectPath) => {
            const migrationsPath = path.join(laravelProjectPath, 'database', 'migrations');
            summarizeMigrations(migrationsPath);
            rl.close();
        });
    }
}

// Run the main function.
if (require.main === module) {
    main();
}

// At the end of the file
module.exports = {
    parseMigrationFile,
    getAllMigrationFiles,
    generateMermaidERD,
    createSummaryDirectory,
    writeTextSummary,
    isMermaidCliAvailable,
    summarizeMigrations,
    main,
    getReadlineInterface
};
