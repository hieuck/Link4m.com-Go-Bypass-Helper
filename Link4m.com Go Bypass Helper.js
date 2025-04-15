// ==UserScript==
// @name         Link4m.com Go Bypass Helper
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @description  Hỗ trợ tự động hóa lấy mã và điền mã cho link4m.com/go/
// @match        https://link4m.com/go/*
// @icon         https://link4m.com/templates/default/IteckTheme/assets/img/thumb.jpg
// @grant        none
// ==/UserScript==

// Thêm vào đầu file để load Tesseract.js
(function injectTesseract() {
    if (!window.Tesseract) {
        let script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.1/dist/tesseract.min.js';
        document.head.appendChild(script);
    }
})();

async function ocrImageFromSelector(selector) {
    // Đợi Tesseract.js load
    while (!window.Tesseract) await new Promise(r => setTimeout(r, 200));
    let img = document.querySelector(selector);
    if (!img) return null;
    let result = await Tesseract.recognize(img, 'eng');
    return result.data.text.trim();
}

// Đọc văn bản từ ảnh có trong .text-center
async function getKeywordFromImage() {
    // Đợi Tesseract.js load
    while (!window.Tesseract) await new Promise(r => setTimeout(r, 200));
    // Lấy đúng ảnh trong .text-center
    let img = document.querySelector('.text-center img');
    if (!img) return null;
    // Nếu ảnh chưa load xong, đợi
    if (!img.complete) await new Promise(r => { img.onload = r; });
    let result = await Tesseract.recognize(img, 'eng');
    let text = result.data.text.trim();
    if (text) {
        alert('Văn bản nhận diện từ ảnh: ' + text);
        // Có thể tự động tìm kiếm Google, mở tab, v.v.
    }
    return text;
}

(function() {
    'use strict';

    // 1. Tìm từ khóa trên trang hướng dẫn
    function getKeyword() {
        // Tìm phần hướng dẫn có từ khóa
        let reds = document.querySelectorAll('.red');
        for (let el of reds) {
            // Loại bỏ các từ google.com, trang 1, v.v.
            let txt = el.textContent.trim();
            if (txt.length > 2 && !txt.includes('google.com') && !txt.includes('trang')) {
                return txt;
            }
        }
        return null;
    }

    // 2. Hỗ trợ tự động điền mã khi người dùng đã lấy được mã
    function autoFillPassword() {
        // Bạn cần tự lấy mã theo hướng dẫn, sau đó script sẽ tự điền vào ô password nếu bạn lưu vào clipboard
        navigator.clipboard.readText().then(text => {
            if (text && text.length === 6 && /^\w+$/.test(text)) {
                let pw = document.querySelector('input[name="password"], input#password, input#password-2');
                if (pw) {
                    pw.value = text;
                    pw.focus();
                }
            }
        });
    }

    // 3. Hỗ trợ submit nhanh khi đã điền mã và captcha
    function autoSubmitWhenReady() {
        let form = document.querySelector('form#main-form-2');
        let pw = document.querySelector('input[name="password"], input#password, input#password-2');
        let btn = document.querySelector('.get-link.btn-success');
        // Theo mô tả: khi nút này hết disabled (màu xanh), đã có thể submit
        if (btn && !btn.classList.contains('disabled')) {
            btn.click();
        }
    }

    // 4. Hướng dẫn thao tác
    function showHelper() {
        let keyword = getKeyword();
        if (!keyword) return;
        let helper = document.createElement('div');
        helper.style = 'position:fixed;bottom:20px;right:20px;z-index:99999;background:#fff;color:#222;padding:16px 24px;border-radius:12px;box-shadow:0 4px 16px #0003;font-size:16px;max-width:350px;';
        helper.innerHTML = `<b>HƯỚNG DẪN Bypass Link4m:</b><br>
        1. Tìm từ khóa: <b style="color:#e22">${keyword}</b> trên Google.<br>
        2. Vào đúng web giống ảnh.<br>
        3. Kéo xuống cuối bài, nhấn <b>LẤY MÃ</b> và chờ đủ thời gian.<br>
        4. Copy mã (6 ký tự) và quay lại trang này.<br>
        5. Script sẽ tự điền mã nếu bạn đã copy.<br>
        6. Đánh dấu captcha, đợi nút <b>Click vào đây để tiếp tục</b> chuyển xanh, rồi click để tới link đích.<br>
        <span style="font-size:13px;color:#888">Script không tự giải captcha Google reCAPTCHA.</span>`;
        document.body.appendChild(helper);
    }

    // 5. Theo dõi clipboard và tự điền mã khi user copy
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) setTimeout(autoFillPassword, 500);
    });

    // 6. Theo dõi trạng thái nút submit
    setInterval(autoSubmitWhenReady, 1000);

    // 7. Hiển thị hướng dẫn
    setTimeout(showHelper, 1500);

    // Gọi hàm này sau khi trang load xong
    setTimeout(getKeywordFromImage, 2000);

})();