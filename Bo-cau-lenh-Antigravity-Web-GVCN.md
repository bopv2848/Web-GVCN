# BỘ CÂU LỆNH ANTIGRAVITY NÂNG CẤP WEB GVCN

**Phiên bản:** 1.0  
**Ngày thẩm định:** 27/08/2026  
**Trạng thái:** Đã phân tích nguyên mẫu – sẵn sàng thực hiện bước thiết kế kiến trúc  
**Tệp đã đọc:** `CODE GVCN CẬP NHẬT MỚI NHẤT 23.8.md`, `Index.html` và 02 ảnh chụp màn hình dự án `Web-GVCN` trong Antigravity.

\---

## 1\. Kết luận dành cho thầy

Dự án **có tính khả thi cao về ý tưởng và giao diện**, vì nguyên mẫu hiện tại đã có nhiều thao tác hoạt động thật trên một trình duyệt. Tuy nhiên, dự án **chưa đủ điều kiện để dùng như một hệ thống trực tuyến có dữ liệu thật của học sinh**.

Khuyến nghị chính:

1. Không yêu cầu Antigravity “viết lại toàn bộ trong một lần”.
2. Giữ nguyên `Index.html` làm bản tham chiếu và bản dự phòng.
3. Trước tiên yêu cầu Antigravity lập hồ sơ kiểm toán, PRD, kiến trúc dữ liệu, ma trận phân quyền, sitemap, user flow và kế hoạch di chuyển dữ liệu.
4. Chỉ sau khi thầy duyệt kiến trúc mới chuyển sang triển khai theo từng giai đoạn nhỏ.
5. Chuyển ứng dụng sang **React + TypeScript + Vite**, dùng **Supabase Auth + PostgreSQL + Storage + Row Level Security**, quản lý mã nguồn bằng **GitHub** và triển khai trên **Vercel**.

### Mức độ khả thi

|Mục tiêu|Mức khả thi|Nhận định|
|-|-:|-|
|Chạy thử trên một máy|Cao|Nguyên mẫu hiện tại đã làm được phần lớn|
|Đưa bản tĩnh lên Vercel để trình diễn|Cao|Có thể làm nhanh, nhưng chưa bảo mật và chưa đồng bộ dữ liệu|
|GVCN sử dụng thật trên nhiều thiết bị|Khá|Cần Supabase, xác thực thật, cơ sở dữ liệu và kiểm thử|
|Nhiều vai trò cùng sử dụng|Khá|Cần thiết kế RBAC và RLS từ đầu; không thể chỉ ẩn/hiện menu|
|Mở rộng cho nhiều lớp hoặc nhiều trường|Có thể|Phải thiết kế dữ liệu theo `school\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_id`, `class\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_id`, `academic\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_year\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_id` ngay từ đầu|

\---

## 2\. Kết quả đọc và phân tích các tệp

### 2.1. Vai trò của từng tệp

* `CODE GVCN CẬP NHẬT MỚI NHẤT 23.8.md` không phải là một PRD hay tài liệu đặc tả. Nội dung chủ yếu là mã HTML đã bị mã hóa thành các ký tự như `\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\&lt;`, `\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\&gt;`. Không nên coi đây là một nguồn yêu cầu độc lập.
* `Index.html` là tệp nguyên mẫu chính, khoảng 440 KB, 5.788 dòng. Cú pháp JavaScript hiện tại biên dịch được.
* Hai ảnh chụp cho thấy thư mục `Web-GVCN` đã được Antigravity nhận diện đúng và hộp nhập lệnh đã sẵn sàng. Trên giao diện có thông báo cập nhật Antigravity; nên cập nhật trước khi bắt đầu một đợt triển khai dài.

### 2.2. Những phân hệ đã có trong nguyên mẫu

1. Trang chủ và tổng quan lớp.
2. Quản lý học sinh; thêm, sửa, xóa và nhập danh sách từ Excel hoặc văn bản.
3. Cộng/trừ điểm cho học sinh, tổ hoặc cả lớp; tiêu chí điểm và lịch sử điểm.
4. Quà tặng và đổi sao.
5. Tổ thi đua và xếp hạng.
6. Điểm danh theo ngày.
7. Gọi tên ngẫu nhiên và các hiệu ứng lớp học.
8. Đồng hồ, chuông và công cụ hỗ trợ tiết dạy.
9. Thời khóa biểu, đọc dữ liệu Excel.
10. Sơ đồ chỗ ngồi kéo thả.
11. Lịch báo giảng theo tiết.
12. Tuyên dương, sổ theo dõi, báo cáo tuần/tháng/học kỳ và xuất PDF.
13. “Trạm đồng hành” theo dõi học sinh cần được hỗ trợ.
14. Cài đặt, ảnh/banner, sao lưu và phục hồi JSON; giao diện đăng nhập và cổng tra cứu phụ huynh.

### 2.3. Điểm mạnh cần bảo tồn

* Ý tưởng sản phẩm gần với công việc thực tế của GVCN.
* Giao diện tiếng Việt, trực quan, có nhiều trạng thái rỗng và thông báo.
* Có khả năng nhập Excel, xuất PDF, sao lưu JSON và xử lý ảnh phía trình duyệt.
* Có lịch sử điểm thay vì chỉ giữ một con số tổng.
* Có tư duy phân vai GVCN, ban cán sự, BGH và phụ huynh/học sinh.
* Có nhiều tính năng hỗ trợ tiết học trực tiếp, tạo nét riêng so với sổ chủ nhiệm thông thường.

