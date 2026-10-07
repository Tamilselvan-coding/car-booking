<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="robots" content="noindex, nofollow">
    <title>@yield('title', 'Offer Banners') · Chettinad Express</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('admin-assets/mark.svg') }}">
    <link rel="stylesheet" href="{{ asset('admin-assets/admin.css') }}?v=1">
    @stack('head')
</head>
<body class="@yield('body-class')">
    @include('admin.icons')
    @yield('content')
    @stack('scripts')
</body>
</html>
