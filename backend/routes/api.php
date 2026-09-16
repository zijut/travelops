<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DepartureController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\JamaahController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\VisaController;
use App\Http\Middleware\JwtAuthenticate;
use App\Http\Middleware\RequireRole;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - TravelOps Backend Final (Laravel)
|--------------------------------------------------------------------------
*/

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:60,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::middleware([JwtAuthenticate::class])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Protected Core Application Routes
Route::middleware([JwtAuthenticate::class])->group(function () {

    // ----------------------------------------------------
    // Admin & User Management (RBAC Protected)
    // ----------------------------------------------------
    Route::prefix('admin')->group(function () {
        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin,Ops Staff'])->group(function () {
            Route::get('/users', [AdminController::class, 'index']);
            Route::get('/users/{id}', [AdminController::class, 'show']);
        });

        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin'])->group(function () {
            Route::post('/users', [AdminController::class, 'store']);
            Route::put('/users/{id}', [AdminController::class, 'update']);
            Route::delete('/users/{id}', [AdminController::class, 'destroy']);
        });

        Route::middleware([RequireRole::class . ':Super Admin'])->group(function () {
            Route::get('/stats', [AdminController::class, 'stats']);
            Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
            Route::post('/reset-seeds', [AdminController::class, 'resetSeeds']);
        });
    });

    // ----------------------------------------------------
    // Travel Packages Routes
    // ----------------------------------------------------
    Route::prefix('packages')->group(function () {
        Route::get('/', [PackageController::class, 'index']);
        Route::get('/{id}', [PackageController::class, 'show']);

        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin'])->group(function () {
            Route::post('/', [PackageController::class, 'store']);
            Route::put('/{id}', [PackageController::class, 'update']);
            Route::delete('/{id}', [PackageController::class, 'destroy']);
        });
    });

    // ----------------------------------------------------
    // Jamaah & Document Routes (Prompt 9)
    // ----------------------------------------------------
    Route::prefix('jamaah')->group(function () {
        Route::get('/', [JamaahController::class, 'index']);
        Route::get('/{id}', [JamaahController::class, 'show']);

        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin,Ops Staff'])->group(function () {
            Route::post('/', [JamaahController::class, 'store']);
            Route::put('/{id}', [JamaahController::class, 'update']);
            Route::delete('/{id}', [JamaahController::class, 'destroy']);
        });

        // Document sub-routes
        Route::get('/{id}/documents', [DocumentController::class, 'index']);
        Route::post('/{id}/documents', [DocumentController::class, 'upload']);
        Route::get('/{id}/checklist', [DocumentController::class, 'checklist']);
    });

    // Direct Document Routes
    Route::prefix('documents')->group(function () {
        Route::get('/{id}/download', [DocumentController::class, 'download']);
        Route::patch('/{id}/verify', [DocumentController::class, 'verify']);
    });

    // ----------------------------------------------------
    // Departure & Flight Schedule Routes (Prompt 9)
    // ----------------------------------------------------
    Route::prefix('departures')->group(function () {
        Route::get('/', [DepartureController::class, 'index']);
        Route::get('/{id}', [DepartureController::class, 'show']);

        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin'])->group(function () {
            Route::post('/', [DepartureController::class, 'store']);
            Route::put('/{id}', [DepartureController::class, 'update']);
        });

        Route::patch('/{id}/status', [DepartureController::class, 'updateStatus']);
    });

    // ----------------------------------------------------
    // Bookings & Reservations Routes (Prompt 7)
    // ----------------------------------------------------
    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingController::class, 'index']);
        Route::get('/{id}', [BookingController::class, 'show']);
        Route::post('/', [BookingController::class, 'store']);

        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin,Ops Staff'])->group(function () {
            Route::put('/{id}', [BookingController::class, 'update']);
            Route::delete('/{id}', [BookingController::class, 'destroy']);
        });

        Route::patch('/{id}/status', [BookingController::class, 'updateStatus']);

        // Payments sub-routes (Prompt 8)
        Route::get('/{id}/payments', [PaymentController::class, 'getByBooking']);
        Route::post('/{id}/payments', [PaymentController::class, 'store']);
    });

    // ----------------------------------------------------
    // Payments Direct Routes (Prompt 8)
    // ----------------------------------------------------
    Route::prefix('payments')->group(function () {
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::patch('/{id}/status', [PaymentController::class, 'updateStatus']);
    });

    // ----------------------------------------------------
    // Operations Tasks Routes
    // ----------------------------------------------------
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::get('/{id}', [TaskController::class, 'show']);
        Route::post('/', [TaskController::class, 'store']);
        Route::put('/{id}', [TaskController::class, 'update']);
        Route::patch('/{id}/toggle', [TaskController::class, 'toggle']);
        Route::delete('/{id}', [TaskController::class, 'destroy']);
    });

    // ----------------------------------------------------
    // Finance Routes
    // ----------------------------------------------------
    Route::prefix('finance')->group(function () {
        Route::get('/', [FinanceController::class, 'index']);
        Route::get('/summary', [FinanceController::class, 'summary']);

        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin'])->group(function () {
            Route::post('/', [FinanceController::class, 'store']);
            Route::delete('/{id}', [FinanceController::class, 'destroy']);
        });
    });

    // ----------------------------------------------------
    // Visa Records Routes
    // ----------------------------------------------------
    Route::prefix('visa')->group(function () {
        Route::get('/', [VisaController::class, 'index']);
        Route::get('/{jamaahId}', [VisaController::class, 'getByJamaahId']);

        Route::middleware([RequireRole::class . ':Super Admin,Travel Admin,Ops Staff'])->group(function () {
            Route::put('/{jamaahId}', [VisaController::class, 'update']);
        });
    });

    // ----------------------------------------------------
    // Notifications Routes
    // ----------------------------------------------------
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::patch('/read-all', [NotificationController::class, 'markAllRead']);
        Route::patch('/{id}/read', [NotificationController::class, 'markRead']);
    });
});
