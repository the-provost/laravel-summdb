const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Mock modules
jest.mock('fs', () => ({
    readdirSync: jest.fn().mockReturnValue(['file1.php', 'file2.txt', 'subdir']),
    statSync: jest.fn().mockReturnValue({
        isDirectory: jest.fn().mockReturnValue(false)
    }),
    existsSync: jest.fn().mockReturnValue(true),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    rmSync: jest.fn(),
    readFileSync: jest.fn()
}));

jest.mock('path', () => ({
    ...jest.requireActual('path'),
    join: jest.fn().mockImplementation((...args) => args.join('/')),
    basename: jest.fn().mockReturnValue('test_migration.php'),
    sep: '/'
}));

jest.mock('child_process', () => ({
    execSync: jest.fn(),
    exec: jest.fn()
}));

const mockReadlineInterface = {
    question: jest.fn(),
    close: jest.fn()
};

jest.mock('readline', () => ({
    createInterface: jest.fn().mockReturnValue(mockReadlineInterface)
}));

jest.mock('../src/summarize_laravel_db', () => {
    const originalModule = jest.requireActual('../src/summarize_laravel_db');
    return {
        ...originalModule,
        summarizeMigrations: jest.fn(), // Instead of summarizeMigrationsMock
        getReadlineInterface: jest.fn().mockReturnValue(mockReadlineInterface)
    };
});

const {
    parseMigrationFile,
    getAllMigrationFiles,
    generateMermaidERD,
    createSummaryDirectory,
    writeTextSummary,
    isMermaidCliAvailable,
    summarizeMigrations, // Add this line
    main,
    getReadlineInterface
} = require('../src/summarize_laravel_db');

describe('Laravel DB Summarizer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('parseMigrationFile correctly parses a migration file', () => {
        const mockFileContent = `
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->foreign('role_id')->references('id')->on('roles');
        });
    `;
        fs.readFileSync.mockReturnValue(mockFileContent);

        const result = parseMigrationFile('fake_path');

        expect(result.table).toBe('users');
        expect(result.columns).toHaveLength(3);
        expect(result.foreignKeys).toHaveLength(1);
    });

    test('getAllMigrationFiles returns all PHP files recursively', () => {
        const result = getAllMigrationFiles('fake_dir');

        expect(result).toContain('fake_dir/file1.php');
        expect(result).not.toContain('fake_dir/file2.txt');
    });

    test('generateMermaidERD creates correct Mermaid syntax', () => {
        const mockMigrations = [
            {
                table: 'users',
                columns: [{ type: 'id', name: 'id' }, { type: 'string', name: 'name' }],
                foreignKeys: [{ column: 'role_id', references: 'id', on: 'roles' }]
            }
        ];

        const result = generateMermaidERD(mockMigrations);

        expect(result).toContain('erDiagram');
        expect(result).toContain('users {');
        expect(result).toContain('id id');
        expect(result).toContain('string name');
        expect(result).toContain('users ||--o{ roles : "role_id"');
    });

    test('createSummaryDirectory creates directory if it doesn\'t exist', () => {
        fs.existsSync.mockReturnValue(false);

        createSummaryDirectory();

        expect(fs.mkdirSync).toHaveBeenCalled();
    });

    test('writeTextSummary writes correct summary to file', () => {
        const mockMigrations = [
            {
                table: 'users',
                name: 'create_users_table',
                columns: [{ type: 'id', name: 'id' }, { type: 'string', name: 'name' }],
                foreignKeys: [{ column: 'role_id', references: 'id', on: 'roles' }]
            }
        ];

        writeTextSummary('fake_dir', mockMigrations);

        expect(fs.writeFileSync).toHaveBeenCalled();
        const writtenContent = fs.writeFileSync.mock.calls[0][1];
        expect(writtenContent).toContain('Table: users');
        expect(writtenContent).toContain('Migration: create_users_table');
    });

    test('isMermaidCliAvailable returns true when Mermaid CLI is installed', () => {
        childProcess.execSync.mockImplementation(() => {});

        const result = isMermaidCliAvailable();

        expect(result).toBe(true);
    });

    test('isMermaidCliAvailable returns false when Mermaid CLI is not installed', () => {
        childProcess.execSync.mockImplementation(() => {
            throw new Error('Command failed');
        });

        const result = isMermaidCliAvailable();

        expect(result).toBe(false);
    });
});