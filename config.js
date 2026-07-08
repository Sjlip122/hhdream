const GOOGLE_SCRIPT_API = "https://script.google.com/macros/s/AKfycbx8ROd8khhNxJkKq7wKx4rYTRwS2GtzsFVTm6FyvdnPQbnIznkPNc2MoS9h-_T9OMDlxg/exec";


function goiApiGoogleScript(tsHanhDong, cacThamSoKhac = {}) {
  return new Promise((resolve, reject) => {
    // 1. Tạo tên hàm độc nhất để nhận dữ liệu
    const tenCallback = 'jsonp_' + Math.random().toString(36).substr(2, 9);
    
    // 2. Đăng ký hàm xử lý khi dữ liệu từ Google về tới nơi
    window[tenCallback] = function(data) {
      resolve(data);
      // Tạo độ trễ nhỏ để trình duyệt xử lý xong dữ liệu rồi mới dọn dẹp bộ nhớ
      setTimeout(() => {
        delete window[tenCallback];
        const el = document.getElementById(tenCallback);
        if (el) el.parentNode.removeChild(el);
      }, 100);
    };

    // 3. Nối chuỗi tham số gửi đi đúng chuẩn quy định của Google
    let url = GOOGLE_SCRIPT_API + "?action=" + encodeURIComponent(tsHanhDong) + "&callback=" + tenCallback;
    for (let key in cacThamSoKhac) {
      url += "&" + key + "=" + encodeURIComponent(cacThamSoKhac[key]);
    }

    // 4. Tạo thẻ script ép trình duyệt nạp liên kết vượt rào cản CORB/CORS
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