### 2.4. Các vấn đề phải xử lý trước khi sử dụng dữ liệu thật

|Mức độ|Vấn đề phát hiện|Tác động|Yêu cầu xử lý|
|-|-|-|-|
|Nghiêm trọng|`renderLoginScreen()` được định nghĩa nhưng không được gọi trong luồng khởi động; `renderLayout()` luôn dựng ứng dụng|Trang đăng nhập không thật sự bảo vệ hệ thống|Dùng Supabase Auth và route guard thật|
|Nghiêm trọng|Trạng thái mặc định là `loggedIn: true`; mật khẩu được viết thẳng trong JavaScript|Ai xem mã nguồn cũng thấy mật khẩu; có thể tự sửa vai trò|Xóa toàn bộ mật khẩu hard-code; không lưu quyền đăng nhập trong state tùy ý|
|Nghiêm trọng|Toàn bộ dữ liệu nằm trong `localStorage`|Mất dữ liệu khi xóa trình duyệt; không đồng bộ nhiều thiết bị; người dùng có thể sửa dữ liệu|Chuyển dữ liệu nghiệp vụ sang PostgreSQL/Supabase|
|Nghiêm trọng|Phân quyền hiện chỉ lọc menu hoặc tab ở phía trình duyệt|Người dùng có thể gọi hàm trực tiếp hoặc sửa state để vượt quyền|Bắt buộc triển khai RLS trên mọi bảng và kiểm tra quyền ở từng thao tác|
|Nghiêm trọng|“Trạm đồng hành” lưu vấn đề, lỗi và biện pháp giáo dục của học sinh trong localStorage|Nguy cơ lộ dữ liệu nhạy cảm của trẻ em|Giới hạn người xem; ghi nhật ký truy cập; không cho BCS/phụ huynh khác xem|
|Cao|Có 03 định nghĩa `renderViewLichBaoGiang` và một số hàm bị định nghĩa lặp|Bản định nghĩa sau ghi đè bản trước; khó biết logic nào đang chạy|Hợp nhất thành một module duy nhất|
|Cao|Hai nút gọi `resetTimer()` và `clearAllSeats()` nhưng không tìm thấy hàm tương ứng|Nút đặt lại đồng hồ và thu hồi sơ đồ có thể không hoạt động|Bổ sung kiểm thử và sửa hai luồng này|
|Cao|Chỉ số “tiến bộ tuần” ở trang chủ được tạo bằng công thức `Math.sin(...)`|Hiển thị số liệu giả, có thể gây hiểu nhầm|Tính hoàn toàn từ giao dịch điểm theo thời gian|
|Cao|Dữ liệu nhập được đưa vào HTML bằng template string; hàm escape chưa xử lý đầy đủ `\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\&`, `<`, `>`|Có nguy cơ chèn mã độc từ file Excel/JSON hoặc dữ liệu nhập tay|Dùng React escaping mặc định, Zod validation và không dùng `innerHTML` với dữ liệu không tin cậy|
|Cao|Một tệp HTML chứa khoảng 151 hàm, giao diện và dữ liệu trộn chung|Khó bảo trì, dễ phát sinh lỗi dây chuyền|Tách theo feature, component, service, hook và schema|
|Trung bình|Mã phụ huynh chỉ gồm 05 chữ số, không có giới hạn số lần thử|Mã có thể bị đoán và làm lộ thông tin học sinh|Dùng tài khoản/magic link hoặc mã mời dài, có thời hạn, rate limit và thu hồi được|
|Trung bình|Ảnh được nén rồi lưu base64 trong localStorage|Nhanh chạm giới hạn dung lượng trình duyệt; lưu có thể thất bại|Chuyển ảnh sang Supabase Storage bucket riêng tư|
|Trung bình|Phục hồi JSON chỉ `JSON.parse` rồi trộn vào state|File sai cấu trúc có thể làm hỏng dữ liệu hoặc đưa nội dung nguy hiểm vào hệ thống|Xác thực phiên bản backup và schema trước khi nhập|
|Trung bình|Tailwind, icon, SheetJS, Tone.js và html2pdf tải từ CDN|Mất mạng hoặc CDN lỗi có thể làm ứng dụng hỏng một phần|Cài dependency bằng npm, khóa phiên bản và build cùng ứng dụng|
|Trung bình|Nút menu di động vẫn thông báo “đang phát triển”|Trải nghiệm trên điện thoại chưa hoàn chỉnh|Làm navigation/drawer hoạt động thật và kiểm thử trên màn hình nhỏ|
|Trung bình|Chưa có trường dữ liệu đầy đủ cho tên trường, chi đội, sự kiện và phạm vi banner|Chưa đáp ứng quản trị nhận diện lớp/trường một cách nhất quán|Thiết kế `class\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_settings`/`class\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_theme`, quyền sửa, xem trước và khôi phục|

\---

## 3\. Kiến trúc đích khuyến nghị

### 3.1. Công nghệ

* Frontend: React, TypeScript, Vite.
* Giao diện: Tailwind CSS cài qua npm; thiết kế responsive theo hướng mobile-first.
* Điều hướng: React Router.
* Form và xác thực: React Hook Form + Zod.
* Dữ liệu bất đồng bộ: TanStack Query hoặc một lớp repository/service có cache rõ ràng.
* Backend: Supabase Auth, PostgreSQL, Storage và Row Level Security.
* Kiểm thử: Vitest + React Testing Library; Playwright cho các user flow quan trọng.
* Mã nguồn và triển khai: GitHub + Vercel.

