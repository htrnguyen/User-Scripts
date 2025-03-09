// ==UserScript==
// @name         Text Summarizer with Gemini API
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Summarize selected text using Gemini 2.0 Flash API
// @author       Hà Trọng Nguyễn
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      generativelanguage.googleapis.com
// @homepageURL  https://github.com/htrnguyen
// @supportURL   https://github.com/htrnguyen/Text-Summarizer-with-Gemini-API/issues
// @icon         https://github.com/htrnguyen/User-Scripts/raw/main/Text-Summarizer-with-Gemini-API/text-summarizer-logo.png
// @license      MIT
// @downloadURL  https://update.greasyfork.org/scripts/529267/Text%20Summarizer%20with%20Gemini%20API.user.js
// @updateURL    https://update.greasyfork.org/scripts/529267/Text%20Summarizer-with-Gemini%20API.meta.js
// ==/UserScript==

;(function () {
    'use strict'

    // Khai báo biến toàn cục
    let API_KEY = GM_getValue('geminiApiKey', '') || ''
    let shortcutKey = GM_getValue('shortcutKey', 't')
    let modifierKeys = JSON.parse(GM_getValue('modifierKeys', '["Alt"]')) || [
        'Alt',
    ]
    let currentPopup = null
    let isDragging = false
    let isResizing = false
    let offsetX, offsetY, resizeOffsetX, initialWidth

    // Hàm khởi tạo
    function initialize() {
        if (!API_KEY) {
            showPopup('Cài đặt', getSettingsContent())
        }
        setupEventListeners()
    }

    // Thiết lập các sự kiện
    function setupEventListeners() {
        document.addEventListener('keydown', handleKeydown)
        if (typeof GM_registerMenuCommand !== 'undefined') {
            GM_registerMenuCommand('Cài đặt Text Summarizer', () =>
                showPopup('Cài đặt', getSettingsContent())
            )
        }
    }

    // Kiểm tra phím tắt
    function checkShortcut(e) {
        const key = e.key.toLowerCase()
        const modifiers = modifierKeys.map((mod) => mod.toLowerCase())
        const currentModifiers = []
        if (e.altKey) currentModifiers.push('alt')
        if (e.ctrlKey) currentModifiers.push('ctrl')
        if (e.shiftKey) currentModifiers.push('shift')
        return (
            key === shortcutKey &&
            currentModifiers.sort().join(',') === modifiers.sort().join(',')
        )
    }

    // Xử lý phím tắt và ESC
    function handleKeydown(e) {
        if (checkShortcut(e)) {
            e.preventDefault()
            const selectedText = window.getSelection().toString().trim()
            if (selectedText) {
                summarizeText(selectedText)
            } else {
                showPopup(
                    'Lỗi',
                    'Vui lòng chọn một đoạn văn bản để tóm tắt nhé!'
                )
            }
        } else if (e.key === 'Escape' && currentPopup) {
            closePopup()
        }
    }

    // Gửi yêu cầu đến Gemini API
    function summarizeText(text) {
        showLoader()
        GM_xmlhttpRequest({
            method: 'POST',
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `Tóm tắt nội dung sau đây, đảm bảo giữ lại các ý chính và chi tiết quan trọng, tránh lược bỏ quá nhiều. Kết quả cần có xuống dòng và bố cục hợp lý để dễ đọc. Chỉ bao gồm thông tin cần tóm tắt, không thêm phần thừa như 'dưới đây là tóm tắt' hoặc lời dẫn. Định dạng trả về là văn bản thông thường, không sử dụng markdown. Bạn có thể thêm emoji (🌟, ➡️, 1️⃣) để làm dấu chấm, số thứ tự hoặc gạch đầu dòng, nhưng hãy hạn chế và sử dụng một cách tinh tế. Nội dung cần tóm tắt là: ${text}`,
                            },
                        ],
                    },
                ],
            }),
            onload: function (response) {
                hideLoader()
                const data = JSON.parse(response.responseText)
                if (data.candidates && data.candidates.length > 0) {
                    const summary =
                        data.candidates[0].content.parts[0].text ||
                        'Không thể tóm tắt được nội dung này!'
                    showPopup('Tóm tắt', summary)
                } else if (data.error) {
                    showPopup('Lỗi', `Có lỗi từ API: ${data.error.message}`)
                } else {
                    showPopup(
                        'Lỗi',
                        'Phản hồi từ API không hợp lệ. Hãy thử lại!'
                    )
                }
            },
            onerror: function (error) {
                hideLoader()
                showPopup(
                    'Lỗi',
                    `Lỗi kết nối: ${error.message}. Kiểm tra mạng nhé!`
                )
            },
        })
    }

    // Hiển thị popup duy nhất
    function showPopup(title, content) {
        closePopup() // Đóng popup cũ trước khi mở mới

        currentPopup = document.createElement('div')
        currentPopup.className = 'summarizer-popup'
        currentPopup.innerHTML = `
            <div class="popup-header">
                <h2>${title}</h2>
                <div class="header-actions">
                    <button class="close-btn">×</button>
                </div>
            </div>
            <div class="${
                title === 'Tóm tắt' ? 'popup-content-summary' : 'popup-content'
            }">${content}</div>
            <div class="resize-handle"></div>
        `
        document.body.appendChild(currentPopup)

        currentPopup.style.opacity = '0'
        currentPopup.style.transform = 'translate(-50%, -50%) scale(0.9)'
        setTimeout(() => {
            currentPopup.style.opacity = '1'
            currentPopup.style.transform = 'translate(-50%, -50%) scale(1)'
        }, 10)

        currentPopup
            .querySelector('.close-btn')
            .addEventListener('click', closePopup)

        if (title === 'Cài đặt') {
            const saveBtn = currentPopup.querySelector('.save-btn')
            if (saveBtn) saveBtn.addEventListener('click', saveSettings)
        }

        const header = currentPopup.querySelector('.popup-header')
        header.addEventListener('mousedown', startDrag)
        document.addEventListener('mousemove', drag)
        document.addEventListener('mouseup', stopDrag)

        const resizeHandle = currentPopup.querySelector('.resize-handle')
        resizeHandle.addEventListener('mousedown', startResize)
        document.addEventListener('mousemove', resize)
        document.addEventListener('mouseup', stopResize)

        document.body.style.pointerEvents = 'none'
        currentPopup.style.pointerEvents = 'auto'
    }

    // Lấy nội dung cài đặt
    function getSettingsContent() {
        return `
            <div class="settings-container">
                <div class="settings-item">
                    <label>API Key:</label>
                    <input type="text" id="apiKeyInput" placeholder="Dán API key vào đây" value="${API_KEY}" />
                </div>
                <div class="settings-item instruction">
                    <span>Lấy key tại: <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a></span>
                </div>
                <div class="settings-item shortcut-section">
                    <label>Phím tắt:</label>
                    <div class="shortcut-controls">
                        <label><input type="radio" name="modifier" value="Alt" ${
                            modifierKeys.includes('Alt') ? 'checked' : ''
                        }> Alt</label>
                        <label><input type="radio" name="modifier" value="Ctrl" ${
                            modifierKeys.includes('Ctrl') ? 'checked' : ''
                        }> Ctrl</label>
                        <label><input type="radio" name="modifier" value="Shift" ${
                            modifierKeys.includes('Shift') ? 'checked' : ''
                        }> Shift</label>
                        <input type="text" id="shortcutKey" maxlength="1" placeholder="T" value="${shortcutKey.toUpperCase()}" />
                    </div>
                </div>
                <div class="settings-item button-container">
                    <button class="save-btn">
                        <svg class="save-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                        </svg>
                        Lưu
                    </button>
                </div>
            </div>
        `
    }

    // Lưu cài đặt và làm mới trang
    function saveSettings() {
        const apiKey = document.getElementById('apiKeyInput').value.trim()
        const selectedModifier = document.querySelector(
            'input[name="modifier"]:checked'
        )
        shortcutKey = document
            .getElementById('shortcutKey')
            .value.trim()
            .toLowerCase()

        if (!apiKey) {
            showPopup('Lỗi', 'Bạn chưa nhập API key! Hãy nhập để tiếp tục.')
            return
        }
        if (!shortcutKey) {
            showPopup('Lỗi', 'Bạn chưa nhập phím tắt! Hãy nhập một ký tự.')
            return
        }
        if (!selectedModifier) {
            showPopup(
                'Lỗi',
                'Bạn chưa chọn phím bổ trợ! Chọn Alt, Ctrl hoặc Shift.'
            )
            return
        }

        modifierKeys = [selectedModifier.value]
        GM_setValue('geminiApiKey', apiKey)
        GM_setValue('shortcutKey', shortcutKey)
        GM_setValue('modifierKeys', JSON.stringify(modifierKeys))
        API_KEY = apiKey
        closePopup()
        showPopup(
            'Thành công',
            'Cài đặt đã được lưu! Trang sẽ làm mới sau 1 giây.'
        )
        setTimeout(() => location.reload(), 1000) // Làm mới trang để tránh bị kẹt
    }

    // Xử lý kéo popup
    function startDrag(e) {
        isDragging = true
        offsetX = e.clientX - currentPopup.offsetLeft
        offsetY = e.clientY - currentPopup.offsetTop
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault()
            currentPopup.style.left = `${e.clientX - offsetX}px`
            currentPopup.style.top = `${e.clientY - offsetY}px`
        }
    }

    function stopDrag() {
        isDragging = false
    }

    // Xử lý thay đổi kích thước (chỉ chiều ngang)
    function startResize(e) {
        isResizing = true
        initialWidth = currentPopup.offsetWidth
        resizeOffsetX = e.clientX - currentPopup.offsetLeft
    }

    function resize(e) {
        if (isResizing) {
            const newWidth =
                initialWidth +
                (e.clientX - (currentPopup.offsetLeft + resizeOffsetX))
            currentPopup.style.width = `${Math.max(newWidth, 400)}px`
        }
    }

    function stopResize() {
        isResizing = false
    }

    // Loader
    function showLoader() {
        const loader = document.createElement('div')
        loader.className = 'summarizer-loader'
        loader.innerHTML = '<div class="spinner"></div>'
        document.body.appendChild(loader)
    }

    function hideLoader() {
        const loader = document.querySelector('.summarizer-loader')
        if (loader) loader.remove()
    }

    // Đóng popup
    function closePopup() {
        if (currentPopup) {
            currentPopup.style.opacity = '1'
            currentPopup.style.transform = 'translate(-50%, -50%) scale(1)'
            setTimeout(() => {
                currentPopup.style.opacity = '0'
                currentPopup.style.transform =
                    'translate(-50%, -50%) scale(0.9)'
                setTimeout(() => {
                    currentPopup.remove()
                    currentPopup = null
                    document.body.style.pointerEvents = 'auto'
                    document.removeEventListener('mousemove', drag)
                    document.removeEventListener('mouseup', stopDrag)
                }, 200)
            }, 10)
        }
    }

    // CSS
    const style = document.createElement('style')
    style.innerHTML = `
        .summarizer-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            min-width: 400px;
            height: 400px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            font-family: 'Roboto', sans-serif;
            overflow: hidden;
            transition: opacity 0.2s ease, transform 0.2s ease;
            display: flex;
            flex-direction: column;
        }
        .popup-header {
            background: linear-gradient(135deg, #4A90E2, #357ABD);
            color: #fff;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            flex-shrink: 0;
        }
        .popup-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            text-align: center;
            line-height: 1.0;
        }
        .header-actions {
            display: flex;
            gap: 12px;
        }
        .header-actions button {
            background: none;
            border: none;
            color: #fff;
            font-size: 22px;
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .header-actions button:hover {
            transform: scale(1.1);
            opacity: 0.9;
        }
        .popup-content {
            padding: 15px;
            font-size: 15px;
            color: #444;
            line-height: 1.2;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .popup-content-summary {
            padding: 15px;
            font-size: 15px;
            color: #444;
            line-height: 1.6;
            overflow-y: auto;
            white-space: pre-wrap;
            flex-grow: 1;
        }
        .settings-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .settings-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
        }
        .settings-item label {
            font-weight: 600;
            color: #333;
            line-height: 1.2;
        }
        .settings-item input[type="text"] {
            width: 80%;
            max-width: 300px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
            background: #f9f9f9;
            transition: border-color 0.2s ease;
        }
        .settings-item input[type="text"]:focus {
            border-color: #4A90E2;
            outline: none;
        }
        .instruction {
            font-size: 13px;
            color: #666;
            line-height: 1.2;
        }
        .instruction a {
            color: #4A90E2;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        .instruction a:hover {
            color: #357ABD;
            text-decoration: underline;
        }
        .shortcut-section {
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        .shortcut-controls {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .shortcut-controls label {
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 14px;
            font-weight: 400;
            color: #444;
        }
        .shortcut-controls input[type="radio"] {
            margin: 0;
        }
        .shortcut-controls input[type="text"] {
            width: 40px;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
            background: #f9f9f9;
            transition: border-color 0.2s ease;
        }
        .shortcut-controls input[type="text"]:focus {
            border-color: #4A90E2;
            outline: none;
        }
        .button-container {
            margin-top: 10px;
        }
        .save-btn {
            padding: 8px 20px;
            background: linear-gradient(135deg, #4A90E2, #357ABD);
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(74, 144, 226, 0.4);
        }
        .save-icon {
            width: 16px;
            height: 16px;
        }
        .resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            background: #4A90E2;
            cursor: se-resize;
            border-bottom-right-radius: 12px;
            transition: background 0.2s ease;
        }
        .resize-handle:hover {
            background: #357ABD;
        }
        .summarizer-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .spinner {
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top: 5px solid #4A90E2;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `
    document.head.appendChild(style)

    // Thêm font Roboto
    const fontLink = document.createElement('link')
    fontLink.href =
        'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600&display=swap'
    fontLink.rel = 'stylesheet'
    document.head.appendChild(fontLink)

    // Khởi chạy script
    initialize()
})()
