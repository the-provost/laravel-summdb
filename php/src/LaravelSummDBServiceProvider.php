<?php

namespace TheProvost\LaravelSummDB;

use Illuminate\Support\ServiceProvider;

class LaravelSummDBServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(LaravelSummDB::class, function ($app) {
            return new LaravelSummDB();
        });
    }

    public function boot()
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                Console\SummarizeCommand::class,
            ]);
        }
    }
}