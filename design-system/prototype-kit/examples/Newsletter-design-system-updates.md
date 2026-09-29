# Newsletter prototype: design system updates

The Newsletters list page, rebuilt with components from the Filmmakers System design system library. Only the basic changes: the table design with the Simple filter bar, and default font and button sizes. The navbar, breadcrumb and tabs are unchanged.

**How to merge:** the full updated file is at the end. Lines 1–54 (head, navbar, breadcrumb, tabs) are unchanged. Everything from the page heading down, including the script, is new, so replace that part.

## What changed

Codes refer to entries in the design system library.

| # | Change | Library |
|---|---|---|
| 1 | The `FilterBar` import is replaced by the Simple search and filter bar: a search field plus **Status: All** (All, Draft (not sent), Sent). A filter applies as soon as it's picked. **Clear filters** shows once anything is applied. | SF-4 Simple |
| 2 | The results count is a grey row under the bar ("1-5 of 5 newsletters"). | SF-4 Simple |
| 3 | The card has no outline (`--bs-card-border-width:0`). Only the table rows have lines. | SF-4 Simple |
| 4 | `table-hover` is removed. Column headers have `scope="col"`; the actions column has a hidden "Actions" label. | Tables |
| 5 | A table footer shows the count and pagination. There's no line under the last row. | TBL-1 Table footer |
| 6 | When nothing matches, the table is replaced by **No matches found**, and the bar stays so people can change the search. | CNT-11 Empty state |
| 7 | Row actions are `btn-text theme-primary btn-xs` (they were secondary). "more" is now **More**, with an `aria-label` naming the newsletter. | CNT-13 Row actions |
| 8 | The More menu is a standard Bootstrap menu (`data-bs-toggle="menu"`), replacing the state toggle: Duplicate, a divider, then **Delete newsletter** in danger. | CNT-13 Row actions · Menu |
| 9 | Status badges are subtle: **Sent** is success and **Draft** is warning, because a draft still needs someone to act. | MSG-2 Badge |
| 10 | The page title is `h1.fs-2xl.fw-semibold` (it was a default `h2`). | Typography |
| 11 | The recipient and sent-at lines use `fs-xs fg-3` (12px) instead of 13px, and the count is plain text instead of a pill badge. | Typography |

## Check in Claude Design

- **Search input:** the search field uses `value="{{ query }}" onInput="{{ onSearch }}"`, and `onSearch` reads `e.target.value`. If your runtime names the input event differently, change only that attribute.
- **Menus:** the Status and More menus use Bootstrap's own menu (`data-bs-toggle="menu"`), which opens, closes and positions them with keyboard support. This needs `bootstrap.bundle.min.js`, which the page already loads.
- **Pagination:** there are five rows, so the footer shows one page. The markup for more pages is in TBL-1.

## Updated file

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<script src="./ds-base.js"></script>
<script type="module" src="_ds/filmmakers-system-design-system-cfb8060d-cbca-4492-a393-3f8fa1ab7012/vendor/bootstrap.bundle.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.0.1/css/all.min.css">
<style>
html,body{margin:0;height:100%}
body{background:var(--bs-bg-body);color:var(--bs-fg-body);font-family:var(--bs-body-font-family);font-size:var(--bs-body-font-size)}
a:not([class]){color:var(--bs-link-color)}
a:not([class]):hover{color:var(--bs-link-hover-color)}
</style>
</helmet>
<div style="display:flex;flex-direction:column;min-height:100vh">
<nav class="navbar border-bottom">
<div class="container-fluid">
<span class="navbar-brand"><img src="_ds/filmmakers-system-design-system-cfb8060d-cbca-4492-a393-3f8fa1ab7012/assets/logo.svg" alt="Filmmakers System" style="height:22px;display:block"></span>
<div style="display:flex;align-items:center;gap:8px;margin-inline-start:auto">
<select class="form-control form-control-sm" aria-label="Language" style="width:72px">
<option>EN</option>
<option>DE</option>
</select>
<select class="form-control form-control-sm" aria-label="Profile" style="width:110px">
<option>Profile</option>
</select>
<div class="input-group input-group-sm" style="width:220px">
<input class="form-control" placeholder="Search…" aria-label="Search">
<button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Run search"><i class="fa-solid fa-magnifying-glass"></i></button>
</div>
<button type="button" class="btn-text theme-secondary btn-sm btn-icon" aria-label="Help" title="Help"><i class="fa-regular fa-circle-question"></i></button>
<span style="position:relative">
<button type="button" class="btn-text theme-secondary btn-sm btn-icon" aria-label="Notifications" title="Notifications"><i class="fa-regular fa-bell"></i></button>
<span class="badge theme-danger rounded-pill" style="position:absolute;top:2px;right:2px;width:8px;height:8px;padding:0"></span>
</span>
<button type="button" class="btn-text theme-secondary btn-sm" style="display:flex;align-items:center;gap:6px">
<i class="fa-solid fa-circle-user" style="font-size:18px"></i>David<i class="fa-solid fa-chevron-down" style="font-size:10px"></i>
</button>
</div>
</div>
</nav>
<div style="flex:1;padding:20px 28px">
<nav aria-label="Breadcrumb"><ol class="breadcrumb mb-3"><li class="breadcrumb-item"><a class="breadcrumb-link" href="#">Home</a></li><li class="breadcrumb-divider"></li><li class="breadcrumb-item" aria-current="page"><a class="breadcrumb-link active" href="#">Newsletters</a></li></ol></nav>
<nav class="nav nav-tabs mb-3">
<a class="nav-link active" href="Newsletter.dc.html" aria-current="page"><i class="fa-solid fa-envelope-open-text"></i>Newsletters</a>
<a class="nav-link" href="Subscribers.dc.html"><i class="fa-solid fa-users"></i>Subscribers</a>
</nav>

