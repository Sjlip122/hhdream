// ============================================================================
// I. CẤU HÌNH LIÊN KẾT BẢNG TÍNH TRANG INDEX (QUẢN LÝ KHUÔN BẾ)
// ============================================================================
var SPREADSHEET_ID = "1SWU6LbxMGVTV9C6i6tsdsjqbIrh84PN73rTzxpZ9Rjg"; // File Kho Khuôn bế + User
var SHEET_DATA = "DanhSachKhuon"; 
var SHEET_USER = "user";           
var SHEET_KHACH = "Trang tính2";   
var SHEET_XOA = "danhsachkhuonxoa"; 

// ============================================================================
// II. HÀM ĐIỀU HƯỚNG MỞ TRANG (CHỈ CÒN DUY NHẤT TRANG INDEX KHUÔN BẾ)
// ============================================================================
function doGet(e) {
  var page = (e && e.parameter) ? e.parameter.page : 'index';
  
  if (page === "foil") {
    return HtmlService.createHtmlOutputFromFile('Foil')
        .setTitle('Hệ thống Quản lý Dữ liệu Foil')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('Hệ thống Quản lý Khuôn bế HH Dream')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}
// ============================================================================
// III. CÁC HÀM XỬ LÝ HỆ THỐNG CHO TRANG INDEX
// ============================================================================
function getTargetSheet(sheetName) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Không tìm thấy tab trang tính: " + sheetName);
  }
  return sheet;
}

function xuLyDangNhap(taiKhoan, matKhau) {
  try {
    var sheet = getTargetSheet(SHEET_USER);
    var data = sheet.getDataRange().getValues();
    var userLower = taiKhoan.toString().toLowerCase().trim();
    var passStr = matKhau.toString().trim();
    
    for (var i = 1; i < data.length; i++) {
      var userCheck = data[i][0] ? data[i][0].toString().toLowerCase().trim() : "";
      var passCheck = data[i][1] ? data[i][1].toString().trim() : "";
      var nameGiaoDien = data[i][2] ? data[i][2].toString().trim() : "";
      
      if (userCheck === userLower && passCheck === passStr) { // Đổi chữ tenHienThi thành user để đồng bộ với index.html
  return { thanhCong: true, tinNhan: "Đăng nhập thành công!", user: nameGiaoDien || taiKhoan }; 
}
    }
    return { thanhCong: false, tinNhan: "Sai tài khoản hoặc mật khẩu!" };
  } catch (error) {
    return { thanhCong: false, tinNhan: "Lỗi hệ thống đăng nhập: " + error.message };
  }
}

function taiToanBoKhoKhuon() {
  var ketQua = [];
  try {
    var sheet = getTargetSheet(SHEET_DATA);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    
    for (var i = 0; i < data.length; i++) {
      var dateObj = data[i][0];
      var ngayDinhDang = "---";
      if (dateObj instanceof Date) {
        ngayDinhDang = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "dd/MM/yyyy");
      } else if (dateObj) {
        ngayDinhDang = dateObj.toString();
      }
      
      var huyenKhuonStr = data[i][6] ? data[i][6].toString().trim().toLowerCase() : "";
      if (huyenKhuonStr === "đã xóa") continue;
      
      ketQua.push({
        sttHieuChinh: i + 2,
        ngayNhap: ngayDinhDang,
        maKhuon: data[i][1].toString().trim(),
        viTri: data[i][2].toString().trim(),
        maKhach: data[i][3].toString().trim(),
        khachHang: data[i][4].toString().trim(),
        xuong: data[i][5] ? data[i][5].toString().trim().toUpperCase() : "",
        huyKhuon: data[i][6] ? data[i][6].toString().trim() : "Đang dùng",
        ngayHuy: data[i][7] ? data[i][7].toString().trim() : "---",
        ghiChu: data[i][8] ? data[i][8].toString().trim() : "---",
        nguoiNhap: data[i][9] ? data[i][9].toString().trim() : "Hệ thống"
      });
    }
  } catch (error) {
    Logger.log("Lỗi taiToanBoKhoKhuon: " + error.toString());
  }
  return ketQua;
}

