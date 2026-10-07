@extends('admin.layout')
@section('content')
<a class="skip-link" href="#main-content">Skip to content</a>
<div class="workspace">
    <aside class="sidebar" id="sidebar">
        <a class="brand" href="{{ route('admin.dashboard') }}"><span class="brand-mark"><x-icon name="road"/></span><span>Chettinad<span class="brand-sub">EXPRESS</span></span></a>
        <span class="workspace-label">ADMIN WORKSPACE</span>
        <nav aria-label="Main navigation">
            <span class="nav-label">MANAGE</span>
            <a class="nav-item selected" href="{{ route('admin.dashboard') }}" aria-current="page"><x-icon name="banner"/><span>Offer banners</span><span class="nav-dot"></span></a>
            <a class="nav-item" href="{{ route('offers.preview') }}" target="_blank" rel="noopener"><x-icon name="eye"/><span>Live offer preview</span><x-icon name="external" class="nav-external"/></a>
            <span class="nav-label second-label">RESOURCES</span>
            <button class="nav-item" type="button" data-help><x-icon name="help"/><span>Banner guide</span></button>
        </nav>
        <div class="sidebar-note"><span class="note-icon"><x-icon name="pin"/></span><h3>Made for memorable journeys.</h3><p>Bring your best destinations into the spotlight.</p></div>
        <div class="sidebar-bottom"><span class="online-dot"></span><span>Chettinad Express admin</span><span class="version">v1.0</span></div>
    </aside>
    <div class="workspace-main">
        <header class="topbar">
            <div class="breadcrumb"><button class="icon-button mobile-menu" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="sidebar"><x-icon name="menu"/></button><span>Workspace</span><x-icon name="chevrons"/><strong>Offer banners</strong></div>
            <div class="account"><span class="account-name">{{ auth()->user()->name }}<small>Administrator</small></span><span class="avatar">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 2)) }}</span><form action="{{ route('admin.session.logout') }}" method="post">@csrf<button class="icon-button" title="Sign out" aria-label="Sign out"><x-icon name="logout"/></button></form></div>
        </header>
        <main id="main-content" class="main-content">
            <div class="page-heading"><div><div class="eyebrow muted-eyebrow">A LITTLE INSPIRATION, A LOT MORE JOURNEYS</div><h1>Offer banners<span class="heading-dot">.</span></h1><p>Create, curate, and share your best travel offers.</p></div><button class="button button-primary" data-create><x-icon name="plus"/> Create banner</button></div>
            <section class="welcome-card" aria-label="Welcome"><div class="welcome-copy"><span class="welcome-tag"><span class="online-dot"></span> YOUR NEXT GREAT OFFER</span><h2>A good offer. A great journey.</h2><p>Put a destination in the spotlight.<br>Give your customers one more reason to go.</p><button class="text-button" data-create>Create something worth the trip <x-icon name="arrow"/></button></div><img src="{{ asset('admin-assets/madurai.png') }}" alt="A scenic drive through Madurai at sunset"><span class="hero-location"><x-icon name="pin"/> Madurai, Tamil Nadu</span></section>
            <section class="stats" aria-label="Banner overview">
                <div class="stat-card"><span class="stat-icon burgundy"><x-icon name="banner"/></span><div><span>Total banners</span><strong id="stat-total">—</strong></div><small>All your offers</small></div>
                <div class="stat-card"><span class="stat-icon green"><x-icon name="circle-check"/></span><div><span>Live now</span><strong id="stat-live">—</strong></div><small>Visible to customers</small></div>
                <div class="stat-card"><span class="stat-icon amber"><x-icon name="calendar"/></span><div><span>Scheduled</span><strong id="stat-scheduled">—</strong></div><small>Ready for a future date</small></div>
                <div class="stat-card"><span class="stat-icon grey"><x-icon name="pause"/></span><div><span>Inactive</span><strong id="stat-inactive">—</strong></div><small>Waiting for their moment</small></div>
            </section>
            <div id="page-error" class="notice notice-error" role="alert" hidden></div>
            <div class="content-grid">
                <section class="panel banner-panel" aria-labelledby="banners-heading">
                    <div class="panel-heading"><div class="panel-title"><h2 id="banners-heading">Your banners</h2><span class="count-pill" id="banner-count">0</span></div><button class="icon-button" id="refresh" title="Refresh banners" aria-label="Refresh banners"><x-icon name="refresh"/></button></div>
                    <div class="list-toolbar"><div class="tabs" role="group" aria-label="Filter by status"><button class="tab selected" data-filter="all" aria-pressed="true">All banners</button><button class="tab" data-filter="active" aria-pressed="false">Active</button><button class="tab" data-filter="inactive" aria-pressed="false">Inactive</button></div><label class="search-field"><x-icon name="search"/><input id="banner-search" type="search" placeholder="Search banners…" maxlength="255" aria-label="Search banners"></label></div>
                    <div id="loading" class="loading-state" role="status">Loading your banners…</div>
                    <div id="empty-state" class="empty-state" hidden><div class="empty-art"><span class="art-back"></span><span class="art-front"><x-icon name="banner"/></span><span class="art-plus"><x-icon name="plus"/></span></div><span class="subtle-label">A FRESH START</span><h3 id="empty-title">Your first offer starts here</h3><p id="empty-copy">A destination, a great price, and a beautiful image.<br>That’s all you need to get going.</p><button class="button button-primary" data-create><x-icon name="plus"/> Create your first banner</button></div>
                    <div id="table-container" class="table-scroll" hidden><table><thead><tr><th>Banner</th><th>Pricing</th><th>Dates</th><th>Status</th><th class="actions-heading">Actions</th></tr></thead><tbody id="banner-rows"></tbody></table></div>
                    <div class="list-footer"><span id="pagination-info">Your offers will appear here</span><div class="pagination"><button class="icon-button" id="previous-page" aria-label="Previous page" disabled><x-icon name="chevrons" class="rotate"/></button><span id="page-number">1</span><button class="icon-button" id="next-page" aria-label="Next page" disabled><x-icon name="chevrons"/></button></div></div>
                </section>
                <aside class="preview-column">
                    <section class="panel preview-panel"><div class="panel-heading"><h2>Live preview</h2><span class="preview-eyebrow"><span class="online-dot"></span> CUSTOMER VIEW</span></div><div id="live-preview" class="preview-content"><div class="preview-placeholder"><x-icon name="eye"/><h3>No offer is live yet</h3><p>Once you activate a banner, your customers will see it here.</p></div></div><a class="preview-link" href="{{ route('offers.preview') }}" target="_blank" rel="noopener">Open full preview <x-icon name="external"/></a></section>
                    <section class="tip-card"><span class="tip-icon"><x-icon name="help"/></span><h3>One offer, centre stage.</h3><p>Only one banner can be active at a time. Activating a new one automatically turns off the previous offer.</p><button class="text-button" data-help>How banners work <x-icon name="arrow"/></button></section>
                </aside>
            </div>
            <footer class="workspace-footer"><span>© {{ date('Y') }} Chettinad Express</span><span>Thoughtful offers. Memorable journeys.</span></footer>
        </main>
    </div>
