// Glossary filter: show entries whose headword, modern spelling, or
// alternate spellings start with the typed term (same rule as GlossaryView).

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var input = document.getElementById('glossary-filter');
        var container = document.getElementById('glossary-entries');
        if (!input || !container) return;

        input.hidden = false;
        var entries = Array.prototype.slice.call(container.querySelectorAll('.glossary-entry'));
        var headings = Array.prototype.slice.call(container.querySelectorAll('.alpha-heading'));

        input.addEventListener('input', function() {
            var term = input.value.trim().toLowerCase();
            headings.forEach(function(heading) { heading.hidden = term.length > 0; });
            entries.forEach(function(entry) {
                if (term.length === 0) {
                    entry.hidden = false;
                    return;
                }
                var filterTerms = (entry.getAttribute('data-filter-terms') || '').split('|');
                var match = filterTerms.some(function(word) { return word.indexOf(term) === 0; });
                entry.hidden = !match;
            });
        });
    });
})();
