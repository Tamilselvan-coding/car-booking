/* global document, window, fetch, URL, URLSearchParams, FormData, AbortController, File, DataTransfer, setTimeout, clearTimeout */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const editor = $('#banner-dialog');
  const form = $('#banner-form');
  const fileInput = $('#banner-image');
  const state = { page: 1, lastPage: 1, status: 'all', search: '', rows: [], editing: null, imageUrl: null, busy: false, today: '', hasActive: false };
  const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value));
  const date = (value) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  let activeRequest;
  let toastTimer;

  function notify(message, error = false) {
    const toast = $('#toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle('error', error);
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin', cache: 'no-store', ...options,
      headers: { Accept: 'application/json', 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').content, ...options.headers },
    });
    const data = await response.json().catch(() => ({ message: 'Unable to read the server response. Please try again.' }));
    if (response.status === 401 || response.status === 419) {
      window.location.assign('/admin/login');
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong. Please try again.');
      error.fields = data.errors || {};
      throw error;
    }
    return data;
  }

  function bannerStatus(banner) {
    if (!banner.is_active) return { label: 'Inactive', css: '' };
    if (banner.from_date > state.today) return { label: 'Scheduled', css: 'badge-scheduled' };
    if (banner.to_date < state.today) return { label: 'Expired', css: 'badge-expired' };
    return { label: 'Live', css: 'badge-live' };
  }

  function renderRows(result) {
    state.rows = result.data;
    state.page = result.meta.current_page;
    state.lastPage = result.meta.last_page;
    state.today = result.meta.today;
    state.hasActive = result.summary.active > 0;
    for (const key of ['total', 'live', 'scheduled', 'inactive']) $(`#stat-${key}`).textContent = result.summary[key];
    $('#banner-count').textContent = result.summary.total;
    $('#table-container').hidden = !state.rows.length;
    $('#empty-state').hidden = !!state.rows.length;
    const filtered = !!state.search || state.status !== 'all';
    $('#empty-title').textContent = filtered ? 'No banners found' : 'Your first offer starts here';
    $('#empty-copy').textContent = filtered ? 'Try a different search or switch to All banners.' : 'A destination, a great price, and a beautiful image. That’s all you need to get going.';
    $('#empty-state [data-create]').hidden = filtered;
    $('#empty-state .subtle-label').textContent = filtered ? 'KEEP EXPLORING' : 'A FRESH START';
    $('#banner-rows').innerHTML = state.rows.map((banner) => {
      const status = bannerStatus(banner);
      return `<tr>
        <td><div class="offer-cell"><img src="${escape(banner.banner_image)}" alt="" loading="lazy"><div><strong title="${escape(banner.title)}">${escape(banner.title)}</strong><small>Banner #${banner.id}</small></div></div></td>
        <td class="price-cell"><strong>${money(banner.offer_price)}</strong><del>${money(banner.actual_price)}</del></td>
        <td class="date-cell"><span>${date(banner.from_date)}</span><span>to ${date(banner.to_date)}</span></td>
        <td><span class="badge ${status.css}">${status.label}</span></td>
        <td><div class="row-actions"><button type="button" class="row-toggle" role="switch" aria-checked="${banner.is_active}" aria-label="${banner.is_active ? 'Deactivate' : 'Activate'} ${escape(banner.title)}" data-action="status" data-id="${banner.id}"></button><button type="button" class="icon-button" title="Edit banner" aria-label="Edit ${escape(banner.title)}" data-action="edit" data-id="${banner.id}">${icon('edit')}</button><button type="button" class="icon-button" title="Delete banner" aria-label="Delete ${escape(banner.title)}" data-action="delete" data-id="${banner.id}">${icon('trash')}</button></div></td>
      </tr>`;
    }).join('');
    const start = result.meta.total ? (state.page - 1) * result.meta.per_page + 1 : 0;
    const end = Math.min(state.page * result.meta.per_page, result.meta.total);
    $('#pagination-info').textContent = result.meta.total ? `Showing ${start}–${end} of ${result.meta.total} banners` : 'Your offers will appear here';
    $('#page-number').textContent = state.page;
    $('#previous-page').disabled = state.page <= 1;
    $('#next-page').disabled = state.page >= state.lastPage;
  }

  function renderPreview(banner) {
    $('#live-preview').innerHTML = banner ? `
      <img class="live-offer-image" src="${escape(banner.banner_image)}" alt="${escape(banner.title)}">
      <span class="live-offer-label">A LITTLE MORE REASON TO GO</span>
      <h3 class="live-offer-title">${escape(banner.title)}</h3>
      <p class="live-offer-price"><strong>${money(banner.offer_price)}</strong><del>${money(banner.actual_price)}</del></p>
      <p class="live-offer-date">${icon('calendar')} Until ${date(banner.to_date)}</p>` : `
      <div class="preview-placeholder">${icon('eye')}<h3>No offer is live yet</h3><p>Once you activate a banner, your customers will see it here.</p></div>`;
  }

  async function loadBanners() {
    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;
    $('#page-error').hidden = true;
    $('#refresh').disabled = true;
    try {
      const params = new URLSearchParams({ page: state.page, per_page: 6, status: state.status, search: state.search });
      const [result, preview] = await Promise.all([
        api(`/api/admin/banners?${params}`, { signal: controller.signal }),
        api('/api/banners/active', { signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      if (!result.data.length && state.page > result.meta.last_page) {
        state.page = result.meta.last_page;
        return loadBanners();
      }
      renderRows(result);
      renderPreview(preview.data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        $('#page-error').textContent = error.message;
        $('#page-error').hidden = false;
      }
    } finally {
      if (!controller.signal.aborted) {
        $('#loading').hidden = true;
        $('#refresh').disabled = false;
      }
    }
  }

  function clearErrors() {
    $('#form-error').hidden = true;
    form.querySelectorAll('[data-error]').forEach((element) => { element.textContent = ''; });
    form.querySelectorAll('.field-invalid').forEach((element) => {
      element.classList.remove('field-invalid');
      element.removeAttribute('aria-invalid');
    });
  }

  function showFormError(message, fields = {}) {
    $('#form-error').textContent = message;
    $('#form-error').hidden = false;
    for (const [name, messages] of Object.entries(fields)) {
      const target = form.querySelector(`[data-error="${name}"]`);
      if (target) target.textContent = messages.join(' ');
      const input = form.elements.namedItem(name);
      if (input) { input.classList.add('field-invalid'); input.setAttribute('aria-invalid', 'true'); }
    }
    $('.form-content').scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showImage(source, filename) {
    $('#upload-preview').hidden = !source;
    $('#upload-placeholder').hidden = !!source;
    $('#replace-label').hidden = !source;
    if (source) $('#upload-preview').src = source;
    else $('#upload-preview').removeAttribute('src');
    $('#image-file-name').textContent = filename || 'No image selected';
  }

  function releaseImage() {
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    state.imageUrl = null;
  }

  function openEditor(banner = null) {
    state.editing = banner;
    state.busy = false;
    form.reset();
    clearErrors();
    releaseImage();
    $('#form-heading').textContent = banner ? 'Edit your banner' : 'Create a banner';
    $('#save-banner span').textContent = banner ? 'Save changes' : 'Save banner';
    $('#save-banner').disabled = false;
    for (const name of ['title', 'actual_price', 'offer_price', 'from_date', 'to_date']) form.elements.namedItem(name).value = banner?.[name] ?? '';
    $('#is-active').checked = !!banner?.is_active;
    fileInput.required = !banner;
    $('#from-date').value ||= state.today;
    $('#to-date').min = $('#from-date').value;
    showImage(banner?.banner_image, banner ? 'Current banner image · choose a file to replace it' : '');
    updateSavings();
    editor.showModal();
    $('.form-content').scrollTop = 0;
    $('#banner-title').focus();
  }

  function closeEditor() {
    if (state.busy) return;
    editor.close();
    releaseImage();
  }

  function selectFile(file) {
    const errors = [];
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) errors.push('Choose a JPG, PNG, or WebP image.');
    if (file && file.size > 5 * 1024 * 1024) errors.push('The image must be no larger than 5 MB.');
    releaseImage();
    if (errors.length) {
      fileInput.value = '';
      showImage(state.editing?.banner_image, state.editing ? 'Current banner image' : '');
      showFormError('Please check your image.', { banner_image: errors });
      return;
    }
    clearErrors();
    if (file) {
      state.imageUrl = URL.createObjectURL(file);
      showImage(state.imageUrl, `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    } else showImage(state.editing?.banner_image, state.editing ? 'Current banner image' : '');
  }

  function updateSavings() {
    const actual = Number($('#actual-price').value);
    const offer = Number($('#offer-price').value);
    const show = $('#actual-price').value && $('#offer-price').value && actual >= offer && actual > 0 && offer >= 0;
    $('#savings-note').hidden = !show;
    if (show) $('#savings-note').textContent = `Your customers save ${money(actual - offer)} (${Math.round((actual - offer) / actual * 100)}% off).`;
  }

  function confirmAction(title, message, label, danger = false) {
    const dialog = $('#confirm-dialog');
    $('#confirm-heading').textContent = title;
    $('#confirm-copy').textContent = message;
    const accept = $('#confirm-accept');
    const cancel = $('#confirm-cancel');
    accept.textContent = label;
    accept.className = `button ${danger ? 'button-danger' : 'button-primary'}`;
    return new Promise((resolve) => {
      function finish(value) {
        accept.removeEventListener('click', yes);
        cancel.removeEventListener('click', no);
        dialog.removeEventListener('cancel', no);
        dialog.close();
        resolve(value);
      }
      function yes() { finish(true); }
      function no(event) { event?.preventDefault(); finish(false); }
      accept.addEventListener('click', yes);
      cancel.addEventListener('click', no);
      dialog.addEventListener('cancel', no);
      dialog.showModal();
      cancel.focus();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.busy) return;
    clearErrors();
    if (!form.reportValidity()) return;
    if (Number($('#offer-price').value) > Number($('#actual-price').value)) {
      showFormError('Please check the offer price.', { offer_price: ['Offer price cannot be greater than actual price.'] });
      return;
    }
    if ($('#to-date').value < $('#from-date').value) {
      showFormError('Please check the dates.', { to_date: ['End date must be on or after the start date.'] });
      return;
    }
    if ($('#is-active').checked && state.hasActive && !state.editing?.is_active) {
      const accepted = await confirmAction('Replace the active offer?', 'Saving this banner as active will turn off your current offer immediately. A future start date keeps the new offer hidden until that date.', 'Save and activate');
      if (!accepted) return;
    }
    state.busy = true;
    $('#save-banner').disabled = true;
    $('#save-banner span').textContent = 'Saving…';
    const data = new FormData(form);
    data.set('is_active', $('#is-active').checked ? '1' : '0');
    if (!fileInput.files.length) data.delete('banner_image');
    const id = state.editing?.id;
    if (id) data.set('_method', 'PUT');
    try {
      await api(`/api/admin/banners${id ? `/${id}` : ''}`, { method: 'POST', body: data });
      state.busy = false;
      closeEditor();
      notify(id ? 'Your banner has been updated.' : 'Your new banner is ready.');
      state.page = 1;
      await loadBanners();
    } catch (error) {
      showFormError(error.message, error.fields);
    } finally {
      state.busy = false;
      $('#save-banner').disabled = false;
      $('#save-banner span').textContent = id ? 'Save changes' : 'Save banner';
    }
  });

  $('#banner-rows').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || state.busy) return;
    const banner = state.rows.find((row) => row.id === Number(button.dataset.id));
    if (!banner) return;
    const action = button.dataset.action;
    if (action === 'edit') { openEditor(banner); return; }
    state.busy = true;
    try {
      const deleting = action === 'delete';
      const active = !banner.is_active;
      const title = deleting ? 'Delete this banner?' : active ? 'Give this offer the spotlight?' : 'Turn off this offer?';
      const message = deleting ? `“${banner.title}” and its image will be permanently removed.` : active ? 'This will replace any currently active offer. Your selected dates determine when customers can see it.' : 'Customers will no longer see this banner. You can activate it again whenever you are ready.';
      const accepted = await confirmAction(title, message, deleting ? 'Delete banner' : active ? 'Activate banner' : 'Deactivate banner', deleting);
      if (!accepted) return;
      button.disabled = true;
      await api(`/api/admin/banners/${banner.id}${deleting ? '' : '/status'}`, deleting ? { method: 'DELETE' } : { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: active }) });
      notify(deleting ? 'Banner deleted.' : active ? 'Banner activated. Your selected dates apply.' : 'Banner deactivated.');
      await loadBanners();
    } catch (error) {
      notify(error.message, true);
    } finally {
      state.busy = false;
      button.disabled = false;
    }
  });

  document.querySelectorAll('[data-create]').forEach((button) => button.addEventListener('click', () => { if (!state.busy) openEditor(); }));
  document.querySelectorAll('[data-close-editor]').forEach((button) => button.addEventListener('click', closeEditor));
  editor.addEventListener('cancel', (event) => { event.preventDefault(); closeEditor(); });
  fileInput.addEventListener('change', () => selectFile(fileInput.files[0]));
  const upload = $('#upload-zone');
  upload.addEventListener('dragover', (event) => { event.preventDefault(); upload.classList.add('dragover'); });
  upload.addEventListener('dragleave', () => upload.classList.remove('dragover'));
  upload.addEventListener('drop', (event) => {
    event.preventDefault(); upload.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) { const transfer = new DataTransfer(); transfer.items.add(file); fileInput.files = transfer.files; selectFile(file); }
  });
  for (const id of ['#actual-price', '#offer-price']) $(id).addEventListener('input', updateSavings);
  $('#from-date').addEventListener('change', () => { $('#to-date').min = $('#from-date').value; });
  let searchTimer;
  $('#banner-search').addEventListener('input', (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.search = event.target.value.trim(); state.page = 1; loadBanners(); }, 250);
  });
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    state.status = button.dataset.filter;
    state.page = 1;
    document.querySelectorAll('[data-filter]').forEach((tab) => { const selected = tab === button; tab.classList.toggle('selected', selected); tab.setAttribute('aria-pressed', String(selected)); });
    loadBanners();
  }));
  $('#refresh').addEventListener('click', loadBanners);
  $('#previous-page').addEventListener('click', () => { if (state.page > 1) { state.page--; loadBanners(); } });
  $('#next-page').addEventListener('click', () => { if (state.page < state.lastPage) { state.page++; loadBanners(); } });
  document.querySelectorAll('[data-help]').forEach((button) => button.addEventListener('click', () => $('#help-dialog').showModal()));
  $('#close-help').addEventListener('click', () => $('#help-dialog').close());
  $('#menu-toggle').addEventListener('click', () => {
    const open = $('#sidebar').classList.toggle('open');
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#sidebar, #menu-toggle')) { $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); }
  });
  loadBanners();
})();
