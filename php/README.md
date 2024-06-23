# Laravel SummDB - DB Summarizer

This tool analyzes Laravel migration files and generates a summary of the database structure, including an Entity-Relationship Diagram (ERD) using Mermaid.js syntax.

[![Latest Stable Version](https://poser.pugx.org/the-provost/laravel-summdb/v/stable)](https://packagist.org/packages/the-provost/laravel-summdb)
[![Total Downloads](https://poser.pugx.org/the-provost/laravel-summdb/downloads)](https://packagist.org/packages/the-provost/laravel-summdb)
[![License](https://poser.pugx.org/the-provost/laravel-summdb/license)](https://packagist.org/packages/the-provost/laravel-summdb)

## Installation

You can install the package via Composer:

```bash
composer require the-provost/laravel-summdb
```

## Usage

After installation, you can use the Laravel SummDB command:

```bash
php artisan db:summarize
```

This command will analyze your Laravel migration files and generate a summary.

## Output

The command generates three files in a 'db-summary' directory within your Laravel project:

1. `text-summary.txt`: A text summary of each table, its columns, and foreign key relationships.
2. `erd.mmd`: Mermaid.js ERD code that can be visualized using tools like the [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/).
3. `erd.png`: A PNG image of the Entity-Relationship Diagram (requires Mermaid CLI to be installed).

If you don't have Mermaid CLI installed, you can still use the `erd.mmd` file to generate the diagram online.

## Requirements

- PHP 7.3 or higher
- Laravel 6.0 or higher

## Configuration

You can publish the configuration file with:

```bash
php artisan vendor:publish --provider="TheProvost\LaravelSummDB\LaravelSummDBServiceProvider" --tag="config"
```

This will publish a `laravel-summdb.php` file in your config directory.

## Integrating with CI/CD Pipeline

To include Laravel SummDB as part of your CI/CD pipeline, you can add the command to your build process. For example, in GitLab CI:

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

## Development

If you want to contribute or modify the tool:

1. Clone the repository:
   ```
   git clone https://github.com/the-provost/laravel-summdb.git
   ```

2. Install dependencies:
   ```
   cd laravel-summdb
   composer install
   ```

3. Run tests:
   ```
   vendor/bin/phpunit
   ```

## Note

This script parses migration files statically and may not capture all complex scenarios or dynamic schema modifications. It's designed as a quick summary tool and may not reflect the exact state of a database that has undergone manual modifications or complex migrations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you find a bug or have a suggestion, please file an issue on the [GitHub repository](https://github.com/the-provost/laravel-summdb/issues).

## Credits

Laravel SummDB makes use of the following open-source packages:
- [Mermaid.js](https://mermaid-js.github.io/mermaid/#/) for ERD generation

## Security

If you discover any security-related issues, please email [your-email@example.com] instead of using the issue tracker.
