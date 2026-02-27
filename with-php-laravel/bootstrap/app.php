<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        config([
            'app.key' => 'php example polar',
            'app.env' => 'local',
            'session.driver' => 'file',
            'cache.default' => 'file',
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => ':memory:',
        ]);

        $middleware->validateCsrfTokens(except: [
            '/polar/webhooks'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
