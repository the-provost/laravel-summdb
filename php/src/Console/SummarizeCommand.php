<?php

namespace TheProvost\LaravelSummDB\Console;

use Illuminate\Console\Command;
use TheProvost\LaravelSummDB\LaravelSummDB;

class SummarizeCommand extends Command
{
    protected $signature = 'db:summarize {path? : Path to Laravel project}';
    protected $description = 'Summarize the database structure from migration files';

    public function handle(LaravelSummDB $summDB)
    {
        $path = $this->argument('path') ?: base_path();
        $summDB->summarize($path);
        $this->info('Database summary generated successfully!');
    }
}