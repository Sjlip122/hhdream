const GOOGLE_SCRIPT_API = "https://script.google.com/macros/s/AKfycbyh5HIHsbqqPFN-GrT9HlEEitMLRqvX6opMpWoyNeOMI6_QluM2BIo174W3yatltSmkpA/exec";// Dán link URL mới vừa copy ở Bước 1 vào đây

function goiApiGoogleScript(tsHanhDong, cacThamSoKhac = {}) {
  return new Promise((resolve, reject) => {
    // 1. Tạo tên hàm độc nhất để nhận dữ liệu
    const tenCallback = 'jsonp_' + Math.random().toString(36).substr(2, 9);
    
    // 2. Đăng ký hàm xử lý khi dữ liệu từ Google về tới nơi
    window[tenCallback] = function(data) {
      resolve(data);
      // Dọn dẹp thẻ sau khi chạy xong để sạch bộ nhớ
      setTimeout(() => {
        delete window[tenCallback];
        const el = document.getElementById(tenCallback);
        if (el) el.parentNode.removeChild(el);
      }, 50);
    };

    // 3. Nối chuỗi tham số gửi đi đúng chuẩn quy định của Google
    let url = GOOGLE_SCRIPT_API + "?action=" + encodeURIComponent(tsHanhDong) + "&callback=" + tenCallback;
    for (let key in cacThamSoKhac) {
      url += "&" + key + "=" + encodeURIComponent(cacThamSoKhac[key]);
    }

    // 4. Tạo thẻ script ép trình duyệt nạp liên kết mà không bị dính CORB
    const script = document.createElement('script');
    script.id = tenCallback;
    script.src = url;
    script.onerror = () => {
      delete window[tenCallback];
      const el = document.getElementById(tenCallback);
      if (el) el.parentNode.removeChild(el);
      reject(new Error("Lỗi kết nối máy chủ dữ liệu"));
    };
    
    document.body.appendChild(script);
  });
}