</div>
<dialog id="banner-dialog" class="drawer" aria-labelledby="form-heading">
    <div class="drawer-heading"><div><span class="subtle-label">OFFER STUDIO</span><h2 id="form-heading">Create a banner</h2><p>A little inspiration for the next journey.</p></div><button class="icon-button" type="button" data-close-editor aria-label="Close banner form"><x-icon name="close"/></button></div>
    <form id="banner-form" class="banner-form" novalidate>
        <div class="form-content">
            <div class="notice notice-error" id="form-error" role="alert" hidden></div>
            <label for="banner-title">Title / destination <span class="required">*</span></label><input id="banner-title" name="title" maxlength="255" placeholder="e.g. Chennai to Madurai" required><span class="field-error" data-error="title"></span>
            <label for="banner-image">Banner image <span class="required">*</span></label>
            <div class="upload-zone" id="upload-zone"><div id="upload-placeholder"><span class="upload-icon"><x-icon name="upload"/></span><strong>Click to upload <span>or drag and drop</span></strong><small>JPG, PNG or WebP · Up to 5 MB</small><small>A wide image looks best (16:9 recommended)</small></div><img id="upload-preview" alt="Selected banner preview" hidden><span id="replace-label" class="replace-label" hidden>Click to replace image</span><input id="banner-image" type="file" name="banner_image" accept="image/jpeg,image/png,image/webp" aria-describedby="image-file-name"></div><small id="image-file-name" class="file-name">No image selected</small><span class="field-error" data-error="banner_image"></span>
            <div class="form-section-label">MAKE IT A GREAT DEAL</div>
            <div class="form-row"><div><label for="actual-price">Actual price <span class="required">*</span></label><div class="currency-input"><span>₹</span><input id="actual-price" name="actual_price" type="number" step="0.01" min="0" max="9999999999.99" placeholder="6,500" required></div><span class="field-error" data-error="actual_price"></span></div><div><label for="offer-price">Offer price <span class="required">*</span></label><div class="currency-input"><span>₹</span><input id="offer-price" name="offer_price" type="number" step="0.01" min="0" max="9999999999.99" placeholder="5,000" required></div><span class="field-error" data-error="offer_price"></span></div></div>
            <div class="savings-note" id="savings-note" hidden></div>
            <div class="form-row"><div><label for="from-date">From date <span class="required">*</span></label><input id="from-date" name="from_date" type="date" required><span class="field-error" data-error="from_date"></span></div><div><label for="to-date">To date <span class="required">*</span></label><input id="to-date" name="to_date" type="date" required><span class="field-error" data-error="to_date"></span></div></div>
            <div class="activation-option"><div><label for="is-active">Activate this banner</label><p>Show this offer during the selected dates.</p></div><label class="switch"><input id="is-active" name="is_active" type="checkbox"><span></span></label></div><p class="activation-hint">Activating replaces the current offer immediately. A future start date keeps this banner hidden until that date.</p><span class="field-error" data-error="is_active"></span>
        </div>
        <div class="drawer-footer"><button type="button" class="button button-secondary" data-close-editor>Cancel</button><button type="submit" id="save-banner" class="button button-primary"><x-icon name="check"/><span>Save banner</span></button></div>
    </form>
