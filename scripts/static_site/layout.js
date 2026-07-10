const { escapeHTML } = require('./context');

// Inline SVG icons (CC license marks ported from src/icons/*.js; UI glyphs hand-drawn)
const icons = {
    search: `<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>`,
    menu: `<svg class="icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`,
    cc: `<svg class="icon cc-icon" viewBox="5.5 -3.5 64 64" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M37.441-3.5c8.951 0 16.572 3.125 22.857 9.372 3.008 3.009 5.295 6.448 6.857 10.314 1.561 3.867 2.344 7.971 2.344 12.314 0 4.381-.773 8.486-2.314 12.313-1.543 3.828-3.82 7.21-6.828 10.143-3.123 3.085-6.666 5.448-10.629 7.086-3.961 1.638-8.057 2.457-12.285 2.457s-8.276-.808-12.143-2.429c-3.866-1.618-7.333-3.961-10.4-7.027-3.067-3.066-5.4-6.524-7-10.372S5.5 32.767 5.5 28.5c0-4.229.809-8.295 2.428-12.2 1.619-3.905 3.972-7.4 7.057-10.486C21.08-.394 28.565-3.5 37.441-3.5zm.116 5.772c-7.314 0-13.467 2.553-18.458 7.657-2.515 2.553-4.448 5.419-5.8 8.6a25.204 25.204 0 00-2.029 9.972c0 3.429.675 6.734 2.029 9.913 1.353 3.183 3.285 6.021 5.8 8.516 2.514 2.496 5.351 4.399 8.515 5.715a25.652 25.652 0 009.943 1.971c3.428 0 6.75-.665 9.973-1.999 3.219-1.335 6.121-3.257 8.713-5.771 4.99-4.876 7.484-10.99 7.484-18.344 0-3.543-.648-6.895-1.943-10.057-1.293-3.162-3.18-5.98-5.654-8.458-5.146-5.143-11.335-7.715-18.573-7.715zm-.401 20.915l-4.287 2.229c-.458-.951-1.019-1.619-1.685-2-.667-.38-1.286-.571-1.858-.571-2.856 0-4.286 1.885-4.286 5.657 0 1.714.362 3.084 1.085 4.113.724 1.029 1.791 1.544 3.201 1.544 1.867 0 3.181-.915 3.944-2.743l3.942 2c-.838 1.563-2 2.791-3.486 3.686-1.484.896-3.123 1.343-4.914 1.343-2.857 0-5.163-.875-6.915-2.629-1.752-1.752-2.628-4.19-2.628-7.313 0-3.048.886-5.466 2.657-7.257 1.771-1.79 4.009-2.686 6.715-2.686 3.963-.002 6.8 1.541 8.515 4.627zm18.457 0l-4.229 2.229c-.457-.951-1.02-1.619-1.686-2-.668-.38-1.307-.571-1.914-.571-2.857 0-4.287 1.885-4.287 5.657 0 1.714.363 3.084 1.086 4.113.723 1.029 1.789 1.544 3.201 1.544 1.865 0 3.18-.915 3.941-2.743l4 2c-.875 1.563-2.057 2.791-3.541 3.686a9.233 9.233 0 01-4.857 1.343c-2.896 0-5.209-.875-6.941-2.629-1.736-1.752-2.602-4.19-2.602-7.313 0-3.048.885-5.466 2.658-7.257 1.77-1.79 4.008-2.686 6.713-2.686 3.962-.002 6.783 1.541 8.458 4.627z"/></svg>`,
    ccBy: `<svg class="icon cc-icon" viewBox="5.5 -3.5 64 64" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M37.443-3.5c8.988 0 16.57 3.085 22.742 9.257C66.393 11.967 69.5 19.548 69.5 28.5c0 8.991-3.049 16.476-9.145 22.456-6.476 6.363-14.113 9.544-22.912 9.544-8.649 0-16.153-3.144-22.514-9.43C8.585 44.784 5.5 37.262 5.5 28.5c0-8.761 3.085-16.342 9.257-22.742C20.929-.415 28.472-3.5 37.443-3.5zm.114 5.772c-7.276 0-13.428 2.553-18.457 7.657-5.22 5.334-7.829 11.525-7.829 18.572 0 7.086 2.59 13.22 7.77 18.398 5.181 5.182 11.352 7.771 18.514 7.771 7.123 0 13.334-2.607 18.629-7.828 5.029-4.858 7.543-10.972 7.543-18.343 0-7.314-2.553-13.504-7.656-18.571-5.104-5.104-11.276-7.656-18.514-7.656zm8.572 18.285v13.085h-3.656v15.542h-9.944V33.643h-3.657V20.557c0-.571.2-1.057.601-1.457.4-.399.885-.6 1.456-.6h13.144c.533 0 1.01.2 1.428.6.418.4.628.886.628 1.457zm-13.087-8.228c0-3.008 1.485-4.514 4.458-4.514s4.457 1.504 4.457 4.514c0 2.971-1.486 4.457-4.457 4.457s-4.458-1.486-4.458-4.457z"/></svg>`,
    ccNc: `<svg class="icon cc-icon" viewBox="5.5 -3.5 64 64" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M37.442-3.5c8.99 0 16.571 3.085 22.743 9.256C66.393 11.928 69.5 19.509 69.5 28.5c0 8.992-3.048 16.476-9.145 22.458C53.88 57.32 46.241 60.5 37.442 60.5c-8.686 0-16.19-3.162-22.513-9.485C8.585 44.667 5.5 37.164 5.5 28.5c0-8.662 3.085-16.242 9.257-22.743C20.929-.414 28.471-3.5 37.442-3.5zm-9.714 20.929l-.857 1.286c4.677 2.132 8.591 3.943 11.743 5.433l1.658.767c.19.086.36.16.51.223a26.7 26.7 0 011.115.483l1.714.77 22.457 10.03c.762-2.209 1.144-4.716 1.144-7.521 0-5.943-1.467-10.925-4.401-14.944-2.934-4.018-7.316-6.98-13.147-8.886l-3.199 8.372c2.4.841 4.048 1.834 4.943 2.977.895 1.144 1.343 2.744 1.343 4.801h-7.037c-.021-1.372-.29-2.42-.807-3.146-.518-.725-1.44-1.088-2.768-1.088-.842 0-1.518.238-2.028.715-.511.477-.766 1.106-.766 1.887 0 .61.153 1.111.46 1.505.306.394.87.795 1.69 1.203l-13.767-6.867zm5.486 8.657l-8.114-3.632c-.4 1.562-.6 3.244-.6 5.046 0 5.905 1.467 10.878 4.4 14.915 2.933 4.039 7.181 6.933 12.743 8.686l3.086-8.086c-4.514-1.596-6.771-4.037-6.771-7.324h7.257c0 3.163 1.6 4.743 4.8 4.743 2.278 0 3.417-.951 3.417-2.856 0-.686-.181-1.257-.543-1.715-.362-.457-1.076-.933-2.143-1.428l-17.532-8.349z"/></svg>`,
    ccSa: `<svg class="icon cc-icon" viewBox="5.5 -3.5 64 64" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M37.441-3.5c8.951 0 16.572 3.125 22.857 9.372 3.008 3.009 5.295 6.448 6.857 10.314 1.561 3.867 2.344 7.971 2.344 12.314 0 4.381-.773 8.486-2.314 12.313-1.543 3.828-3.82 7.21-6.828 10.143-3.123 3.085-6.666 5.448-10.629 7.086-3.961 1.638-8.057 2.457-12.285 2.457s-8.276-.808-12.143-2.429c-3.866-1.618-7.333-3.961-10.4-7.027-3.067-3.066-5.4-6.524-7-10.372S5.5 32.767 5.5 28.5c0-4.229.809-8.295 2.428-12.2 1.619-3.905 3.972-7.4 7.057-10.486C21.08-.394 28.565-3.5 37.441-3.5zm.116 5.772c-7.314 0-13.467 2.553-18.458 7.657-2.515 2.553-4.448 5.419-5.8 8.6a25.204 25.204 0 00-2.029 9.972c0 3.429.675 6.734 2.029 9.913 1.353 3.183 3.285 6.021 5.8 8.516 2.514 2.496 5.351 4.399 8.515 5.715a25.652 25.652 0 009.943 1.971c3.428 0 6.75-.665 9.973-1.999 3.219-1.335 6.121-3.257 8.713-5.771 4.99-4.876 7.484-10.99 7.484-18.344 0-3.543-.648-6.895-1.943-10.057-1.293-3.162-3.18-5.98-5.654-8.458-5.146-5.143-11.335-7.715-18.573-7.715zM23.271 23.985c.609-3.924 2.189-6.962 4.742-9.114 2.552-2.152 5.656-3.228 9.314-3.228 5.027 0 9.029 1.62 12.001 4.856 2.971 3.238 4.457 7.391 4.457 12.457 0 4.915-1.543 9-4.627 12.256-3.088 3.258-7.086 4.886-12.002 4.886-3.619 0-6.743-1.085-9.371-3.257-2.629-2.171-4.209-5.257-4.743-9.257h8.115c.19 3.886 2.533 5.829 7.027 5.829 2.248 0 4.057-.972 5.428-2.914 1.373-1.942 2.059-4.534 2.059-7.771 0-3.391-.629-5.971-1.885-7.743-1.258-1.771-3.066-2.657-5.43-2.657-4.268 0-6.667 1.885-7.199 5.656h2.343l-6.342 6.343-6.343-6.343 2.456.001z"/></svg>`
};

