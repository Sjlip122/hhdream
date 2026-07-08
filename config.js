const GOOGLE_SCRIPT_API = "https://script.google.com/macros/s/AKfycbx8ROd8khhNxJkKq7wKx4rYTRwS2GtzsFVTm6FyvdnPQbnIznkPNc2MoS9h-_T9OMDlxg/exec";

function goiApiGoogleScript(tsHanhDong, cacThamSoKhac = {}) {
  return new Promise((resolve, reject) => {
    const tenCallback = 'jsonp_' + Math.random().toString(36).substr(2, 9);
    
    window[tenCallback] = function(data) {
      delete window[tenCallback];
      const el = document.getElementById(tenCallback);
      if (el) el.parentNode.removeChild(el);
      resolve(data);
    };

    let url = GOOGLE_SCRIPT_API + "?action=" + encodeURIComponent(tsHanhDong) + "&callback=" + tenCallback;
    for (let key in cacThamSoKhac) {
      url += "&" + key + "=" + encodeURIComponent(cacThamSoKhac[key]);
    }

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
  });
}