function taiToanBoKhoKhuonXoa() {
  var ketQua = [];
  try {
    var sheet = getTargetSheet(SHEET_XOA);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    for (var i = 0; i < data.length; i++) {
      var dateObj = data[i][0];
      var ngayDinhDang = "---";
      if (dateObj instanceof Date) ngayDinhDang = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "dd/MM/yyyy");
      ketQua.push({
        sttHieuChinh: -1, ngayNhap: ngayDinhDang, maKhuon: data[i][1].toString().trim(), viTri: data[i][2].toString().trim(),
        maKhach: data[i][3].toString().trim(), khachHang: data[i][4].toString().trim(), xuong: data[i][5] ? data[i][5].toString().trim().toUpperCase() : "",
        huyKhuon: "đã xóa", ngayHuy: data[i][7] ? data[i][7].toString().trim() : "---", ghiChu: data[i][8] ? data[i][8].toString().trim() : "---", nguoiNhap: data[i][9] ? data[i][9].toString().trim() : "Hệ thống"
      });
}
} catch (error) {
  return []; // Trả về mảng rỗng nếu lỗi để không làm treo giao diện
}
return ketQua;
} // <-- THÊM DẤU ĐÓNG NGOẶC NHỌN NÀY VÀO ĐÂY ĐỂ ĐÓNG HÀM LẠI
function taiDanhSachKhachHang() {
  var danhSach = [];
  try {
    var sheet = getTargetSheet(SHEET_KHACH);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      danhSach.push({ maKhach: data[i][0].toString().trim(), tenKhach: data[i][1] ? data[i][1].toString().trim() : "" });
    }
  } catch (error) {}
  return danhSach;
}

// --- HÀM BACKEND MỚI ĐƯỢC THÊM ĐỂ LƯU CHUYỂN XƯỞNG ---
function capNhatXuongKhuonBe(sttDong, tenXuong, nguoiThucHien) {
  try {
    var sheet = getTargetSheet(SHEET_DATA);
    var rowIdx = parseInt(sttDong);
    sheet.getRange(rowIdx, 6).setValue(tenXuong); // Cột F (Xưởng)
    sheet.getRange(rowIdx, 10).setValue(nguoiThucHien); // Cột J (Người cập nhật)
    return { thanhCong: true, tinNhan: "Đã chuyển sang xưởng " + tenXuong };
  } catch (error) {
    return { thanhCong: false, tinNhan: "Lỗi ghi dữ liệu xưởng: " + error.toString() };
  }
}
// ============================================================================
// CÁC HÀM XỬ LÝ GHI / SỬA / HỦY DỮ LIỆU KHUÔN BẾ (BỔ SUNG BỊ THIẾU)
// ============================================================================
function nhapKhuonMoi(obj) {
  try {
    var sheet = getTargetSheet(SHEET_DATA);
    var ngayGioHienTai = new Date();
    sheet.appendRow([
      ngayGioHienTai,
      obj.maKhuon,
      obj.viTri.toUpperCase(),
      obj.maKhach,
      obj.khachHang,
      "", // Xưởng mặc định để trống
      "Đang dùng",
      "---",
      obj.ghiChu || "---",
      obj.nguoiThucHien
    ]);
    return { thanhCong: true, tinNhan: "Đã lưu khuôn " + obj.maKhuon + " vào vị trí " + obj.viTri };
  } catch (error) {
    return { thanhCong: false, tinNhan: "Lỗi thêm mới: " + error.toString() };
  }
}

function capNhatKhuonBe(obj) {
  try {
    var sheet = getTargetSheet(SHEET_DATA);
    var rowIdx = parseInt(obj.sttHieuChinh);
    sheet.getRange(rowIdx, 2).setValue(obj.maKhuon);
    sheet.getRange(rowIdx, 3).setValue(obj.viTri.toUpperCase());
    sheet.getRange(rowIdx, 4).setValue(obj.maKhach);
    sheet.getRange(rowIdx, 5).setValue(obj.khachHang);
    sheet.getRange(rowIdx, 9).setValue(obj.ghiChu || "---");
    sheet.getRange(rowIdx, 10).setValue(obj.nguoiThucHien);
    return { thanhCong: true, tinNhan: "Đã cập nhật thông tin khuôn " + obj.maKhuon };
  } catch (error) {
    return { thanhCong: false, tinNhan: "Lỗi chỉnh sửa: " + error.toString() };
  }
}

function huyKhuonBe(sttDong, nguoiThucHien) {
  try {
    var sheet = getTargetSheet(SHEET_DATA);
    var rowIdx = parseInt(sttDong);
    var ngayGioHienTai = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
    sheet.getRange(rowIdx, 7).setValue("Đã hủy");
    sheet.getRange(rowIdx, 8).setValue(ngayGioHienTai);
    sheet.getRange(rowIdx, 10).setValue(nguoiThucHien);
    return { thanhCong: true, tinNhan: "Đã báo hủy thành công khuôn dòng " + sttDong };
  } catch (error) {
    return { thanhCong: false, tinNhan: "Lỗi báo hủy: " + error.toString() };
  }
}