### 3.2. Nguyên tắc bắt buộc

1. Không đưa `service\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_role` key vào trình duyệt hoặc GitHub.
2. `VITE\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_SUPABASE\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_ANON\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_KEY` chỉ được dùng cùng RLS đầy đủ.
3. Mọi bảng dữ liệu nghiệp vụ phải có chính sách RLS trước khi dùng thật.
4. Mọi bản ghi phải gắn phạm vi trường, lớp và năm học khi phù hợp.
5. Giao dịch điểm là sổ ghi nối tiếp; không xóa cứng để “sửa tổng điểm”. Hoàn tác bằng giao dịch đảo và lưu người thực hiện.
6. Dữ liệu điểm danh và điểm thi đua phải có thời gian, người ghi và nhật ký thay đổi.
7. Dữ liệu “Trạm đồng hành” là dữ liệu nhạy cảm, không hiển thị cho BCS và không đưa vào cổng tra cứu thông thường của phụ huynh/học sinh.
8. Không dùng dữ liệu giả trong dashboard sản xuất. Khi chưa có dữ liệu phải hiển thị trạng thái rỗng.
9. Xóa dữ liệu theo cơ chế xóa mềm khi cần; có khả năng khôi phục và audit log.
10. Không làm mất tính năng cũ: tính năng chưa triển khai ngay phải được ghi vào backlog và giữ đường dẫn truy vết.

### 3.3. Vai trò đề xuất cho MVP

|Vai trò|Quyền chính|
|-|-|
|GVCN|Quản trị lớp, học sinh, điểm danh, điểm thi đua, báo cáo, cấu hình lớp và dữ liệu đồng hành|
|BCS|Chỉ thực hiện các nhiệm vụ được GVCN giao; mặc định không sửa hồ sơ, không xem dữ liệu nhạy cảm, không xóa dữ liệu|
|BGH|Xem tổng hợp trong phạm vi được phân công; mặc định chỉ đọc|
|Học sinh|Xem dữ liệu của chính mình và nội dung lớp được công khai; không xem dữ liệu riêng của bạn khác|
|Phụ huynh|Chỉ xem dữ liệu của con đã được liên kết và nội dung GVCN cho phép công khai|
|Quản trị hệ thống|Quản lý cấu hình kỹ thuật; không mặc nhiên được đọc hồ sơ nhạy cảm nếu không có lý do và nhật ký|

### 3.4. Các thực thể dữ liệu tối thiểu

`schools`, `academic\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_years`, `profiles`, `school\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_memberships`, `classes`, `class\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_memberships`, `students`, `guardians`, `student\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_guardians`, `groups`, `group\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_members`, `point\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_categories`, `point\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_rules`, `point\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_transactions`, `attendance\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_sessions`, `attendance\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_records`, `rewards`, `reward\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_redemptions`, `timetable\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_entries`, `seat\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_layouts`, `seat\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_assignments`, `tasks`, `class\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_milestones`, `student\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_comments`, `companion\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_cases`, `companion\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_updates`, `class\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_settings`, `files`, `audit\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_logs`.

Không nhất thiết phải tạo toàn bộ trong một lần. Antigravity phải phân loại bảng nào thuộc MVP, bảng nào thuộc giai đoạn sau, nhưng thiết kế khóa và quan hệ phải tránh khóa cứng ứng dụng vào một lớp duy nhất.

\---

## 4\. Cách sử dụng bộ câu lệnh

1. Cập nhật Antigravity nếu nút `Restart to Update` vẫn còn hiển thị.
2. Mở đúng dự án `Web-GVCN` như ảnh thầy đã gửi.
3. Dán **Master Prompt** ở Mục 5 trước.
4. Không dán Prompt 1–10 cùng lúc.
5. Khi Antigravity trả về tài liệu kiến trúc, thầy đọc phần “Điểm cần duyệt”. Chỉ khi thầy đồng ý mới dán Prompt 1.
6. Sau mỗi prompt, yêu cầu Antigravity chạy kiểm tra và báo rõ tệp đã sửa, lỗi còn lại và bước thủ công dành cho thầy.
7. Nếu Antigravity hỏi khóa Supabase, chỉ cung cấp URL và anon/publishable key qua `.env.local`; tuyệt đối không dán service-role key vào hội thoại hoặc mã frontend.

\---

## 5\. MASTER PROMPT – DÁN ĐẦU TIÊN VÀO ANTIGRAVITY

