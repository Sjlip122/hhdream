
// Dán link Google Script Web App (đuôi /exec) mà bạn vừa copy ở Bước 1 vào đây
const GOOGLE_SCRIPT_API = "https://script.google.com/macros/s/AKfycbzqjdm2SAcDzZWCpAX4MgiuGXdntwN9k-LMmOF6QLEO5gbUwnlPIhGJyUBms-xyQ7wmCg/exec";

// Hàm bổ trợ gọi API an toàn không bị lỗi bảo mật chéo trang (CORS) bằng JSONP
function goiApiGoogleScript(tsHanhDong, cacThamSoKhac = {}) {
  return new Promise((resolve, reject) => {
    const tenCallback = 'jsonp_' + Math.random().toString(36).substr(2, 9);
    window[tenCallback] = function(data) {
      delete window[tenCallback];
      document.body.removeChild(script);
      resolve(data);
    };

    let url = `${GOOGLE_SCRIPT_API}?action=${tsHanhDong}&callback=${tenCallback}`;
    for (let key in cacThamSoKhac) {
      url += `&${key}=${encodeURIComponent(cacThamSoKhac[key])}`;
    }

    const script = document.createElement('script');
    script.src = url;
    script.onerror = () => {
      delete window[tenCallback];
      document.body.removeChild(script);
      reject(new Error("Lỗi kết nối API Google Script"));
    };
    document.body.appendChild(script);
  });
}
