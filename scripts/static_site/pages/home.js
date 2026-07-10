// Static port of ContentView.renderHomePage()

const layout = require('../layout');
const essayCard = require('../essay_card');

const featuredEssayIds = [
    'ann_300_ie_19',
    'ann_336_ie_19',
    'ann_329_ie_19',
    'ann_321_ie_19',
    'ann_022_sp_15',
    'ann_308_ie_19'
];

function generate( ctx ) {
    const img = ( name ) => ctx.assetURL(`img/${name}`);

    const featuredCards = featuredEssayIds
        .map( annoID => ctx.annotationsByID[annoID] )
        .filter( anno => !!anno )
        .map( anno => essayCard.renderCard(ctx, anno) )
        .join('\n');

    const content = `
<div id="content-view">
    <div class="bg-maroon-gradient accent-bar"></div>
    <div id="hero" class="flex-parent bg-light-gradient-tb">
        <div class="flex-parent column hero-left">
            <img class="mk-logo" src="${img('mk-homepage-logo.png')}" alt="Making and Knowing Secrets of Craft and Nature Logo">
            <div class="hero-text">
                <p class="subtext">Ms. Fr. 640 is a unique manuscript composed in 1580s Toulouse. It offers firsthand insight into making and materials from a time when artists were scientists.</p>
            </div>
            <div class="flex-parent jc-space-around">
                <a class="cta-link with-icon video-link" href="https://player.vimeo.com/video/389763699" target="_blank" rel="noopener noreferrer">Watch Video</a>
                <a class="cta-link with-icon" href="${ctx.urlFor('/content/about/')}">Learn More</a>
            </div>
        </div>
        <div class="hero-right" style="background-image: url('${img('book-open-cropped.png')}'); background-size: cover;"></div>
    </div>
    <div id="about-panel" class="column flex-parent text-bg-gradient-dark-bt">
        <div class="flex-parent">
            <div class="about-left jc-center flex-parent">
                <img class="about-image spine" src="${img('book-spine.png')}" alt="manuscript spine">
                <img class="about-image cover" src="${img('bookcover-cropped.png')}" alt="manuscript cover">
            </div>
            <div class="about-right flex-parent column jc-center">
                <h3 class="title">Created by the Making and Knowing Project</h3>
                <p>
                    <strong><i>Secrets of Craft and Nature in Renaissance France </i></strong>
                    offers a transcription and an English translation of the manuscript, and provides many research resources to explore its content and context.
                </p>
                <div class="flex-parent links-container full-width">
                    <a class="cta-link with-icon" href="${ctx.urlFor('/folios/')}">Read the Edition</a>
                    <a class="cta-link with-icon" href="${ctx.urlFor('/content/resources/')}">Resources</a>
                </div>
            </div>
        </div>
    </div>
    <div id="featured-essays-panel" class="flex-parent column bg-light-gradient-tb">
        <h2 class="title">Featured Essays</h2>
        <div id="essay-card-container" class="flex-parent wrap">
${featuredCards}
        </div>
        <div class="flex-parent jc-center">
            <a class="cta-button" href="${ctx.urlFor('/essays/')}">VIEW ALL ESSAYS</a>
        </div>
    </div>
</div>`;

    const html = layout.renderPage( ctx, {
        title: 'Home',
        path: '/',
        spaPath: '/',
        bodyClass: 'home',
        description: 'A Digital Critical Edition and English Translation of BnF Ms. Fr. 640, a sixteenth-century manuscript of recipes, techniques, and observations on craft and nature.',
        content
    });

    return [ { path: '/', html } ];
}

module.exports.generate = generate;
