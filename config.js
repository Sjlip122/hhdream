const GOOGLE_SCRIPT_API = "https://script.google.com/macros/s/AKfycbzqjdm2SAcDzZWCpAX4MgiuGXdntwN9k-LMmOF6QLEO5gbUwnlPIhGJyUBms-xyQ7wmCg/exec";

function goiApiGoogleScript(tsHanhDong, cacThamSoKhac = {}) {
  return new Promise((resolve, reject) => {
    // 1. Tạo tên hàm callback ngẫu nhiên
    const tenCallback = 'jsonp_' + Math.random().toString(36).substr(2, 9);
    
    // 2. Đăng ký hàm nhận dữ liệu toàn cục
    window[tenCallback] = function(data) {
      delete window[tenCallback];
      const el = document.getElementById(tenCallback);
      if (el) el.parentNode.removeChild(el);
      resolve(data);
    };

    // 3. Xây dựng URL đầy đủ tham số
    let url = GOOGLE_SCRIPT_API + "?action=" + encodeURIComponent(tsHanhDong) + "&callback=" + tenCallback;
    for (let key in cacThamSoKhac) {
      url += "&" + key + "=" + encodeURIComponent(cacThamSoKhac[key]);
    }

    // 4. MẸO CỐT LÕI: Sử dụng fetch() để tự động dò tìm URL sau khi Google chuyển hướng (Redirect)
    fetch(url, { method: 'GET', mode: 'no-cors' })
      .then(() => {
        // Sau khi fetch chạy ngầm để mồi đường truyền, ta tạo thẻ script để hốt dữ liệu về
        const script = document.createElement('script');
        script.id = tenCallback;
        script.src = url;
        script.onerror = () => {
          delete window[tenCallback];
          const el = document.getElementById(tenCallback);
          if (el) el.parentNode.removeChild(el);
          reject(new Error("Lỗi kết nối"));
        };
        document.body.appendChild(script);
      })
      .catch(err => {
        // Phương án dự phòng nếu fetch bị chặn thì vẫn cố nạp script trực tiếp
        const script = document.createElement('script');
        script.id = tenCallback;
        script.src = url;
        document.body.appendChild(script);
      });
  });
}
