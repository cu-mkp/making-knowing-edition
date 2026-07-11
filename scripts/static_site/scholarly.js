// Machine-readable scholarship metadata: Highwire/Google Scholar citation
// meta tags and schema.org JSON-LD. Purpose: make the mirror indexable by
// scholarly search engines and legible to AI/retrieval tools.

const { escapeHTML } = require('./context');

const EDITION_TITLE = 'Secrets of Craft and Nature in Renaissance France. ' +
    'A Digital Critical Edition and English Translation of BnF Ms. Fr. 640';
const EDITION_DOI = 'https://doi.org/10.7916/78yt-2v41';
const PUBLISHER = 'Making and Knowing Project';
const EDITION_EDITORS = [
    'Making and Knowing Project', 'Pamela H. Smith', 'Naomi Rosenkranz',
    'Tianna Helena Uchacz', 'Tillmann Taape', 'Clément Godbarge',
    'Sophie Pitman', 'Jenny Boulboullé', 'Joel Klein', 'Donna Bilak',
    'Marc Smith', 'Terry Catapano'
];
const EDITION_YEAR = '2020';

// escape closing tags so the payload is safe inside <script type="application/ld+json">
function jsonLDScript( data ) {
    return `<script type="application/ld+json">${JSON.stringify(data).replace(/<\//g,'<\\/')}</script>`;
}

function absoluteURL( ctx, url ) {
    if( !url ) return url;
    return url.startsWith('/') ? `${ctx.siteURL}${url}` : url;
}

function bareDOI( doiURL ) {
    if( !doiURL ) return null;
    return doiURL.replace(/^https?:\/\/(www\.)?doi\.org\//, '');
}

// year the essay was published in the edition (from its Cite As block);
// annotation.year is the course year the essay was written
function publicationYear( annotation ) {
    const match = ( annotation.citeAs || '' ).match(/Making and Knowing Project, (\d{4})/);
    return match ? match[1] : EDITION_YEAR;
}

function essayAuthors( ctx, annotation ) {
    const authorIDs = annotation.authors || annotation.authorIDs || [];
    const people = [];
    for( const authorID of authorIDs ) {
        const author = ctx.authors[authorID];
        if( author ) people.push(author);
    }
    return people;
}

// the edition as a schema.org entity, referenced from essay/folio pages
function editionEntity( ctx ) {
    return {
        '@type': 'Book',
        '@id': EDITION_DOI,
        name: EDITION_TITLE,
        editor: EDITION_EDITORS.map( name => ({ '@type': name === PUBLISHER ? 'Organization' : 'Person', name }) ),
        publisher: { '@type': 'Organization', name: PUBLISHER },
        datePublished: EDITION_YEAR,
        url: `${ctx.siteURL}${ctx.basePath}/`,
        sameAs: EDITION_DOI,
        inLanguage: ['en', 'fr']
    };
}

// Google Scholar (Highwire) citation meta tags for an essay page
function essayCitationMeta( ctx, annotation, canonicalURL ) {
    const tags = [];
    const meta = ( name, content ) => {
        if( content ) tags.push(`<meta name="${name}" content="${escapeHTML(content)}">`);
    };
    meta( 'citation_title', ctx.removeTags(annotation.fullTitle) );
    for( const author of essayAuthors(ctx, annotation) ) {
        meta( 'citation_author', author.fullName );
    }
    meta( 'citation_publication_date', publicationYear(annotation) );
    meta( 'citation_inbook_title', EDITION_TITLE );
    meta( 'citation_publisher', PUBLISHER );
    meta( 'citation_doi', bareDOI(annotation.doi) );
    meta( 'citation_abstract_html_url', canonicalURL );
    meta( 'citation_language', 'en' );
    return tags.join('\n    ');
}

// schema.org ScholarlyArticle JSON-LD for an essay page
function essayJsonLD( ctx, annotation, canonicalURL ) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'ScholarlyArticle',
        headline: ctx.removeTags(annotation.fullTitle),
        author: essayAuthors(ctx, annotation).map( author => {
            const person = { '@type': 'Person', name: author.fullName };
            if( author.department ) person.knowsAbout = author.department;
            return person;
        }),
        datePublished: publicationYear(annotation),
        dateCreated: annotation.year,
        url: canonicalURL,
        inLanguage: 'en',
        isPartOf: editionEntity( ctx ),
        publisher: { '@type': 'Organization', name: PUBLISHER }
    };
    if( annotation.doi ) {
        data.sameAs = annotation.doi;
        data.identifier = { '@type': 'PropertyValue', propertyID: 'DOI', value: bareDOI(annotation.doi) };
    }
    const abstract = ctx.removeTags( annotation.abstract || '' ).trim();
    if( abstract.length > 0 ) data.abstract = abstract;
    if( annotation.theme ) data.about = annotation.theme;
    const thumb = ctx.annotationThumbURL( annotation );
    if( thumb ) data.image = absoluteURL( ctx, thumb );
    return jsonLDScript( data );
}

// schema.org Manuscript JSON-LD for a folio page
function folioJsonLD( ctx, folio, canonicalURL ) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Manuscript',
        name: `BnF Ms. Fr. 640, folio ${folio.name}`,
        description: `Facsimile, diplomatic and normalized French transcriptions, and English translation of folio ${folio.name} of BnF Ms. Fr. 640.`,
        url: canonicalURL,
        inLanguage: ['fr', 'en'],
        isPartOf: editionEntity( ctx ),
        publisher: { '@type': 'Organization', name: PUBLISHER }
    };
    if( folio.service ) {
        data.associatedMedia = {
            '@type': 'ImageObject',
            contentUrl: `${folio.service}/full/full/0/native.jpg`,
            description: `Facsimile image of folio ${folio.name} (Bibliothèque nationale de France, via Gallica IIIF)`
        };
    }
    return jsonLDScript( data );
}

// site-level JSON-LD for the home page
function homeJsonLD( ctx ) {
    return jsonLDScript({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                name: 'Secrets of Craft and Nature in Renaissance France',
                url: `${ctx.siteURL}${ctx.basePath}/`,
                publisher: { '@type': 'Organization', name: PUBLISHER, url: 'https://www.makingandknowing.org' }
            },
            editionEntity( ctx )
        ]
    });
}

module.exports = { essayCitationMeta, essayJsonLD, folioJsonLD, homeJsonLD };