<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
<div style="flex:1"><h1 class="fs-2xl fw-semibold m-0">Newsletters</h1></div>
<a href="Create Newsletter.dc.html" class="btn-solid theme-primary btn-sm"><i class="fa-solid fa-plus"></i>Create newsletter</a>
</div>

<!-- SF-4 Simple search and filter bar, in a card with no outline -->
<div class="card" style="overflow:visible;--bs-card-border-width:0">
<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px">
<div style="display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;flex:1 1 auto;min-width:0">
<div class="input-group input-group-sm" style="width:240px;flex:0 0 auto">
<input class="form-control form-control-sm" type="search" placeholder="Search subject" aria-label="Search newsletters" value="{{ query }}" onInput="{{ onSearch }}">
<button type="button" class="btn-outline theme-secondary btn-sm btn-icon" aria-label="Search" title="Search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>
</div>
<div style="display:flex">
<button type="button" class="btn-subtle theme-secondary btn-sm" data-bs-toggle="menu" aria-expanded="false" style="white-space:nowrap;gap:6px">
<span style="font-weight:600;color:var(--bs-fg-body)">Status:</span>
<span style="color:var(--bs-link-color);font-weight:{{ statusWeight }}">{{ status }}</span>
<i class="fa-solid fa-chevron-down" aria-hidden="true" style="font-size:12px;color:var(--bs-fg-2)"></i>
</button>
<div class="menu" style="min-width:200px">
<sc-for list="{{ statusOptions }}" as="opt">
<button type="button" class="menu-item{{ opt.selectedClass }}" aria-current="{{ opt.current }}" onClick="{{ opt.pick }}">{{ opt.label }}<i class="fa-solid fa-check menu-item-check" aria-hidden="true"></i></button>
</sc-for>
</div>
</div>
<sc-if value="{{ filtered }}"><button type="button" class="btn-text theme-primary btn-sm" style="white-space:nowrap" onClick="{{ onClear }}"><i class="fa-solid fa-xmark" aria-hidden="true"></i>Clear filters</button></sc-if>
</div>
</div>

<!-- Count row: grey band, no lines -->
<div style="display:flex;align-items:center;padding:8px 16px;background:var(--bs-bg-1);font-weight:600;min-height:40px">{{ range }}</div>

<sc-if value="{{ hasResults }}">
<div style="overflow-x:auto">
<table class="table mb-0 align-middle">
<thead><tr><th scope="col">Subject</th><th scope="col">Creation date</th><th scope="col">Status</th><th scope="col" style="width:180px"><span class="visually-hidden">Actions</span></th></tr></thead>
<tbody>
<sc-for list="{{ rows }}" as="row" hint-placeholder-count="5">
<tr>
<td style="{{ row.cellStyle }}"><a href="View Newsletter.dc.html">{{ row.subject }}</a></td>
<td class="fg-3" style="{{ row.cellStyle }}">{{ row.date }}</td>
<td style="{{ row.cellStyle }}">
<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start">
<span class="badge badge-subtle theme-{{ row.statusTheme }}">{{ row.status }}</span>
<span class="fs-xs fg-3">{{ row.recipientsLabel }}: {{ row.recipients }}</span>
<sc-if value="{{ row.sentAt }}"><span class="fs-xs fg-3">Sent at: {{ row.sentAt }}</span></sc-if>
</div>
</td>
<td style="{{ row.cellStyle }}">
<!-- CNT-13 Row actions: btn-text theme-primary btn-xs; More opens a Bootstrap menu -->
<div style="display:flex;justify-content:flex-end;gap:4px;align-items:center">
<sc-if value="{{ row.editable }}"><a href="Edit Newsletter.dc.html" class="btn-text theme-primary btn-xs"><i class="fa-solid fa-pencil" aria-hidden="true"></i>Edit</a></sc-if>
<div>
<button type="button" class="btn-text theme-primary btn-xs" data-bs-toggle="menu" data-bs-placement="bottom-end" aria-expanded="false" aria-label="More actions for {{ row.subject }}"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i>More</button>
<div class="menu">
<button class="menu-item" type="button">Duplicate</button>
<hr class="menu-divider">
<button class="menu-item theme-danger" type="button">Delete newsletter</button>
</div>
</div>
</div>
</td>
</tr>
</sc-for>
</tbody>
</table>
</div>

