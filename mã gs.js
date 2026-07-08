// ============================================================================
// I. CẤU HÌNH LIÊN KẾT BẢNG TÍNH TRANG INDEX (QUẢN LÝ KHUÔN BẾ)
// ============================================================================
var SPREADSHEET_ID = "1SWU6LbxMGVTV9C6i6tsdsjqbIrh84PN73rTzxpZ9Rjg"; 
var SHEET_DATA = "DanhSachKhuon"; 
var SHEET_USER = "user";           
var SHEET_KHACH = "Trang tính2";   
var SHEET_XOA = "danhsachkhuonxoa"; 

// ============================================================================
// II. HÀM TIẾP NHẬN YÊU CẦU TỪ GITHUB (API ENDPOINT)
// ============================================================================
function doGet(e) {
  var action = (e && e.parameter) ? e.parameter.action : '';
  var callback = (e && e.parameter) ? e.parameter.callback : '';
  var ketQua = { thanhCong: false, tinNhan: "Không xác định được hành động." };

  try {
    // 1. API Đăng nhập
    if (action === "dangNhap") {
      var u = e.parameter.user;
      var p = e.parameter.pass;
      ketQua = xuLyDangNhap(u, p);
    }
    // 2. API Tải dữ liệu Khuôn Bế (Trang index)
    else if (action === "taiKhoKhuon") {
      ketQua = {
        thanhCong: true,
        data: taiToanBoKhoKhuon(),
        deletedData: taiToanBoKhoKhuonXoa()
      };
    }
    // 3. API Tải dữ liệu Foil (Trang Foil)
    else if (action === "taiFoil") {
      ketQua = API_taiDuLieuFoil();
    }
    // 4. API Cập nhật xưởng khuôn bế
    else if (action === "capNhatXuong") {
      var sttDong = parseInt(e.parameter.sttDong);
      var tenXuong = e.parameter.tenXuong;
      var tenUser = e.parameter.tenUser;
      ketQua = capNhatXuongKhuonBe(sttDong, tenXuong, tenUser);
    }
  } catch (error) {
    ketQua = { thanhCong: false, tinNhan: "Lỗi hệ thống: " + error.toString() };
  }

  // Trả về định dạng JSONP để vượt qua chặn bảo mật CORS của trình duyệt rộng rãi hơn
  var outputText = callback ? callback + "(" + JSON.stringify(ketQua) + ")" : JSON.stringify(ketQua);
  var mimeType = callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;

  return ContentService.createTextOutput(outputText).setMimeType(mimeType);
}

// Bổ sung hàm doPost đề phòng trường hợp cần thiết, trỏ chung về doGet
function doPost(e) {
  return doGet(e);
}

// ============================================================================
// III. CÁC HÀM XỬ LÝ LOGIC DỮ LIỆU (Giữ nguyên gốc của bạn)
// ============================================================================
function xuLyDangNhap(userNhap, passNhap) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_USER);
  var data = sheet.getDataRange().getValues();
  
  var uClean = userNhap.toString().trim().toLowerCase();
  var pClean = passNhap.toString().trim();
  
  for (var i = 1; i < data.length; i++) {
    var uInSheet = data[i][1] ? data[i][1].toString().trim().toLowerCase() : "";
    var pInSheet = data[i][2] ? data[i][2].toString().trim() : "";
    var nameInSheet = data[i][3] ? data[i][3].toString().trim() : "Người dùng";
    
    if (uInSheet === uClean && pInSheet === pClean) {
      return { thanhCong: true, tenHienThi: nameInSheet };
    }
  }
  return { thanhCong: false, tinNhan: "Sai tài khoản hoặc mật khẩu!" };
}

function taiToanBoKhoKhuon() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_DATA);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var rawData = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  var finalData = [];
  for (var i = 0; i < rawData.length; i++) {
    var r = rawData[i];
    if (!r[1] || r[1].toString().trim() === "") continue;
    finalData.push({
      sttHieuChinh: i + 2,
      stt: r[0], maKhuon: r[1], linhVuc: r[2], khachHang: r[3],
      maHang: r[4], khoDao: r[5], soUp: r[6], mayChay: r[7],
      loaiKhuon: r[8], viTri: r[9], ngayLam: r[10], xuong: r[11], ghiChu: r[12]
    });
  }
  return finalData;
}

function taiToanBoKhoKhuonXoa() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_XOA);
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, 4).getValues();
}

function capNhatXuongKhuonBe(sttDong, tenXuong, tenUser) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_DATA);
  var sheetKhach = ss.getSheetByName(SHEET_KHACH);
  
  var cellXuong = sheet.getRange(sttDong, 12);
  var cellUser = sheet.getRange(sttDong, 14);
  
  cellXuong.setValue(tenXuong);
  cellUser.setValue(tenUser);
  
  if (sheetKhach) {
    sheetKhach.appendRow([new Date(), sttDong, tenXuong, tenUser]);
  }
  
  return { thanhCong: true, tinNhan: "Đã cập nhật xưởng thành công!" };
}

// ============================================================================
// IV. LOGIC XỬ LÝ DỮ LIỆU FOIL (PHẦN TRANG FOIL)
// ============================================================================
var ID_FILE_FOIL = "1bclGgG0WbVst_Oco9n9b7XvT8p298lscfJpEInmI9hM"; 
var TEN_SHEET_FOIL = "Sheet1"; 

function API_taiDuLieuFoil() {
  var ketQua = { success: false, headers: [], data: [] };
  var ss = SpreadsheetApp.openById(ID_FILE_FOIL);
  var sheet = ss.getSheetByName(TEN_SHEET_FOIL);
  if (!sheet) return ketQua;
  
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow < 1) { ketQua.success = true; return ketQua; }
  
  var headersRaw = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var tieuDeCot = headersRaw.map(function(h) { return h.toString().trim(); });
  ketQua.headers = tieuDeCot;
  
  if (lastRow <= 1) { ketQua.success = true; return ketQua; }
  
  var dataMatrix = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  var danhSachFoil = [];
  
  for (var i = 0; i < dataMatrix.length; i++) {
    var row = dataMatrix[i];
    if (!row[1] || row[1].toString().trim() === "") continue; 
    var mangGiaTriCot = row.map(function(cell) { return cell ? cell.toString().trim() : ""; });
    danhSachFoil.push({
      stt: row[0] ? row[0].toString().trim() : (i + 1).toString(),
      maJob: row[1].toString().trim(),
      tenNhu: row[2] ? row[2].toString().trim() : "", 
      maHang: row[3] ? row[3].toString().trim() : "",
      chiTietCot: mangGiaTriCot
    });
  }
  ketQua.data = danhSachFoil;
  ketQua.success = true;
  return ketQua;
}
