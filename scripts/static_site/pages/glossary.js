// Static port of GlossaryView.js: the full 1,197-term glossary as one
// crawlable page with A-Z anchors and a small client-side filter.

const layout = require('../layout');

const alpha = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','Z'];

// port of GlossaryView.renderMeanings
function renderMeanings( entry ) {
    const meaningList = [];
    for( let i=0; i < entry.meanings.length; i++ ) {
        const meaning = entry.meanings[i];
        const refString = meaning.references ? ` [${meaning.references}]` : '';
        const numString = (entry.meanings.length > 1) ? `${i+1}. ` : '';
        const space = i < entry.meanings.length - 1 ? ' ' : '';
        meaningList.push( `${numString}${meaning.meaning}${refString}${space}` );
    }
    return meaningList;
}

// port of the entry format in GlossaryView.renderGlossary:
// {head-word}, {alternate-spelling}: {meaning-number}. {part-of-speech} {meaning} [{references}]
function renderEntry( ctx, entry ) {
    const meanings = renderMeanings( entry );
    const meaningsEndWithPeriod = meanings[ meanings.length-1 ].endsWith('.');
    const altString = entry.alternateSpellings ? `, ${entry.alternateSpellings}` : '';
    const pos = entry.meanings[0].partOfSpeech;
    const partOfSpeech = pos ? `${pos}:` : '';
    const modPunctuation = pos ? ',' : ':';
    const modString = entry.modernSpelling ? ` (mod. ${entry.modernSpelling})` : '';
    const comma = meaningsEndWithPeriod ? '' : ',';
    const seeAlso = entry.seeAlso ? `${comma} see also <span>&#8594;</span>${entry.seeAlso} ` : '';
    const synonym = entry.synonym ? `, syn. <span>&#8594;</span>${entry.synonym}` : '';
    const antonym = entry.antonym ? `, ant. <span>&#8594;</span>${entry.antonym}` : '';

    // filter terms: headword + modern spelling split on space, alternates on ', '
    const filterTerms = []
        .concat( entry.headWord.toLowerCase().split(' ') )
        .concat( (entry.modernSpelling||'').toLowerCase().split(' ') )
        .concat( (entry.alternateSpellings||'').toLowerCase().split(', ') )
        .filter( term => term.length > 0 );

    return `<p class="glossary-entry" data-filter-terms="${ctx.escapeHTML(filterTerms.join('|'))}">` +
        `<u>${ctx.escapeHTML(entry.headWord)}</u>${ctx.escapeHTML(altString)}${ctx.escapeHTML(modString)}${modPunctuation} ` +
        `${ctx.escapeHTML(partOfSpeech)} ${meanings.join('')}${seeAlso}${synonym}${antonym}</p>`;
}

function generate( ctx ) {
    const entryList = Object.values( ctx.glossary );

    const parts = [];
    let alphaIndex = 0;
    for( const entry of entryList ) {
        if( entry.headWord[0] === alpha[alphaIndex] ) {
            parts.push(`<h4 class="alpha-heading" id="alpha-${alphaIndex}">&mdash; ${alpha[alphaIndex]} &mdash;</h4>`);
            alphaIndex++;
        }
        parts.push( renderEntry(ctx, entry) );
    }

    const alphaLinks = alpha.map( (letter, i) =>
        `<a href="#alpha-${i}">${letter}</a>` ).join(' ');

    const content = `
<div id="glossaryView" class="static-glossary">
    <div id="glossaryContent">
        <h1 class="title">Glossary</h1>
        <p class="subtitle">For short titles, e.g., [COT1611], see <a href="${ctx.urlFor('/content/resources/bibliography/')}">Bibliography</a>.</p>
        <div class="cite-instructions">
            <p class="cite-header">How to Cite</p>
            <p>&ldquo;Glossary.&rdquo; In <i>Secrets of Craft and Nature in Renaissance France. A Digital Critical Edition and English Translation of BnF Ms. Fr. 640</i>, edited by Making and Knowing Project, Pamela H. Smith, Naomi Rosenkranz, Tianna Helena Uchacz, Tillmann Taape, Cl&eacute;ment Godbarge, Sophie Pitman, Jenny Boulboull&eacute;, Joel Klein, Donna Bilak, Marc Smith, and Terry Catapano. New York: Making and Knowing Project, 2020. <a href="https://edition640.makingandknowing.org/#/folios/1r/f/1r/glossary">https://edition640.makingandknowing.org/#/folios/1r/f/1r/glossary</a>.</p>
        </div>
        <div class="glossary-controls">
            <input id="glossary-filter" class="searchBox" type="text" placeholder="Filter by Entry" hidden>
            <div class="alphaNav"><span>Go to: </span>${alphaLinks}</div>
        </div>
        <div id="glossary-entries">
${parts.join('\n')}
        </div>
    </div>
</div>`;

    const html = layout.renderPage( ctx, {
        title: 'Glossary',
        path: '/glossary/',
        spaPath: '/folios/1r/f/1r/glossary',
        bodyClass: 'glossary',
        description: 'Glossary of early modern French terms in BnF Ms. Fr. 640, with meanings and references.',
        content,
        scripts: [ 'js/glossary.js' ]
    });

    return [ { path: '/glossary/', html } ];
}

module.exports.generate = generate;
