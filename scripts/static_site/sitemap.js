const fs = require('fs');

function write( ctx, pages ) {
    const urls = pages.map( page =>
        `    <url><loc>${ctx.siteURL}${ctx.basePath}${page.path}</loc></url>` ).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
    fs.writeFileSync( `${ctx.staticDir}/sitemap.xml`, xml );
}

module.exports.write = write;
