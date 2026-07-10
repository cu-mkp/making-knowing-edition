// Static port of annotation_list_view/AnnotationListView.js: research essays
// grouped into theme sections, rendered as cards.

const layout = require('../layout');
const essayCard = require('../essay_card');
const contentPages = require('./content');

// same grouping/ordering as AnnotationActions.loadAnnotationManifest
function annotationSections( ctx ) {
    const sections = {};
    for( const annotation of ctx.annotations ) {
        if( !sections[annotation.theme] ) {
            sections[annotation.theme] = { name: annotation.theme, annotations: [annotation] };
        } else {
            sections[annotation.theme].annotations.push(annotation);
        }
    }
    const sorted = Object.values(sections).sort( (a,b) =>
        a.name.toUpperCase() < b.name.toUpperCase() ? -1
        : a.name.toUpperCase() > b.name.toUpperCase() ? 1 : 0 );
    let i = 0;
    for( const section of sorted ) {
        section.id = `section-${i++}`;
        section.annotations.sort( (a,b) => (+a.displayOrder) - (+b.displayOrder) );
    }
    return sorted;
}

function generate( ctx ) {
    const sections = annotationSections( ctx );

    const sectionHTML = sections.map( section => `
        <div>
            <h3 class="section-title" id="${section.id}">${ctx.escapeHTML(section.name)}</h3>
            <hr class="section-divider">
            <div class="flex-parent wrap jc-space-around">
                ${section.annotations.map( anno => essayCard.renderCard(ctx, anno) ).join('\n')}
            </div>
        </div>` ).join('\n');

    const menuNode = {
        page_heading: 'Research Essays for BnF Ms. Fr. 640',
        header_graphic_filename: 'banner-essays.png',
        sections: sections.map( s => ({ title: s.name, id: s.id }) )
    };

    const content = contentPages.renderContentPage( ctx, menuNode,
        `<div id="annotation-list-view">${sectionHTML}</div>` );

    const html = layout.renderPage( ctx, {
        title: 'Research Essays',
        path: '/essays/',
        spaPath: '/essays',
        bodyClass: 'essays',
        description: 'Research essays exploring the content and context of BnF Ms. Fr. 640.',
        content
    });

    return [ { path: '/essays/', html } ];
}

module.exports.generate = generate;
module.exports.annotationSections = annotationSections;