```text
BẠN LÀ AI LEAD ENGINEER, PRODUCT ARCHITECT, CHUYÊN GIA AN TOÀN DỮ LIỆU GIÁO DỤC VÀ UI/UX.

Bạn đang làm việc trực tiếp trong thư mục dự án Web-GVCN. Dự án đã có ít nhất các tệp:
- Index.html: nguyên mẫu chính đang chạy trên trình duyệt.
- CODE GVCN CẬP NHẬT MỚI NHẤT .md: bản mã HTML đã được escape, chỉ dùng tham khảo/đối chiếu, không coi là PRD độc lập.
- thư mục .agent và có thể có các tệp khác.

MỤC TIÊU SẢN PHẨM
Nâng cấp nguyên mẫu Web-GVCN thành một web app quản lý lớp học có thể sử dụng thật, ưu tiên GVCN; hoạt động tốt trên máy tính và điện thoại; dữ liệu đồng bộ nhiều thiết bị; có phân quyền thật; bảo vệ dữ liệu học sinh; có thể triển khai theo lộ trình Antigravity → Supabase → GitHub → Vercel.

QUY TẮC QUAN TRỌNG NHẤT TRONG GIAI ĐOẠN NÀY
1. KHÔNG LẬP TRÌNH NGAY.
2. KHÔNG sửa, xóa, đổi tên hoặc ghi đè Index.html và các tệp hiện có.
3. Trước tiên phải đọc toàn bộ cấu trúc dự án và kiểm toán mã nguồn hiện có.
4. Không được bỏ sót tính năng cũ. Tính năng nào chưa đưa vào MVP phải đưa vào backlog và ghi rõ lý do.
5. Không được tạo số liệu giả để làm đẹp dashboard.
6. Không khẳng định “an toàn”, “hoàn thành” hoặc “production-ready” nếu chưa có bằng chứng kiểm thử.
7. Phải dừng lại chờ chủ dự án duyệt kiến trúc trước khi viết mã.

NHỮNG VẤN ĐỀ ĐÃ ĐƯỢC PHÁT HIỆN VÀ BẠN PHẢI XÁC MINH
- Ứng dụng hiện dùng localStorage làm kho dữ liệu chính.
- Có mật khẩu hard-code và trạng thái loggedIn ở phía client.
- Giao diện đăng nhập có thể không nằm trong luồng render thực tế.
- Phân quyền hiện chủ yếu là ẩn/hiện menu, chưa phải phân quyền dữ liệu.
- Có nhiều định nghĩa trùng của renderViewLichBaoGiang và một số hàm khác.
- Có nút gọi resetTimer và clearAllSeats nhưng có thể thiếu hàm xử lý.
- Dashboard có chỉ số tiến bộ tuần được tạo bằng công thức Math.sin, không phải dữ liệu thật.
- Dữ liệu nhập từ Excel/JSON và template HTML cần được rà soát nguy cơ XSS.
- Ảnh base64 và dữ liệu nhạy cảm của “Trạm đồng hành” đang được lưu tại trình duyệt.

PHẠM VI KIỂM TOÁN
- Lập cây thư mục và xác định tệp nguồn sự thật.
- Lập danh mục mọi màn hình, menu, modal, nút, hàm, state và dữ liệu hiện có.
- Với mỗi tính năng, đánh dấu: hoạt động thật / hoạt động một phần / mô phỏng / lỗi / không được gọi.
- Kiểm tra đăng nhập, phân quyền, dữ liệu, quyền riêng tư, XSS, dữ liệu giả, import/export, mobile, khả năng bảo trì và triển khai.
- Đối chiếu các chức năng: trang chủ, học sinh, tổ, điểm, điểm danh, đổi quà, gọi tên, công cụ, thời khóa biểu, sơ đồ lớp, lịch báo giảng, tuyên dương, sổ theo dõi, trạm đồng hành, cài đặt, sao lưu, phụ huynh/học sinh.

KIẾN TRÚC MỤC TIÊU CẦN ĐỀ XUẤT
- React + TypeScript + Vite.
- Tailwind CSS cài bằng npm; không phụ thuộc Tailwind CDN trong sản phẩm.
- Supabase Auth + PostgreSQL + Storage + Row Level Security.
- React Router; Zod cho validation; kiến trúc theo feature/module.
- Vitest + React Testing Library; Playwright cho luồng trọng yếu.
- GitHub + Vercel.
- Không bao giờ đưa Supabase service\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_role key vào frontend.

VAI TRÒ TỐI THIỂU CẦN PHÂN TÍCH
- GVCN.
- Ban cán sự.
- Ban giám hiệu.
- Học sinh.
- Phụ huynh/người giám hộ.
- Quản trị hệ thống.

YÊU CẦU ĐẦU RA
Chỉ tạo tài liệu trong thư mục docs, chưa viết mã ứng dụng. Tạo tối thiểu:
1. docs/00-current-code-audit.md
   - kiểm kê chức năng;
   - lỗi và rủi ro theo Critical/High/Medium/Low;
   - bằng chứng theo tệp/hàm;
   - danh sách tính năng phải bảo tồn.
2. docs/01-product-requirements.md
   - tóm tắt sản phẩm;
   - người dùng;
   - mục tiêu đo lường được;
   - MVP, giai đoạn sau và ngoài phạm vi;
   - quy tắc nghiệp vụ;
   - tiêu chí nghiệm thu quan sát được.
3. docs/02-rbac-and-user-flows.md
   - ma trận quyền Xem/Tạo/Sửa của mình/Sửa toàn bộ/Duyệt/Xuất/Xóa mềm/Khôi phục;
   - sitemap theo vai trò;
   - luồng đăng nhập, quản lý học sinh, điểm danh, cộng/trừ điểm, báo cáo, phụ huynh xem con và xử lý ngoại lệ.
4. docs/03-data-and-security-architecture.md
   - ERD khái niệm;
   - bảng, trường chính, khóa, quan hệ và vòng đời;
   - RLS policy matrix cho từng bảng;
   - Storage buckets và quyền truy cập;
   - audit log, backup, restore, soft delete và retention;
   - cách bảo vệ dữ liệu Trạm đồng hành.
5. docs/04-migration-and-delivery-plan.md
   - ánh xạ state/localStorage hiện tại sang bảng Supabase;
   - kế hoạch nhập backup JSON/Excel;
   - lộ trình từng phase;
   - rollback plan;
   - GitHub/Vercel checklist.
6. docs/05-acceptance-test-matrix.md
   - test theo vai trò;
   - test bảo mật;
   - test dữ liệu;
   - responsive, accessibility và hiệu năng;
   - Given–When–Then cho luồng trọng yếu.

CÁC QUYẾT ĐỊNH THIẾT KẾ MẶC ĐỊNH
- Cơ sở dữ liệu phải hỗ trợ nhiều trường, nhiều lớp và nhiều năm học; MVP có thể chỉ hiển thị một lớp đang hoạt động.
- GVCN quản trị lớp được phân công.
- BGH mặc định chỉ đọc báo cáo trong phạm vi được phân công.
- BCS không được sửa hồ sơ học sinh, không xem Trạm đồng hành và không xóa dữ liệu nếu GVCN chưa cấp quyền cụ thể.
- Phụ huynh chỉ xem con đã liên kết; không dùng mã 5 số công khai làm cơ chế bảo mật duy nhất.
- Giao dịch điểm phải append-only; hoàn tác bằng bản ghi đảo, không xóa lịch sử âm thầm.
- Mọi số liệu tuần/tháng/học kỳ phải tính từ dữ liệu giao dịch có ngày giờ thật.
- Dữ liệu nhạy cảm phải tối thiểu hóa và tách quyền rõ ràng.

CÁCH PHẢN HỒI SAU KHI HOÀN THÀNH TÀI LIỆU
- Tóm tắt tối đa 20 dòng những gì đã phát hiện.
- Nêu các tệp docs đã tạo.
- Nêu 5 quyết định quan trọng nhất cần chủ dự án duyệt, kèm phương án khuyến nghị.
- Xác nhận rõ: “Chưa sửa mã ứng dụng và đang chờ duyệt kiến trúc”.
- DỪNG LẠI. Không tự chuyển sang lập trình.
```