</dialog>
<dialog id="confirm-dialog" class="confirm-dialog" aria-labelledby="confirm-heading"><span class="confirm-icon"><x-icon name="banner"/></span><h2 id="confirm-heading">Update this banner?</h2><p id="confirm-copy"></p><div class="confirm-actions"><button class="button button-secondary" id="confirm-cancel">Cancel</button><button class="button button-primary" id="confirm-accept">Continue</button></div></dialog>
<dialog id="help-dialog" class="help-dialog" aria-labelledby="help-heading"><div class="panel-heading"><h2 id="help-heading">A quick guide to banners</h2><button class="icon-button" id="close-help" aria-label="Close guide"><x-icon name="close"/></button></div><div class="help-content"><div><span>01</span><section><h3>Create your offer</h3><p>Add a destination, a wide image, and your regular and offer prices. The offer price must be equal to or lower than the regular price.</p></section></div><div><span>02</span><section><h3>Choose the dates</h3><p>Both the start and end dates are included. Dates follow {{ config('app.timezone') }}. An active future offer appears when its start date arrives.</p></section></div><div><span>03</span><section><h3>Give it the spotlight</h3><p>Activate your banner when you are ready. Only one banner can be active. Activating a future offer also deactivates the existing offer immediately.</p></section></div><div><span>04</span><section><h3>Keep things fresh</h3><p>Edit an offer any time, turn it off, or delete it. Expired offers are hidden automatically; older banners are not reactivated.</p></section></div></div></dialog>
<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
@endsection
@push('scripts')<script src="{{ asset('admin-assets/admin.js') }}?v=1" defer></script>@endpush