<!-- TBL-1 Table footer: no line above -->
<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:10px 16px;background:var(--bs-bg-1)">
<span class="fw-semibold">{{ range }}</span>
<nav aria-label="Pagination" style="margin-inline-start:auto"><ul class="pagination pagination-sm theme-primary" style="margin:0">
<li class="page-item disabled"><a class="page-link" href="#" aria-label="Previous page"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></a></li>
<li class="page-item active"><a class="page-link" href="#" aria-current="page">1</a></li>
<li class="page-item disabled"><a class="page-link" href="#" aria-label="Next page"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></li>
</ul></nav>
</div>
</sc-if>

<!-- CNT-11 Empty state, no matches: the bar stays so people can change it -->
<sc-if value="{{ noResults }}">
<div style="padding:48px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center">
<h2 class="fs-md fw-semibold m-0">No matches found</h2>
<p class="fg-2 m-0" style="max-width:52ch">We couldn't find anything matching your search. Try adjusting your keywords, filters, or check for typos.</p>
</div>
</sc-if>
</div>
</div>
</div>

</x-dc>
<script type="text/x-dc" data-dc-script>
const DRAFT = 'Draft (not sent)';
const NEWSLETTERS = [
  { id: 1, subject: 'kjdd', date: '23/07/2026, 15:42 CEST', status: DRAFT, statusTheme: 'warning', recipients: 8, editable: true },
  { id: 2, subject: "What's New", date: '20/05/2026, 10:36 CEST', status: DRAFT, statusTheme: 'warning', recipients: 8, editable: true },
  { id: 3, subject: 'test', date: '17/07/2023, 17:08 CEST', status: DRAFT, statusTheme: 'warning', recipients: 3, editable: true },
  { id: 4, subject: 'Super Newsletter', date: '08/11/2021, 09:45 CET', status: DRAFT, statusTheme: 'warning', recipients: 0, editable: true },
  { id: 5, subject: 'Alles neu macht der Mai', date: '12/11/2021, 12:13 CET', status: 'Sent', statusTheme: 'success', recipients: 1, sentAt: '12/11/2021, 12:16 CET', editable: false }
];
const ALL = 'All';
const STATUSES = [ALL, DRAFT, 'Sent'];

class Component extends DCLogic {
  state = { query: '', status: ALL };

  results() {
    const q = this.state.query.trim().toLowerCase();
    return NEWSLETTERS.filter(r =>
      (!q || r.subject.toLowerCase().includes(q)) &&
      (this.state.status === ALL || r.status === this.state.status));
  }

  renderVals() {
    const list = this.results();
    const { status } = this.state;
    return {
      query: this.state.query,
      onSearch: (e) => this.setState({ query: e.target.value }),
      status,
      statusWeight: status === ALL ? 400 : 600,
      statusOptions: STATUSES.map(label => ({
        label,
        selectedClass: label === status ? ' selected' : '',
        current: label === status ? 'true' : 'false',
        pick: () => this.setState({ status: label })
      })),
      filtered: this.state.query.trim() !== '' || status !== ALL,
      onClear: () => this.setState({ query: '', status: ALL }),
      range: list.length ? `1-${list.length} of ${list.length} newsletters` : `0 of ${NEWSLETTERS.length} newsletters`,
      hasResults: list.length > 0,
      noResults: list.length === 0,
      rows: list.map((r, i) => ({
        ...r,
        recipientsLabel: r.status === DRAFT ? 'Estimated recipients' : 'Recipients',
        // No line under the last row: the footer follows directly.
        cellStyle: i === list.length - 1 ? 'border-bottom-width:0' : ''
      }))
    };
  }
}

</script>
</body>
</html>
```
