// ==UserScript==
// @name         Text Summarizer with Gemini API
// @namespace    http://tampermonkey.net/
// @version      1.22
// @description  Summarize selected text using Gemini 2.0 Flash API
// @author       Hà Trọng Nguyễn
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      generativelanguage.googleapis.com
// @homepageURL  https://github.com/htrnguyen
// @supportURL   https://github.com/htrnguyen/Text-Summarizer-with-Gemini-API/issues
// @icon         https://github.com/htrnguyen/User-Scripts/raw/main/Text-Summarizer-with-Gemini-API/text-summarizer-logo.png
// @license      MIT
// ==/UserScript==
(function () {
    'use strict';
    let lastKeyTime = 0;
    let popup = null;
    let overlay = null;
    let isDragging = false;
    let isResizing = false;
    let offsetX, offsetY;
    let resizeOffsetX, resizeOffsetY;
    let initialWidth, initialHeight;

    // Kiểm tra xem API key đã được lưu chưa
    const API_KEY = GM_getValue('geminiApiKey', '');
    if (!API_KEY) {
        showApiKeyPrompt();
    }

    // ✅ Lắng nghe phím Alt + T (nhấn đúp)
    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key === 't') {
            const currentTime = new Date().getTime();
            if (currentTime - lastKeyTime < 500) {
                e.preventDefault();
                const selectedText = window.getSelection().toString().trim();
                if (selectedText) {
                    summarizeTextWithGemini(selectedText);
                } else {
                    showPopup('Lỗi', 'Vui lòng chọn văn bản để tóm tắt!');
                }
            }
            lastKeyTime = currentTime;
        }
    });

    // ✅ Gửi văn bản đến API Gemini 2.0 Flash
    function summarizeTextWithGemini(text) {
        showLoader();
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const prompt = `Tóm tắt nội dung sau đây, đảm bảo kết quả có xuống dòng và bố cục hợp lý để dễ đọc. Kết quả chỉ nên chứa thông tin cần tóm tắt, loại bỏ các phần thừa như 'dưới đây là tóm tắt'. Định dạng trả về là văn bản thông thường, không sử dụng markdown. Bạn có thể thêm emoji để làm dấu chấm, số thứ tự hoặc gạch đầu dòng, nhưng hãy hạn chế sử dụng chúng. Nội dung cần tóm tắt là: ${text}`;
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };
        GM_xmlhttpRequest({
            method: "POST",
            url: apiUrl,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(requestBody),
            onload: function (response) {
                hideLoader();
                if (!response.responseText) {
                    showPopup('Lỗi', 'Không có phản hồi từ API. Kiểm tra API Key hoặc thử lại sau.');
                    return;
                }
                try {
                    const result = JSON.parse(response.responseText);
                    if (result.candidates && result.candidates.length > 0) {
                        const summary = result.candidates[0]?.content?.parts[0]?.text || 'Không thể tóm tắt!';
                        showPopup('Tóm tắt', summary);
                    } else if (result.error) {
                        handleApiError(result.error);
                    } else {
                        showPopup('Lỗi', 'Phản hồi không hợp lệ từ API.');
                    }
                } catch (error) {
                    showPopup('Lỗi', `Lỗi xử lý dữ liệu: ${error.message}<br>Phản hồi API: ${response.responseText}`);
                }
            },
            onerror: function (err) {
                hideLoader();
                showPopup('Lỗi', `Lỗi kết nối API.`);
            },
            timeout: 10000,
            ontimeout: function () {
                hideLoader();
                showPopup('Lỗi', 'Yêu cầu đến API bị timeout. Vui lòng thử lại sau.');
            }
        });
    }

    function handleApiError(error) {
        if (error.code === 403 && error.message.includes('Method doesn\'t allow unregistered callers')) {
            showPopup('Lỗi', 'API key không hợp lệ hoặc chưa được đăng ký. Vui lòng kiểm tra lại API key của bạn.');
        } else {
            showPopup('Lỗi', `API trả về lỗi: ${error.message}`);
        }
    }

    function showPopup(title, content) {
        if (popup) closePopup();
        // Tạo overlay
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-header" draggable="true">
                <h2>${title}</h2>
                <div class="header-actions">
                    <button class="settings-btn" title="Cài đặt">
                        <svg class="cog-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-.75-6.25l-.016-.014a.75.75 0 00-.982.114l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25a.75.75 0 00.114-.982zM12 4.5a7.5 7.5 0 110 15 7.5 7.5 0 010-15zm0 1a6.5 6.5 0 100 13 6.5 6.5 0 000-13z"/>
                        </svg>
                    </button>
                    <button class="close-btn">×</button>
                </div>
            </div>
            <div class="popup-content" id="popupContent">${content}</div>
            <div class="resize-handle"></div>
        `;
        // In ra HTML trước khi thêm vào body
        console.log('HTML trước khi thêm vào body:', popup.innerHTML);
        document.body.appendChild(popup);
        document.querySelector('.close-btn').onclick = closePopup;
        document.querySelector('.settings-btn').onclick = showApiKeyPrompt;
        document.addEventListener('keydown', handleEscKey);
        // Thêm sự kiện drag
        const header = document.querySelector('.popup-header');
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        // Thêm sự kiện resize
        const resizeHandle = document.querySelector('.resize-handle');
        resizeHandle.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        // Tự động đóng popup khi nhấp bên ngoài
        popup.onclick = function (event) {
            if (event.target === popup) {
                closePopup();
            }
        };
        // In ra console khi hiển thị nút cài đặt
        console.log('Nút cài đặt đã được hiển thị');
    }

    function startDrag(e) {
        isDragging = true;
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
    }

    function drag(e) {
        if (isDragging) {
            popup.style.left = `${e.clientX - offsetX}px`;
            popup.style.top = `${e.clientY - offsetY}px`;
        }
    }

    function stopDrag() {
        isDragging = false;
    }

    function startResize(e) {
        isResizing = true;
        initialWidth = popup.offsetWidth;
        initialHeight = popup.offsetHeight;
        resizeOffsetX = e.clientX - popup.offsetLeft;
        resizeOffsetY = e.clientY - popup.offsetTop;
    }

    function resize(e) {
        if (isResizing) {
            const newWidth = initialWidth + (e.clientX - (popup.offsetLeft + resizeOffsetX));
            const newHeight = initialHeight + (e.clientY - (popup.offsetTop + resizeOffsetY));
            popup.style.width = `${newWidth}px`;
            popup.style.height = `${newHeight}px`;
            const content = document.querySelector('.popup-content');
            content.style.maxHeight = `${newHeight - 80}px`; // 80px là chiều cao của header và resize handle
        }
    }

    function stopResize() {
        isResizing = false;
    }

    function showApiKeyPrompt() {
        if (popup) closePopup();
        // Tạo overlay
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        // Tạo popup nhập API key
        popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-header" draggable="true">
                <h2>Nhập API Key</h2>
                <button class="close-btn">×</button>
            </div>
            <div class="popup-content">
                <p>Vui lòng nhập API key của bạn để sử dụng dịch vụ tóm tắt văn bản.</p>
                <div class="api-key-input-container">
                    <input type="text" id="apiKeyInput" placeholder="Nhập API key tại đây..." value="${API_KEY}" />
                </div>
                <div class="button-container">
                    <button class="save-btn">Lưu</button>
                </div>
            </div>
            <div class="resize-handle"></div>
        `;
        document.body.appendChild(popup);
        document.querySelector('.close-btn').onclick = closePopup;
        document.querySelector('.save-btn').onclick = saveApiKey;
        document.getElementById('apiKeyInput').focus();
        document.addEventListener('keydown', handleEscKey);
        // Thêm sự kiện drag
        const header = document.querySelector('.popup-header');
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        // Thêm sự kiện resize
        const resizeHandle = document.querySelector('.resize-handle');
        resizeHandle.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    function saveApiKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        if (apiKey) {
            GM_setValue('geminiApiKey', apiKey);
            closePopup();
            showPopup('Thông Báo', 'API Key đã được lưu thành công!');
        } else {
            showPopup('Lỗi', 'API key không được để trống!');
        }
    }

    function showLoader() {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    }

    function hideLoader() {
        const loader = document.querySelector('.loader');
        if (loader) loader.remove();
    }

    function closePopup() {
        if (popup) {
            popup.remove();
            popup = null;
        }
        if (overlay) {
            overlay.remove();
            overlay = null;
        }
        document.removeEventListener('keydown', handleEscKey);
    }

    function handleEscKey(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    }

    // CSS Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        }
        .popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px; /* Mở rộng chiều rộng */
            min-width: 400px;
            min-height: 250px; /* Mở rộng chiều cao */
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            font-family: 'Roboto', sans-serif;
            overflow: hidden;
        }
        .popup-header {
            background: #4A90E2;
            color: #fff;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .popup-header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
        }
        .header-actions {
            display: flex;
            gap: 10px;
        }
        .header-actions button {
            background: none;
            border: none;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            transition: opacity 0.3s;
        }
        .header-actions button:hover {
            opacity: 0.7;
        }
        .popup-content {
            padding: 20px;
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            overflow-y: auto;
            white-space: pre-wrap; /* Đảm bảo xuống dòng */
        }
        .popup-content p {
            text-align: center;
        }
        .api-key-input-container {
            display: flex;
            justify-content: center;
            margin-bottom: 15px;
        }
        .popup-content input[type="text"] {
            width: calc(100% - 40px);
            max-width: 400px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            transition: border-color 0.3s;
        }
        .popup-content input[type="text"]:focus {
            border-color: #4A90E2;
        }
        .button-container {
            display: flex;
            justify-content: center;
        }
        .popup-content button {
            padding: 10px 20px;
            background: #4A90E2;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        .popup-content button:hover {
            background: #3A7ACB;
        }
        .close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            transition: opacity 0.3s;
        }
        .close-btn:hover {
            opacity: 0.7;
        }
        .resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            background: #4A90E2;
            cursor: se-resize;
            border-bottom-right-radius: 10px;
            transition: background 0.3s;
        }
        .resize-handle:hover {
            background: #3A7ACB;
        }
        .loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        /* SVG Icon */
        .cog-icon {
            width: 1em;
            height: 1em;
            vertical-align: middle;
        }
        /* Tooltip */
        .tooltip {
            position: relative;
            display: inline-block;
            cursor: pointer;
        }
        .tooltip .tooltiptext {
            visibility: hidden;
            width: 120px;
            background-color: black;
            color: #fff;
            text-align: center;
            border-radius: 5px;
            padding: 5px 0;
            position: absolute;
            z-index: 1;
            bottom: 125%; /* Position the tooltip above the text */
            left: 50%;
            margin-left: -60px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .tooltip:hover .tooltiptext {
            visibility: visible;
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
})();