@extends('admin.layout')
@section('title', 'Admin Sign In')
@section('body-class', 'login-page')
@section('content')
<main class="login-shell">
    <section class="login-story">
        <img src="{{ asset('admin-assets/madurai.png') }}" alt="An evening drive past the temple towers of Madurai" class="login-photo">
        <div class="story-shade"></div>
        <a class="brand brand-light" href="{{ route('admin.sign-in') }}"><span class="brand-mark"><x-icon name="road"/></span><span>Chettinad<span class="brand-sub">EXPRESS</span></span></a>
        <div class="story-copy"><span class="eyebrow">EVERY JOURNEY STARTS HERE</span><h1>Great destinations.<br>Even better offers.</h1><p>A little inspiration goes a long way. Bring your next travel offer to life.</p><span class="location-label"><x-icon name="pin"/> Madurai, Tamil Nadu</span></div>
    </section>
    <section class="login-content">
        <div class="login-top"><span class="subtle-label">ADMIN WORKSPACE</span><span class="secure-label"><x-icon name="shield"/> Secure sign in</span></div>
        <div class="login-card">
            <span class="login-emblem"><x-icon name="road"/></span>
            <h2>Welcome back.</h2><p class="login-intro">Sign in to manage your offers and keep the journeys coming.</p>
            @if($errors->any())
                <div class="notice notice-error" role="alert">{{ $errors->first() }}</div>
            @endif
            <form method="post" action="{{ route('admin.session.login') }}" class="login-form">
                @csrf
                <label for="email">Email address</label>
                <div class="input-icon"><x-icon name="mail"/><input id="email" name="email" type="email" value="{{ old('email') }}" placeholder="you@chettinadexpress.com" autocomplete="username" required autofocus></div>
                <label for="password">Password</label>
                <div class="input-icon"><x-icon name="lock"/><input id="password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" required></div>
                <button type="submit" class="button button-primary login-submit">Sign in to workspace <x-icon name="arrow"/></button>
            </form>
            <p class="login-access"><x-icon name="shield"/> Access is reserved for authorised administrators.</p>
        </div>
        <footer class="login-footer"><span>© {{ date('Y') }} Chettinad Express</span><span>Your journey. Our care.</span></footer>
    </section>
</main>
@endsection
