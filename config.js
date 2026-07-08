const GOOGLE_SCRIPT_API = "https://script.google.com/macros/s/AKfycbzqjdm2SAcDzZWCpAX4MgiuGXdntwN9k-LMmOF6QLEO5gbUwnlPIhGJyUBms-xyQ7wmCg/exec";

function goiApiGoogleScript(tsHanhDong, cacThamSoKhac = {}) {
  return new Promise((resolve, reject) => {
    // Tạo tên hàm nhận dữ liệu ngẫu nhiên chống trùng lặp
    const tenCallback = 'jsonp_' + Math.random().toString(36).substr(2, 9);
    
    // Đăng ký hàm nhận dữ liệu vào hệ thống toàn cục của trình duyệt
    window[tenCallback] = function(data) {
      delete window[tenCallback];
      const el = document.getElementById(tenCallback);
      if (el) el.parentNode.removeChild(el);
      resolve(data);
    };

    // Tạo đường dẫn chuẩn hóa vượt rào cản CORS bảo mật của Google
    let url = GOOGLE_SCRIPT_API + "?action=" + encodeURIComponent(tsHanhDong) + "&callback=" + tenCallback;
    for (let key in cacThamSoKhac) {
      url += "&" + key + "=" + encodeURIComponent(cacThamSoKhac[key]);
    }

    // Tạo thẻ script ẩn để ép trình duyệt nạp dữ liệu từ Google Sheets về
    const script = document.createElement('script');
    script.id = tenCallback;
    script.src = url;
    script.onerror = () => {
      delete window[tenCallback];
      const el = document.getElementById(tenCallback);
      if (el) el.parentNode.removeChild(el);
      reject(new Error("Lỗi đường truyền hoặc link Google Script chưa mở quyền Anyone"));
    };
    
    document.body.appendChild(script);
  });
}
