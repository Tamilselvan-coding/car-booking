<?php

use App\Http\Middleware\EnsureAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['admin' => EnsureAdmin::class]);
        $middleware->statefulApi();
        $middleware->redirectGuestsTo(fn (Request $request): ?string => $request->is('api/*') ? null : route('admin.sign-in'));
        $middleware->redirectUsersTo('/admin');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request, Throwable $exception): bool => $request->is('api/*') || $request->expectsJson(),
        );

        // Preserve Laravel's exception mapping and headers while giving all API
        // failures the same envelope. Unexpected errors are still reported.
        $exceptions->respond(function (Response $response): Response {
            if (! request()->is('api/*') || $response->getStatusCode() < 400) {
                return $response;
            }

            $status = $response->getStatusCode();
            $original = json_decode($response->getContent(), true) ?? [];
            $body = [
                'status' => false,
                'message' => $status >= 500
                    ? 'An unexpected error occurred. Please try again.'
                    : ($original['message'] ?? Response::$statusTexts[$status] ?? 'Request failed.'),
            ];

            if (isset($original['errors'])) {
                $body['errors'] = $original['errors'];
            }

            $response->setContent(json_encode($body, JSON_THROW_ON_ERROR));
            $response->headers->set('Content-Type', 'application/json');

            return $response;
        });
    })->create();
