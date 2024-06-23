# Laravel SummDB - DB Summarizer

This tool analyzes Laravel migration files and generates a summary of the database structure, including an Entity-Relationship Diagram (ERD) using Mermaid.js syntax.


[![License](https://img.shields.io/github/license/the-provost/laravel-summDB.svg?style=badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/the-provost/laravel-summDB.svg?style=badge)](https://github.com/the-provost/laravel-summdb/stargazers)
[![GitHub tag](https://img.shields.io/github/tag/the-provost/laravel-summDB.svg?style=badge)](https://github.com/the-provost/laravel-summdb/tags)

#### NPM
[![npm version](https://img.shields.io/npm/v/laravel-db-summary.svg?style=badge)](https://www.npmjs.com/package/laravel-db-summary)
![NPM Downloads](https://img.shields.io/npm/dt/laravel-db-summary)

#### COMPOSER
[![Packagist Version](https://img.shields.io/packagist/v/the-provost/laravel-summdb.svg?style=flat-square)](https://packagist.org/packages/the-provost/laravel-summdb)
![Composer Downloads](https://img.shields.io/packagist/dt/the-provost/laravel-summdb?style=flat-square)

---

### Package Name
The name of the package on the github repo is a portmanteau of 'Summed Up' to denote a summing up of the DB of the app.

The npm package name however is a clear and understandable 'laravel-db-summary'.

## Installation
### NPM:

You can install Laravel DB Summarizer globally using npm:

```
npm install -g laravel-db-summary
```

Or use it directly with npx:

```
npx laravel-db-summary
```

#### COMPOSER:

You can install the package via Composer:

```bash
composer require the-provost/laravel-summdb
```

## Usage
### NPM:

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


### COMPOSER

After installation, you can use the Laravel SummDB command:

```bash
php artisan db:summarize
```

This command will analyze your Laravel migration files and generate a summary.


## Output

The script generates three files in a 'db-summary' directory:

1. `text-summary.txt`: A text summary of each table, its columns, and foreign key relationships.
2. `erd.mmd`: Mermaid.js ERD code that can be visualized using tools like the [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/).
3. `erd.png`: A PNG image of the Entity-Relationship Diagram (requires Mermaid CLI to be installed).

If you don't have Mermaid CLI installed, you can still use the `erd.mmd` file to generate the diagram online.

## Requirements

- Node.js (version 12.0.0 or higher)
- A Laravel project with migration files

## Documentation
For detailed documentation, please refer to:

- npm Package README
- Composer Package README

## Development
To contribute or modify the tool:

- Clone the repository:
```
git clone https://github.com/the-provost/laravel-summdb.git
```

Navigate to the desired package directory (js/ or php/) and follow the development instructions in the respective README.

## Configuration
### COMPOSER:

You can publish the configuration file with:

```bash
php artisan vendor:publish --provider="TheProvost\LaravelSummDB\LaravelSummDBServiceProvider" --tag="config"
```

This will publish a `laravel-summdb.php` file in your config directory.


## Integrating with CI/CD Pipeline 
#### NPM:

To include Laravel DB Summarizer as part of your CI/CD pipeline, follow these steps:

1. **Install Laravel DB Summarizer in your CI environment**:
   Add this to your CI configuration file (e.g., `.gitlab-ci.yml`, `.github/workflows/main.yml`):

   ```yaml
   - js install -g laravel-db-summary
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
   - js install -g @mermaid-js/mermaid-cli
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
       - js install -g laravel-db-summary @mermaid-js/mermaid-cli
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
       - run: js install -g laravel-db-summary @mermaid-js/mermaid-cli
       - run: laravel-db-summary .
       - uses: actions/upload-artifact@v2
         with:
           name: db-summary
           path: db-summary/
   ```

#### COMPOSER:

To include Laravel SummDB as part of your Laravel CI/CD pipeline, you can add the command to your build process. For example, in GitLab CI:

```yaml
stages:
  - build
  - test
  - document

document_db:
  stage: document
  script:
    - php artisan db:summarize
  artifacts:
    paths:
      - db-summary/
```


By following these steps, you'll ensure that every build of your Laravel application includes an up-to-date database summary and ERD.

## Note

This script parses migration files statically and may not capture all complex scenarios or dynamic schema modifications. It's designed as a quick summary tool and may not reflect the exact state of a database that has undergone manual modifications or complex migrations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you find a bug or have a suggestion, please file an issue on the [GitHub repository](https://github.com/the-provost/laravel-summDB/issues).

## Credits

Laravel SummDB makes use of the following open-source packages:
- [Mermaid.js](https://mermaid-js.github.io/mermaid/#/) for ERD generation