\---

## 6\. CÁC PROMPT TIẾP THEO – CHỈ DÁN SAU KHI ĐÃ DUYỆT KIẾN TRÚC

### Prompt 1 – Chốt kiến trúc và tạo điểm khôi phục

```text
Thầy đã duyệt bộ tài liệu kiến trúc trong thư mục docs với các điều chỉnh đã thống nhất trong cuộc trò chuyện này.

Hãy bắt đầu Giai đoạn 1: bảo toàn nguyên mẫu và tạo nền dự án mới.

Yêu cầu:
1. Đọc lại toàn bộ docs trước khi làm.
2. Kiểm tra git status và cây thư mục. Không xóa thay đổi có sẵn của người dùng.
3. Tạo thư mục legacy và sao chép nguyên trạng Index.html cùng bản MD hiện có vào đó để làm bản tham chiếu; giữ lịch sử nguồn rõ ràng.
4. Tạo ứng dụng React + TypeScript + Vite ở cấu trúc dự án chính, Tailwind cài qua npm.
5. Thiết lập kiến trúc feature-based, React Router, error boundary, loading/empty/error states, ESLint, Prettier, Vitest và Playwright.
6. Tạo .env.example; không ghi khóa thật; không đưa service\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_role vào bất kỳ tệp frontend nào.
7. Dựng app shell, layout responsive, navigation theo vai trò và trang “Chưa có dữ liệu”; chưa nối dữ liệu nghiệp vụ và chưa dùng mock data như dữ liệu thật.
8. Thiết lập design tokens kế thừa màu navy, indigo, amber của nguyên mẫu; hỗ trợ tiếng Việt và font dễ đọc.
9. Viết docs/06-legacy-feature-map.md ánh xạ từng tính năng cũ sang route/module mới và trạng thái triển khai.
10. Chạy lint, test và build.

Không được xóa tính năng khỏi feature map. Nếu gặp xung đột kiến trúc, dừng và hỏi trước khi thay đổi quyết định đã duyệt.

Kết thúc bằng: danh sách tệp đã tạo/sửa, kết quả từng lệnh kiểm tra, lỗi còn lại, ảnh hưởng đến nguyên mẫu và bước tiếp theo. Sau đó dừng chờ duyệt.
```

### Prompt 2 – Tạo Supabase schema, migration và RLS

```text
Tiếp tục Giai đoạn 2: triển khai lớp dữ liệu Supabase theo docs/03-data-and-security-architecture.md.

Yêu cầu:
1. Tạo các migration có thứ tự trong supabase/migrations; không sửa schema bằng thao tác thủ công không được ghi lại.
2. Triển khai các bảng MVP đã duyệt, khóa ngoại, unique constraints, check constraints, index, created\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_at, updated\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_at, deleted\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_at khi phù hợp.
3. Bật RLS trên mọi bảng có dữ liệu người dùng trước khi tạo luồng frontend.
4. Viết policy theo school membership, class membership, vai trò và quan hệ phụ huynh–học sinh. Không dùng policy cho phép rộng kiểu USING (true) trên dữ liệu riêng tư.
5. Tạo bucket riêng tư cho avatar và tài sản lớp; định nghĩa đường dẫn theo school/class/user; chỉ dùng signed URL khi cần.
6. Giao dịch điểm phải append-only; tạo cơ chế reversal có liên kết tới giao dịch gốc.
7. Companion cases/updates phải có policy hạn chế cao hơn dữ liệu lớp thông thường.
8. Tạo seed chỉ dành cho môi trường phát triển và test; không trộn seed demo với production.
9. Tạo test hoặc script kiểm tra RLS cho các vai trò GVCN, BCS, BGH, học sinh, phụ huynh và người ngoài lớp.
10. Cập nhật docs/schema.md và docs/rls-test-results.md.

Không yêu cầu hoặc sử dụng service\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_role key trong frontend. Nếu chưa có dự án Supabase thật, vẫn tạo migration và hướng dẫn chạy local/remote nhưng không giả vờ đã deploy thành công.

Chạy các kiểm tra có thể thực hiện, báo rõ kiểm tra nào chưa chạy vì thiếu thông tin. Sau đó dừng chờ duyệt.
```

