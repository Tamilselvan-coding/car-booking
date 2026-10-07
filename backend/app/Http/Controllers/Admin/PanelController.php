<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminLoginRequest;
use App\Models\Banner;
use App\Services\AdminAuthService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PanelController extends Controller
{
    public function signIn(): View
    {
        return view('admin.login');
    }

    public function login(AdminLoginRequest $request, AdminAuthService $auth): RedirectResponse
    {
        try {
            $user = $auth->authenticate($request->validated());
        } catch (HttpException $exception) {
            throw ValidationException::withMessages(['email' => $exception->getMessage()]);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    public function dashboard(): View
    {
        return view('admin.dashboard');
    }

    public function preview(): View
    {
        return view('admin.preview', ['banner' => Banner::query()->currentlyActive()->first()]);
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.sign-in');
    }
}
