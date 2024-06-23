<?php

namespace TheProvost\LaravelSummDB;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class LaravelSummDB
{
    protected $migrationsPath;
    protected $summaryDir;

    public function summarize($path)
    {
        $this->migrationsPath = $path . '/database/migrations';
        $this->summaryDir = $path . '/db-summary';

        if (!File::isDirectory($this->migrationsPath)) {
            throw new \Exception("Error: The directory {$this->migrationsPath} does not exist.");
        }

        $files = $this->getAllMigrationFiles($this->migrationsPath);
        $migrations = array_map([$this, 'parseMigrationFile'], $files);

        $this->createSummaryDirectory();
        $this->writeTextSummary($migrations);
        $mermaidCode = $this->generateMermaidERD($migrations);
        $this->writeMermaidERD($mermaidCode);

        if ($this->isMermaidCliAvailable()) {
            $this->generateERDImage();
        } else {
            $this->provideMermaidInstructions();
        }
    }

    protected function parseMigrationFile($filePath)
    {
        $content = File::get($filePath);
        preg_match("/Schema::create\('(\w+)'/", $content, $tableName);
        preg_match_all("/\\\$table->(\w+)\('([\w_]+)'/", $content, $columns);
        preg_match_all("/\\\$table->foreign\('([\w_]+)'\)->references\('([\w_]+)'\)->on\('(\w+)'\)/", $content, $foreignKeys);

        return [
            'name' => basename($filePath),
            'table' => $tableName[1] ?? 'Unknown',
            'columns' => array_map(function($type, $name) {
                return ['type' => $type, 'name' => $name];
            }, $columns[1] ?? [], $columns[2] ?? []),
            'foreignKeys' => array_map(function($column, $references, $on) {
                return ['column' => $column, 'references' => $references, 'on' => $on];
            }, $foreignKeys[1] ?? [], $foreignKeys[2] ?? [], $foreignKeys[3] ?? [])
        ];
    }

    protected function getAllMigrationFiles($dir)
    {
        $files = File::allFiles($dir);
        return array_filter($files, function($file) {
            return Str::endsWith($file, '.php');
        });
    }

    protected function generateMermaidERD($migrations)
    {
        $mermaidCode = "erDiagram\n";

        foreach ($migrations as $migration) {
            $mermaidCode .= "    {$migration['table']} {\n";
            foreach ($migration['columns'] as $column) {
                $mermaidCode .= "        {$column['type']} {$column['name']}\n";
            }
            $mermaidCode .= "    }\n";
        }

        foreach ($migrations as $migration) {
            foreach ($migration['foreignKeys'] as $fk) {
                $mermaidCode .= "    {$migration['table']} ||--o{ {$fk['on']} : \"{$fk['column']}\"\n";
            }
        }

        return $mermaidCode;
    }

    protected function createSummaryDirectory()
    {
        if (File::isDirectory($this->summaryDir)) {
            File::deleteDirectory($this->summaryDir);
        }
        File::makeDirectory($this->summaryDir);
    }

    protected function writeTextSummary($migrations)
    {
        $summary = "Laravel Application Database Summary:\n";
        $summary .= "====================================\n\n";

        foreach ($migrations as $migration) {
            $summary .= "Table: {$migration['table']}\n";
            $summary .= "Migration: {$migration['name']}\n";
            $summary .= "Columns:\n";
            foreach ($migration['columns'] as $column) {
                $summary .= "  - {$column['name']} ({$column['type']})\n";
            }
            if (!empty($migration['foreignKeys'])) {
                $summary .= "Foreign Keys:\n";
                foreach ($migration['foreignKeys'] as $fk) {
                    $summary .= "  - {$fk['column']} references {$fk['references']} on {$fk['on']}\n";
                }
            }
            $summary .= "\n";
        }

        File::put($this->summaryDir . '/text-summary.txt', $summary);
        echo "Text summary saved to db-summary/text-summary.txt.\n";
    }

    protected function writeMermaidERD($mermaidCode)
    {
        File::put($this->summaryDir . '/erd.mmd', $mermaidCode);
        echo "Mermaid ERD code saved to db-summary/erd.mmd.\n";
    }

    protected function isMermaidCliAvailable()
    {
        exec('mmdc --version', $output, $returnVar);
        return $returnVar === 0;
    }

    protected function generateERDImage()
    {
        $mmdPath = $this->summaryDir . '/erd.mmd';
        $pngPath = $this->summaryDir . '/erd.png';

        exec("mmdc -i {$mmdPath} -o {$pngPath}", $output, $returnVar);

        if ($returnVar === 0) {
            echo "ERD image saved to db-summary/erd.png.\n";
        } else {
            echo "Error generating ERD image. Mermaid CLI might not be installed correctly.\n";
            $this->provideMermaidInstructions();
        }
    }

    protected function provideMermaidInstructions()
    {
        echo "To visualize the ERD:\n";
        echo "1. Copy the contents of db-summary/erd.mmd\n";
        echo "2. Visit https://mermaid-js.github.io/mermaid-live-editor/\n";
        echo "3. Paste the code and click \"Render\"\n";
    }
}