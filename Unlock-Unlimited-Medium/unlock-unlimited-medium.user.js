// ==UserScript==
// @name         Unlock Unlimited Medium
// @namespace    https://github.com/htrnguyen/unlock-unlimited-medium
// @version      1.2
// @description  Redirects Medium articles to medium.rest for unlimited reading experience without paywalls or restrictions
// @author       Hà Trọng Nguyễn
// @license      MIT
// @match        *://*.medium.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @supportURL   https://github.com/htrnguyen/unlock-unlimited-medium/issues
// @homepage     https://medium.rest/
// @icon         https://github.com/htrnguyen/Unlock-Unlimited-Medium/raw/main/Unlock%20Unlimited%20Medium%20Logo.png
// ==/UserScript==

/*
 * Unlock Unlimited Medium
 * Developed by: Hà Trọng Nguyễn
 * GitHub: https://github.com/htrnguyen/unlock-unlimited-medium
 * Medium.rest: https://medium.rest/
 * License: MIT
 *
 * This userscript redirects Medium articles to medium.rest for a better reading experience without restrictions.
 */

(function () {
    'use strict';

    // Create draggable icon
    const icon = document.createElement('div');
    icon.innerHTML = '<img src="https://github.com/htrnguyen/Unlock-Unlimited-Medium/raw/main/Unlock%20Unlimited%20Medium%20Logo.png" alt="Unlock Unlimited Medium" style="width: 32px; height: 32px;">';
    icon.title = 'Open with medium.rest';
    icon.style.position = 'fixed';
    icon.style.bottom = '20px';
    icon.style.right = '20px';
    icon.style.zIndex = '1000';
    icon.style.padding = '5px';
    icon.style.cursor = 'pointer';
    icon.style.backgroundColor = '#f0f0f0';
    icon.style.borderRadius = '50%';
    icon.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    document.body.appendChild(icon);

    let isDragging = false;
    let offsetX, offsetY;

    icon.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - icon.offsetLeft;
        offsetY = e.clientY - icon.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            icon.style.left = `${e.clientX - offsetX}px`;
            icon.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    function convertToMediumRest(url) {
        const parsedUrl = new URL(url);
        parsedUrl.hostname = 'medium.rest';
        return parsedUrl.href;
    }

    icon.addEventListener('click', () => {
        const newUrl = convertToMediumRest(location.href);
        GM_openInTab(newUrl, { active: true });
    });

    GM_registerMenuCommand('Open with medium.rest', () => {
        const newUrl = convertToMediumRest(location.href);
        GM_openInTab(newUrl, { active: true });
    });

    document.querySelectorAll('a[href*="medium.com"]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const newUrl = convertToMediumRest(link.href);
            GM_openInTab(newUrl, { active: true });
        });
    });
})();
