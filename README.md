# Laravel SummDB - DB Summarizer

This tool analyzes Laravel migration files and generates a summary of the database structure, including an Entity-Relationship Diagram (ERD) using Mermaid.js syntax.

[![npm version](https://img.shields.io/npm/v/laravel-db-summary.svg?style=badge)](https://www.npmjs.com/package/laravel-db-summary)
[![License](https://img.shields.io/github/license/the-provost/laravel-summDB.svg?style=badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/the-provost/laravel-summDB.svg?style=badge)](https://github.com/the-provost/laravel-summdb/stargazers)
[![GitHub tag](https://img.shields.io/github/tag/the-provost/laravel-summDB.svg?style=badge)](https://github.com/the-provost/laravel-summdb/tags)
![NPM Downloads](https://img.shields.io/npm/dt/laravel-db-summary)

---

### Package Name
The name of the package on the github repo is a portmanteau of 'Summed Up' to denote a summing up of the DB of the app.

The npm package name however is a clear and understandable 'laravel-db-summary'.

## Installation

You can install Laravel DB Summarizer globally using npm:

```
npm install -g laravel-db-summary
```

Or use it directly with npx:

```
npx laravel-db-summary
```

## Usage

There are two ways to use Laravel DB Summarizer:

1. **Interactive Mode**:
   Run the tool without any arguments, and it will prompt you for the Laravel project path:
   
```
laravel-db-summary
```

2. **Command Line Mode**:
   Provide the path to your Laravel project as an argument:
   
```
laravel-db-summary /path/to/your/laravel/project
```

## Output

The script generates three files in a 'db-summary' directory:

1. `text-summary.txt`: A text summary of each table, its columns, and foreign key relationships.
2. `erd.mmd`: Mermaid.js ERD code that can be visualized using tools like the [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/).
3. `erd.png`: A PNG image of the Entity-Relationship Diagram (requires Mermaid CLI to be installed).

If you don't have Mermaid CLI installed, you can still use the `erd.mmd` file to generate the diagram online.

## Requirements

- Node.js (version 12.0.0 or higher)
- A Laravel project with migration files

## Integrating with CI/CD Pipeline

To include Laravel DB Summarizer as part of your CI/CD pipeline, follow these steps:

1. **Install Laravel DB Summarizer in your CI environment**:
   Add this to your CI configuration file (e.g., `.gitlab-ci.yml`, `.github/workflows/main.yml`):

   ```yaml
   - npm install -g laravel-db-summary
   ```

2. **Run Laravel DB Summarizer**:
   Add a step in your CI pipeline to run the tool:

   ```yaml
   - laravel-db-summary /path/to/your/laravel/project
   ```

3. **Archive the generated files**:
   Configure your CI to archive the `db-summary` directory as an artifact. For example, in GitLab CI:

   ```yaml
   artifacts:
     paths:
       - db-summary/
   ```

4. **Optional: Generate PNG in CI**:
   If you want to generate the PNG in your CI pipeline, ensure Mermaid CLI is installed:

   ```yaml
   - npm install -g @mermaid-js/mermaid-cli
   ```

5. **Example GitLab CI configuration**:

   ```yaml
   stages:
     - build
     - test
     - document

   document_db:
     stage: document
     script:
       - npm install -g laravel-db-summary @mermaid-js/mermaid-cli
       - laravel-db-summary .
     artifacts:
       paths:
         - db-summary/
   ```

6. **Example GitHub Actions workflow**:

   ```yaml
   name: Document Database
   on: [push]
   jobs:
     document:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v2
       - name: Use Node.js
         uses: actions/setup-node@v2
         with:
           node-version: '14'
       - run: npm install -g laravel-db-summary @mermaid-js/mermaid-cli
       - run: laravel-db-summary .
       - uses: actions/upload-artifact@v2
         with:
           name: db-summary
           path: db-summary/
   ```

By following these steps, you'll ensure that every build of your Laravel application includes an up-to-date database summary and ERD.

## Development

If you want to contribute or modify the tool:

1. Clone the repository:

```
git clone https://github.com/the-provost/laravel-summdb.git
```

2. Install dependencies:
```
cd laravel-summdb
npm install
```

3. Make your changes and test them:

```
npm start
```

## Note

This script parses migration files statically and may not capture all complex scenarios or dynamic schema modifications. It's designed as a quick summary tool and may not reflect the exact state of a database that has undergone manual modifications or complex migrations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you find a bug or have a suggestion, please file an issue on the [GitHub repository](https://github.com/the-provost/laravel-db-summary/issues).

## Credits

Laravel SummDB makes use of the following open-source packages:
- [Mermaid.js](https://mermaid-js.github.io/mermaid/#/) for ERD generation