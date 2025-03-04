// ==UserScript==
// @name         Unlock Unlimited Medium
// @namespace    https://github.com/htrnguyen/User-Scripts/tree/main/Unlock-Unlimited-Medium
// @version      1.7
// @description  Unlock all Medium-based articles via medium.rest, detecting Medium logo in the top-left corner for UI enhancements.
// @author       Hà Trọng Nguyễn
// @license      MIT
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @supportURL   https://github.com/htrnguyen/User-Scripts/tree/main/Unlock-Unlimited-Medium/issues
// @homepage     https://medium.rest/
// @icon         https://github.com/htrnguyen/User-Scripts/raw/main/Unlock-Unlimited-Medium/Unlock%20Unlimited%20Medium%20Logo.png
// ==/UserScript==

;(function () {
    'use strict'

    function generateMediumRestURL(originalUrl) {
        return `https://medium.rest/query-by-url?urlPost=${encodeURIComponent(
            originalUrl
        )}`
    }

    function openMediumRestWithUrl(mediumUrl) {
        GM_openInTab(generateMediumRestURL(mediumUrl), {active: true})
    }

    function isMediumArticle(link) {
        try {
            const url = new URL(link.href)
            if (url.hostname.includes('medium.com')) return true

            // Kiểm tra nếu có logo Medium gần đó
            const parent = link.closest('div')
            if (parent) {
                const mediumLogo = parent.querySelector(
                    'svg path[fill="#242424"]'
                )
                if (mediumLogo) return true
            }
        } catch (error) {
            return false
        }
        return false
    }

    function detectMediumLogo() {
        return !!document.querySelector(
            'a[data-testid="headerMediumLogo"] svg path[fill="#242424"]'
        )
    }

    function createUnlockButton() {
        const btn = document.createElement('button')
        btn.innerText = '🔓 Unlock'
        btn.style.position = 'fixed'
        btn.style.bottom = '20px'
        btn.style.right = '20px'
        btn.style.zIndex = '1000'
        btn.style.padding = '10px 15px'
        btn.style.cursor = 'pointer'
        btn.style.fontSize = '14px'
        btn.style.color = '#fff'
        btn.style.backgroundColor = '#1a8917'
        btn.style.border = 'none'
        btn.style.borderRadius = '5px'
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)'

        btn.addEventListener('click', () => {
            openMediumRestWithUrl(window.location.href)
        })

        document.body.appendChild(btn)
    }

    document.querySelectorAll('a[href]').forEach((link) => {
        if (isMediumArticle(link)) {
            link.addEventListener('click', (event) => {
                event.preventDefault()
                openMediumRestWithUrl(link.href)
            })
        }
    })

    GM_registerMenuCommand('Unlock this Medium Article', () => {
        openMediumRestWithUrl(location.href)
    })

    // Nếu phát hiện logo Medium ở góc trái trên cùng, hiển thị nút Unlock
    if (detectMediumLogo()) {
        createUnlockButton()
    }
})()