### Prompt 3 – Xác thực thật và phân quyền đầu cuối

```text
Tiếp tục Giai đoạn 3: Supabase Auth, route guard và RBAC đầu cuối.

Yêu cầu:
1. Xóa hoàn toàn cơ chế mật khẩu hard-code, loggedIn giả và lựa chọn vai trò tùy ý ở client.
2. Tạo đăng nhập/đăng xuất/khôi phục mật khẩu/phiên đăng nhập bằng Supabase Auth.
3. Lấy vai trò và phạm vi truy cập từ membership trong database; người dùng không thể tự đổi vai trò bằng DevTools.
4. Tạo ProtectedRoute và PermissionGuard, nhưng coi RLS là lớp bảo vệ quyết định; UI guard chỉ để cải thiện trải nghiệm.
5. GVCN chỉ quản trị lớp được phân công; BGH mặc định chỉ đọc; BCS chỉ thấy chức năng được cấp; phụ huynh/học sinh chỉ xem phạm vi của mình.
6. Thiết kế luồng mời thành viên và liên kết phụ huynh–học sinh bằng token đủ mạnh, có thời hạn và thu hồi; không dùng mã 5 số làm lớp bảo mật duy nhất.
7. Có trạng thái hết phiên, mất mạng, không đủ quyền, tài khoản chưa được phân lớp và tài khoản bị vô hiệu hóa.
8. Viết test cho truy cập trái phép trực tiếp bằng URL và gọi repository/service.
9. Không hiển thị thông báo “đã mã hóa an toàn” nếu chưa có cơ sở kỹ thuật.

Chạy lint, test, build và các RLS tests. Báo ma trận role → route → action đã kiểm tra. Sau đó dừng chờ duyệt.
```

### Prompt 4 – Lớp, học sinh, tổ và nhập Excel

```text
Tiếp tục Giai đoạn 4: triển khai dữ liệu nền của lớp.

Phạm vi:
- trường, năm học, lớp đang hoạt động;
- hồ sơ GVCN và cấu hình lớp;
- danh sách học sinh;
- tổ/nhóm và thành viên;
- nhập Excel/CSV, xuất dữ liệu và xử lý trùng lặp.

Yêu cầu:
1. Kế thừa các trường dữ liệu hữu ích trong nguyên mẫu: họ tên, giới tính, ngày sinh, tổ, vai trò lớp, mục tiêu, năng khiếu, hình thức lưu trú, avatar. Phân loại trường bắt buộc/tùy chọn và tối thiểu hóa dữ liệu.
2. Bổ sung cấu hình nhận diện có chủ sở hữu rõ ràng: logo trường, tên trường, tên lớp, chi đội, chủ điểm tháng, sự kiện, banner lớp; có xem trước, giới hạn định dạng/dung lượng và khôi phục cấu hình trước.
3. Không đưa dữ liệu người dùng trực tiếp vào innerHTML. Dùng React rendering và Zod validation.
4. Import phải có màn hình preview, ánh xạ cột, báo dòng lỗi, phát hiện trùng, chọn bỏ qua/cập nhật; chỉ ghi database sau khi xác nhận.
5. Ảnh tải vào private Supabase Storage; không lưu base64 trong localStorage.
6. Xóa học sinh theo chính sách đã duyệt; cảnh báo ảnh hưởng đến điểm danh, điểm, báo cáo và liên kết phụ huynh.
7. Giao diện mobile phải thao tác được; không để nút giả.
8. Thêm test CRUD, import và permission.

Chạy lint, test, build; cung cấp checklist nghiệm thu thủ công. Sau đó dừng chờ duyệt.
```

### Prompt 5 – Điểm danh, điểm thi đua và báo cáo dữ liệu thật

```text
Tiếp tục Giai đoạn 5: điểm danh, điểm thi đua và báo cáo.

Yêu cầu:
1. Điểm danh theo session/ngày; các trạng thái có mặt, đi muộn, vắng có phép, vắng không phép; ngăn ghi trùng và lưu người thực hiện.
2. Cộng/trừ điểm cho học sinh, tổ, cả lớp bằng transaction; mỗi bản ghi có category, reason, note, occurred\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_at, created\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_by và class\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_id.
3. Không chỉnh sửa âm thầm transaction. Hoàn tác phải tạo reversal và audit log.
4. Tách rõ điểm thi đua và số dư sao đổi quà; định nghĩa quy tắc phát sinh/tiêu sao để tránh lệch dữ liệu.
5. Báo cáo ngày/tuần/tháng/học kỳ chỉ tính từ dữ liệu thật theo múi giờ Việt Nam và năm học cấu hình; bỏ toàn bộ Math.sin hoặc dữ liệu tạo giả.
6. Không hard-code học kỳ theo tháng nếu trường có thể cấu hình ngày bắt đầu/kết thúc.
7. Có bộ lọc thời gian, tổ, học sinh, loại tiêu chí; xuất PDF/Excel với tiêu đề, ngày tạo và người xuất.
8. BCS chỉ được ghi điểm danh hoặc điểm nếu permission cụ thể cho phép; BGH mặc định chỉ đọc.
9. Thêm test số liệu tổng, reversal, timezone, ranh giới tuần/tháng/học kỳ và RLS.

Chạy lint, test, build và so sánh một bộ dữ liệu mẫu có kết quả tính tay. Sau đó dừng chờ duyệt.
```

