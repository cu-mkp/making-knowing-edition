// Editorial-comment popups: transcriptions contain
// <button class="editor-comment" data-comment-id="c_xxx">*</button> markers;
// clicking one shows the comment text from the page's embedded JSON payload.

(function() {
    var popup = null;

    function closePopup() {
        if (popup) {
            var opener = popup.opener;
            if (opener) opener.setAttribute('aria-expanded', 'false');
            popup.remove();
            popup = null;
        }
    }

    function openPopup(button, comments) {
        closePopup();
        var commentID = button.getAttribute('data-comment-id');
        var content = comments[commentID] ||
            'ERROR: Could not find comment for id: ' + commentID + '.';

        popup = document.createElement('div');
        popup.className = 'editor-comment-content paper';
        popup.setAttribute('role', 'dialog');
        popup.opener = button;

        var close = document.createElement('button');
        close.className = 'editor-comment-close';
        close.setAttribute('aria-label', 'Close comment');
        close.innerHTML = '&#10005;';
        close.addEventListener('click', closePopup);

        var body = document.createElement('div');
        body.className = 'editor-comment-body';
        body.innerHTML = content;

        popup.appendChild(close);
        popup.appendChild(body);
        document.body.appendChild(popup);

        var rect = button.getBoundingClientRect();
        var top = rect.bottom + window.pageYOffset + 6;
        var left = rect.left + window.pageXOffset;
        var maxLeft = window.pageXOffset + document.documentElement.clientWidth - popup.offsetWidth - 10;
        popup.style.top = top + 'px';
        popup.style.left = Math.max(10, Math.min(left, maxLeft)) + 'px';

        button.setAttribute('aria-expanded', 'true');
    }

    document.addEventListener('DOMContentLoaded', function() {
        var dataElement = document.getElementById('folio-data');
        var comments = {};
        if (dataElement) {
            try { comments = JSON.parse(dataElement.textContent).comments || {}; } catch (e) { /* none */ }
        }

        document.addEventListener('click', function(event) {
            var button = event.target.closest ? event.target.closest('.editor-comment') : null;
            if (button) {
                event.preventDefault();
                if (popup && popup.opener === button) closePopup();
                else openPopup(button, comments);
            } else if (popup && !popup.contains(event.target)) {
                closePopup();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') closePopup();
        });
    });
})();
