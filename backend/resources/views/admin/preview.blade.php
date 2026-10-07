@extends('admin.layout')
@section('title', 'Live Offer Preview')
@section('content')
<main class="standalone-preview">
    <header><a class="brand" href="{{ route('admin.dashboard') }}"><span class="brand-mark"><x-icon name="road"/></span><span>Chettinad<span class="brand-sub">EXPRESS</span></span></a><span class="subtle-label">LIVE OFFER PREVIEW</span></header>
    @if($banner)
        <section class="customer-offer"><img src="{{ url(Storage::disk('public')->url($banner->banner_image)) }}" alt="{{ $banner->title }}"><div><span class="eyebrow">YOUR NEXT JOURNEY, FOR LESS</span><h1>{{ $banner->title }}</h1><p class="customer-price"><del>₹{{ number_format($banner->actual_price, 2) }}</del><strong>₹{{ number_format($banner->offer_price, 2) }}</strong></p><p><x-icon name="calendar"/> Available {{ $banner->from_date->format('d M Y') }} – {{ $banner->to_date->format('d M Y') }}</p></div></section>
    @else
        <section class="preview-empty"><span class="login-emblem"><x-icon name="eye"/></span><h1>No offer is live right now.</h1><p>An active banner appears here when today falls within its selected dates.</p><a class="button button-primary" href="{{ route('admin.dashboard') }}">Back to the workspace <x-icon name="arrow"/></a></section>
    @endif
    <footer>Chettinad Express · Your journey. Our care.</footer>
</main>
@endsection