function khoiPhucKhuonBe(sttDong, nguoiThucHien) {
  try {
    var sheet = getTargetSheet(SHEET_DATA);
    var rowIdx = parseInt(sttDong);
    sheet.getRange(rowIdx, 7).setValue("Đang dùng");
    sheet.getRange(rowIdx, 8).setValue("---");
    sheet.getRange(rowIdx, 10).setValue(nguoiThucHien);
    return { thanhCong: true, tinNhan: "Khuôn đã được khôi phục về trạng thái Đang dùng!" };
  } catch (error) {
    return { thanhCong: false, tinNhan: "Lỗi khôi phục: " + error.toString() };
  }
}

function xoaKhuonBeChuyenSheet(sttDong, nguoiThucHien) {
  try {
    var sheetGoc = getTargetSheet(SHEET_DATA);
    var sheetXoa = getTargetSheet(SHEET_XOA);
    var rowIdx = parseInt(sttDong);
    
    var dataDong = sheetGoc.getRange(rowIdx, 1, 1, 10).getValues()[0];
    var ngayGioHienTai = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
    
    dataDong[6] = "đã xóa";
    dataDong[7] = ngayGioHienTai;
    dataDong[9] = nguoiThucHien;
    
    sheetXoa.appendRow(dataDong);
    sheetGoc.getRange(rowIdx, 7).setValue("đã xóa");
    sheetGoc.getRange(rowIdx, 8).setValue(ngayGioHienTai);
    sheetGoc.getRange(rowIdx, 10).setValue(nguoiThucHien);
    
    return { thanhCong: true, tinNhan: "Khuôn đã được chuyển sang danh sách xóa vĩnh viễn!" };
  } catch (error) {
    return { thanhCong: false, tinNhan: "Lỗi xóa vĩnh viễn: " + error.toString() };
  }
}
// ===========================================================================
// IV. MÔ-ĐUN ĐỘC LẬP: QUẢN LÝ DỮ LIỆU FOIL (DỮ LIỆU ĐỘNG THEO SHEET)
// ===========================================================================
var FOIL_CONFIG = {
  SPREADSHEET_ID: "1z6OdSfMa784UMA17VTX3EL2ljgpjOASU3yKMhp93QKw",
  SHEET_NAME: "Sheet1" 
};

function API_taiDuLieuFoil() {
  var ketQua = { success: false, data: [], headers: [], error: "" };
  try {
    var ss = SpreadsheetApp.openById(FOIL_CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(FOIL_CONFIG.SHEET_NAME);
    if (!sheet) {
      ketQua.error = "Không tìm thấy tên trang tính '" + FOIL_CONFIG.SHEET_NAME + "'";
      return ketQua;
    }
    
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    
    if (lastRow < 1) {
      ketQua.success = true;
      return ketQua;
    }
    
    // Đọc tiêu đề động từ dòng 1
    var headersRaw = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    var tieuDeCot = headersRaw.map(function(h) { return h.toString().trim(); });
    ketQua.headers = tieuDeCot;
    
    if (lastRow <= 1) {
      ketQua.success = true;
      return ketQua;
    }
    
    var dataMatrix = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    var danhSachFoil = [];
    
    for (var i = 0; i < dataMatrix.length; i++) {
      var row = dataMatrix[i];
      if (!row[1] || row[1].toString().trim() === "") continue; 
      
      var mangGiaTriCot = row.map(function(cell) { return cell ? cell.toString().trim() : ""; });
      
      danhSachFoil.push({
        stt: row[0] ? row[0].toString().trim() : (i + 1).toString(),
        maJob: row[1].toString().trim(),
        tenNhu: row[2] ? row[2].toString().trim() : "", // Giữ lại để làm bảng tóm tắt nhanh bên ngoài
        maHang: row[3] ? row[3].toString().trim() : "", // Giữ lại để làm bảng tóm tắt nhanh bên ngoài
        soCuonLon: row[10] ? row[10].toString().trim() : "0", // Giữ lại để làm bảng tóm tắt nhanh bên ngoài
        cacCotDuLieu: mangGiaTriCot 
      });
    }
    
    ketQua.data = danhSachFoil;
    ketQua.success = true;
  } catch (error) {
    ketQua.error = "Lỗi hệ thống Apps Script: " + error.toString();
  }
  return ketQua;
}