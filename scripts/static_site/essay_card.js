// Static port of src/component/annotation_list_view/AnnotationCard.js

const comingSoon = 'This essay is under revision.';

function renderByLine( ctx, annotation ) {
    const authorIDs = annotation.authors || annotation.authorIDs || [];
    const names = [];
    for( const authorID of authorIDs ) {
        const author = ctx.authors[authorID];
        if( !author ) continue;
        const tip = [ `${author.semester} ${author.year}`, author.authorType,
            `${author.degree || ''} ${author.yearAtTime || ''}`.trim(),
            `${author.department || ''} ${author.subField || ''}`.trim() ]
            .filter( s => s && s.length > 0 ).join(' · ');
        names.push(`<span title="${ctx.escapeHTML(tip)}">${ctx.escapeHTML(author.fullName)}</span>`);
    }
    return names.join(', ');
}

function renderCard( ctx, annotation ) {
    const abstract = ( !annotation.abstract || annotation.abstract.length === 0 )
        ? comingSoon : annotation.abstract;
    const title = annotation.name.length > 0 ? annotation.name : `No Title (${annotation.id})`;
    const theme = annotation.theme.length > 0 ? annotation.theme : `No Theme (${annotation.id})`;
    const thumbnailURL = ctx.annotationThumbURL(annotation);
    const readable = ctx.essayIsReadable(annotation);
    const essayURL = ctx.urlFor(`/essays/${annotation.id}/`);

    const cardTop = `
        <div class="card-media" style="height: 200px; background-image: url('${thumbnailURL}')"></div>
        <div class="card-lr-padding theme-title-container">
            <p class="anno-theme">${ctx.escapeHTML(theme)}</p>
            <p class="anno-title line-clamp">${title}</p>
            <p class="anno-byline">${renderByLine(ctx, annotation)}</p>
        </div>`;

    return `<div class="annotation-card paper">
        <div class="bg-maroon-gradient accent-bar"></div>
        ${ readable
            ? `<a class="card-action-area" href="${essayURL}">${cardTop}</a>`
            : `<div class="card-action-area disabled">${cardTop}</div>` }
        <div class="card-lr-padding abstract-container">
            <span class="anno-abstract line-clamp three-lines">${ctx.escapeHTML(ctx.removeTags(abstract))}</span>
            <div class="read-essay-link">
                ${ readable ? `<a class="cta-link with-icon light" href="${essayURL}">Read Essay</a>` : '' }
            </div>
        </div>
    </div>`;
}

module.exports.renderCard = renderCard;
module.exports.renderByLine = renderByLine;