function renderMainMenu( ctx, currentPath ) {
    const navItems = [];
    for( const item of ctx.menuStructure ) {
        if( !item.label ) continue;
        const href = ctx.rewriteHref(item.route);
        const active = currentPath !== '/' && href.endsWith(`${currentPath}`) ? ' active' : '';
        navItems.push(`<a class="cta-link nav-item${active}" href="${href}">${escapeHTML(item.label)}</a>`);
    }
    return navItems.join('\n                ');
}

function renderHeader( ctx, currentPath ) {
    return `<div class="sticky header-wrapper">
        <div id="header" class="paper flex-parent jc-space-btw ai-center">
            <a href="${ctx.urlFor('/')}" class="home-link"><img alt="Project Logo" src="${ctx.assetURL('img/mk-banner-logo.png')}"></a>
            <button id="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="main-nav">${icons.menu}</button>
            <nav id="main-nav" class="flex-parent ai-end">
                ${renderMainMenu(ctx, currentPath)}
                <a class="cta-button search-btn" href="${ctx.urlFor('/search/')}"><span>Search</span>${icons.search}</a>
            </nav>
        </div>
    </div>`;
}

function renderStaticNotice( ctx, spaPath ) {
    return `<div id="static-notice">
        This is the static edition. <a href="${ctx.spaURL(spaPath)}">Open this page in the interactive edition &#8594;</a>
    </div>`;
}