### Prompt 6 – Cổng phụ huynh/học sinh và Trạm đồng hành

```text
Tiếp tục Giai đoạn 6: cổng phụ huynh/học sinh và dữ liệu đồng hành.

Yêu cầu:
1. Phụ huynh chỉ xem học sinh đã liên kết; học sinh chỉ xem hồ sơ của mình và nội dung lớp được công khai.
2. Thay mã tra cứu 5 số bằng đăng nhập hoặc invite/magic link an toàn, có thời hạn, rate limit, thu hồi và audit.
3. Cho GVCN cấu hình trường dữ liệu nào được công khai: điểm thi đua, chuyên cần, nhận xét, thông báo. Mặc định tối thiểu hóa.
4. “Trạm đồng hành” chỉ dành cho GVCN và người được ủy quyền rõ ràng; BCS không được truy cập; BGH chỉ truy cập khi chính sách dự án cho phép và phải có nhật ký.
5. Tách companion\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_cases và companion\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_updates để giữ tiến trình; hoàn thành là đóng hồ sơ, không xóa sạch lịch sử nếu chính sách lưu giữ yêu cầu bảo toàn.
6. Không dùng ngôn từ gắn nhãn hoặc làm tổn thương học sinh trong UI. Đổi mô tả theo hướng hỗ trợ, tiến bộ và can thiệp giáo dục phù hợp.
7. Có cảnh báo khi nhập dữ liệu nhạy cảm; không đưa nội dung này vào báo cáo công khai.
8. Viết RLS tests chứng minh phụ huynh A không xem được con của phụ huynh B và BCS không xem được companion data.

Chạy lint, test, build và báo kết quả kiểm thử quyền riêng tư. Sau đó dừng chờ duyệt.
```

### Prompt 7 – Phục hồi các tính năng hỗ trợ lớp học

```text
Tiếp tục Giai đoạn 7: triển khai các tính năng còn lại theo docs/06-legacy-feature-map.md.

Ưu tiên theo thứ tự:
1. Thời khóa biểu và lịch báo giảng.
2. Sơ đồ lớp kéo thả.
3. Nhiệm vụ và hành trình/cột mốc lớp.
4. Quà tặng và đổi sao.
5. Tuyên dương.
6. Gọi tên ngẫu nhiên, đồng hồ, chuông và công cụ lớp học.

Yêu cầu:
- Hợp nhất 03 phiên bản renderViewLichBaoGiang thành một thiết kế dữ liệu và một module duy nhất.
- Sửa dứt điểm luồng resetTimer và clearAllSeats; thêm test hoặc checklist tái hiện.
- Nội dung thời khóa biểu Excel phải được parse thành dữ liệu có cấu trúc; không lưu cả bảng HTML không kiểm soát vào database.
- Mọi chức năng phải có quyền, trạng thái rỗng/lỗi/mất mạng và hành vi mobile.
- Random picker không được lưu kết quả như thành tích học sinh nếu GVCN chưa xác nhận.
- Chuông/âm thanh chỉ khởi chạy sau thao tác người dùng và có nút tắt.
- Không làm thay đổi dữ liệu nghiệp vụ chỉ để tạo hiệu ứng giao diện.
- Cập nhật feature map sau mỗi module.

Chạy lint, test, build; báo tính năng nào đã đạt, tính năng nào còn backlog. Sau đó dừng chờ duyệt.
```

### Prompt 8 – Di chuyển dữ liệu từ bản cũ

```text
Tiếp tục Giai đoạn 8: công cụ di chuyển dữ liệu từ localStorage/JSON của Index.html sang Supabase.

Yêu cầu:
1. Xác định phiên bản schema của backup cũ và tạo bộ chuyển đổi có version.
2. Chỉ nhận JSON sau khi Zod validation; giới hạn dung lượng; không thực thi HTML/script/URL nguy hiểm.
3. Hiển thị preview số trường, lớp, học sinh, tổ, lịch sử điểm, điểm danh, phần thưởng, sơ đồ, lịch và companion records trước khi ghi.
4. Ánh xạ ID cũ sang UUID mới; giữ quan hệ; phát hiện dữ liệu thiếu/trùng/sai ngày.
5. Có dry-run, nhật ký từng dòng, tổng hợp lỗi và khả năng rollback toàn bộ batch.
6. Không nhập trạng thái auth, mật khẩu hard-code hoặc loggedIn từ backup cũ.
7. Ảnh base64 phải được kiểm tra MIME/dung lượng rồi chuyển sang Storage; ảnh lỗi được bỏ qua có ghi log.
8. Dữ liệu nhạy cảm phải tuân thủ policy và quyền người thực hiện migration.
9. Viết test bằng một backup mẫu ẩn danh, gồm cả dữ liệu lỗi.

Chạy kiểm thử migration; báo chính xác số bản ghi vào/ra/bỏ qua/lỗi và cách rollback. Sau đó dừng chờ duyệt.
```

### Prompt 9 – Kiểm thử toàn diện và gia cố sản phẩm

```text
Tiếp tục Giai đoạn 9: QA, bảo mật, accessibility, hiệu năng và nghiệm thu.

Yêu cầu:
1. Chạy lint, typecheck, unit tests, component tests, integration tests, Playwright và production build.
2. Kiểm thử các vai trò bằng URL trực tiếp và thao tác API; không chỉ kiểm tra menu có ẩn hay không.
3. Kiểm tra XSS qua tên học sinh, ghi chú, Excel, JSON, URL ảnh và nội dung báo cáo.
4. Kiểm tra IDOR/cross-class access: người lớp A không được xem/sửa lớp B.
5. Kiểm tra rate limit hoặc biện pháp chống thử token/mã hàng loạt.
6. Kiểm tra mobile ở các cỡ phổ biến; menu, modal, bảng, kéo thả và form phải dùng được bằng bàn phím khi phù hợp.
7. Kiểm tra contrast, focus, label, thông báo lỗi và reduced motion.
8. Kiểm tra tải trang, bundle, truy vấn N+1, phân trang và tải ảnh.
9. Không để console error, unhandled promise rejection, secret, mật khẩu hoặc dữ liệu học sinh mẫu trong production build.
10. Cập nhật docs/05-acceptance-test-matrix.md bằng Pass/Fail/Blocked và bằng chứng.

Không sửa lỗi bằng cách tắt test hoặc nới lỏng RLS. Báo mọi mục Blocked trung thực. Sau đó dừng chờ duyệt phát hành.
```

### Prompt 10 – GitHub, Vercel và phát hành có kiểm soát

```text
Thầy đã duyệt kết quả QA. Hãy chuẩn bị phát hành lên GitHub và Vercel, nhưng không tự công khai dữ liệu hoặc khóa bí mật.

Yêu cầu:
1. Kiểm tra .gitignore: loại .env\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*, khóa, file backup có dữ liệu thật, log và artifact cục bộ; giữ .env.example.
2. Chạy secret scan trong phạm vi dự án và báo kết quả.
3. Tạo README tiếng Việt: cài đặt, biến môi trường, Supabase migration, seed dev, test, build, deploy, backup và rollback.
4. Tạo cấu hình Vercel phù hợp với Vite SPA và fallback route.
5. Liệt kê biến môi trường cần cấu hình trên Vercel; không in giá trị bí mật.
6. Kiểm tra migration đã áp dụng đúng môi trường và RLS đang bật.
7. Chạy production build cuối cùng.
8. Đề xuất quy trình GitHub branch/commit/PR; không force push, không ghi đè lịch sử.
9. Tạo RELEASE\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_CHECKLIST.md gồm smoke test sau deploy: đăng nhập, phân quyền, CRUD học sinh, điểm danh, điểm, báo cáo, phụ huynh, upload ảnh, logout và URL trực tiếp.
10. Nếu có quyền triển khai thì chỉ thực hiện sau khi xác nhận đúng project/team/environment; nếu chưa đủ thông tin, dừng ở hướng dẫn và hỏi thầy.

Kết thúc bằng URL dự kiến/URL thực tế nếu đã triển khai, commit/tag nếu có, kết quả smoke test, cách rollback và các rủi ro còn lại.
```

\---

## 7\. Các tiêu chí không được thỏa hiệp

Trước khi xem là có thể dùng dữ liệu thật, dự án phải chứng minh được:

* Người chưa đăng nhập không truy cập được màn hình nội bộ.
* Không còn mật khẩu hard-code trong mã nguồn.
* Người dùng không thể tự đổi vai trò bằng DevTools.
* RLS ngăn truy cập chéo trường, chéo lớp và chéo học sinh.
* Phụ huynh chỉ xem được con đã liên kết.
* BCS không xem được Trạm đồng hành.
* Dữ liệu vẫn còn sau khi đổi thiết bị hoặc xóa cache trình duyệt.
* Dashboard tuần/tháng/học kỳ khớp với giao dịch thật.
* Import JSON/Excel có preview, validation và rollback.
* Không có hai nút hỏng `resetTimer` và `clearAllSeats`.
* Không còn định nghĩa trùng của lịch báo giảng.
* Production build không chứa secret, dữ liệu thật hoặc tài khoản mẫu.
* Lint, typecheck, test và build đều đạt; mục chưa đạt phải được ghi rõ, không che giấu.

\---

## 8\. Điểm cần thầy duyệt

Khuyến nghị mặc định để bắt đầu:

1. **Tên dự án tạm thời:** Web-GVCN; có thể đổi thương hiệu sau mà không đổi schema.
2. **Phạm vi MVP:** một GVCN quản trị lớp được phân công; kiến trúc hỗ trợ nhiều lớp/năm học.
3. **BGH:** chỉ xem báo cáo và dữ liệu được phân công.
4. **BCS:** chỉ được điểm danh hoặc thực hiện nhiệm vụ cụ thể khi GVCN cấp quyền; không sửa hồ sơ và không xem dữ liệu nhạy cảm.
5. **Phụ huynh:** dùng tài khoản/liên kết an toàn, không dùng mã 5 số làm bảo mật duy nhất.
6. **Công nghệ:** React + TypeScript + Vite + Supabase + GitHub + Vercel.
7. **Cách triển khai:** dùng Master Prompt trước, duyệt kiến trúc, sau đó mới dán từng Prompt 1–10.

Đây là phương án cân bằng tốt giữa việc bảo tồn công sức đã làm trong `Index.html` và yêu cầu xây dựng một hệ thống đủ an toàn, dễ mở rộng và có thể bảo trì lâu dài.