// port of DiploMatic.renderFooter()
function renderFooter( ctx ) {
    return `<div id="footer" class="sticky">
        <div class="flex-parent wrap jc-space-around top">
            <div class="copyright">
                <p>
                    <a class="symbols" target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
                        ${icons.cc} ${icons.ccBy} ${icons.ccNc} ${icons.ccSa}
                    </a>
                    Making and Knowing Project.
                </p>
            </div>
            <p>Licensed under <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a></p>
        </div>
        <div class="flex-parent wrap jc-space-around logos">
            <img style="margin-bottom: 14px; margin-right: 10px;" alt="Columbia Logo" src="${ctx.assetURL('img/logo_columbia.png')}">
            <img alt="Center Logo" src="${ctx.assetURL('img/logo_center_multi_line.png')}">
        </div>
        <div class="footer-links">
            <a target="_blank" rel="noopener noreferrer" href="https://cuit.columbia.edu/privacy-notice">Privacy Notice</a>
            <span> | </span>
            <a target="_blank" rel="noopener noreferrer" href="http://health.columbia.edu/disability-services">Disability Services</a>
            <span> | </span>
            <a target="_blank" rel="noopener noreferrer" href="http://eoaa.columbia.edu/columbia-university-non-discrimination-statement-and-policy">Non-Discrimination</a>
        </div>
        <p class="doi">
            DOI:
            <a target="_blank" rel="noopener noreferrer" href="https://doi.org/10.7916/78yt-2v41">https://doi.org/10.7916/78yt-2v41</a>
        </p>
    </div>`;
}

// Render a complete page.
//   title:       page title (site name is appended)
//   path:        mirror path of this page, e.g. '/essays/ann_001_fa_14/'
//   spaPath:     equivalent SPA path (defaults to path minus trailing slash)
//   content:     body HTML for the #content region
//   bodyClass:   optional class for <body>
//   description: optional meta description
//   extraHead:   optional extra tags for <head>
//   scripts:     asset paths of page scripts, e.g. ['js/menu.js']
function renderPage( ctx, options ) {
    const { title, path, content } = options;
    const spaPath = options.spaPath !== undefined
        ? options.spaPath
        : ( path === '/' ? '/' : path.replace(/\/$/, '') );
    const bodyClass = options.bodyClass ? ` class="${options.bodyClass}"` : '';
    const description = options.description
        ? `\n    <meta name="description" content="${escapeHTML(options.description)}">` : '';
    const extraHead = options.extraHead ? `\n    ${options.extraHead}` : '';
    const scriptTags = ['js/menu.js'].concat(options.scripts || [])
        .map( src => `<script defer src="${ctx.assetURL(src)}"></script>` )
        .join('\n    ');
    const fullTitle = path === '/'
        ? 'Secrets of Craft and Nature in Renaissance France — Making and Knowing'
        : `${ctx.removeTags(title)} — Making and Knowing`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHTML(fullTitle)}</title>
    <link rel="canonical" href="${ctx.siteURL}${ctx.basePath}${path}">${description}
    <link rel="icon" href="${ctx.assetURL('img/cropped-MKLizardFilled-32x32.jpg')}">
    <link rel="stylesheet" href="${ctx.assetURL('css/index.css')}">
    <link rel="stylesheet" href="${ctx.assetURL('css/static.css')}">${extraHead}
    ${scriptTags}
</head>
<body${bodyClass}>
<div id="diplomatic" class="sticky static-mirror">
    ${renderHeader(ctx, path)}
    ${renderStaticNotice(ctx, spaPath)}
${content}
    ${renderFooter(ctx)}
</div>
</body>
</html>
`;
}

module.exports.renderPage = renderPage;
module.exports.icons = icons;
