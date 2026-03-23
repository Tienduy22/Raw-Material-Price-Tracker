# Raw Material Price Tracker

## Mô tả dự án

**Raw Material Price Tracker** là ứng dụng web giúp các tiểu thương (chủ quán cà phê, tiệm bánh, xưởng sản xuất nhỏ) theo dõi và quản lý giá nguyên liệu từ nhiều nhà cung cấp khác nhau.

Hiện tại đa số tiểu thương quản lý giá nguyên liệu bằng Excel hoặc sổ tay, dẫn đến không biết giá đang tăng hay giảm, không so sánh được giữa các nhà cung cấp, và không có cái nhìn tổng quan về chi phí nguyên liệu hàng tháng.

---

## Vấn đề thực tế

- Mua nguyên liệu từ nhiều nhà cung cấp nhưng **không biết ai đang cho giá tốt nhất**
- Giá nguyên liệu biến động nhưng **không ai theo dõi xu hướng**
- Không biết mỗi tháng mình đã **tốn bao nhiêu tiền** cho nguyên liệu nào
- Không có hệ thống **cảnh báo** khi giá tăng đột biến

---

## Mục tiêu

- Ghi lại lịch sử giá mỗi lần nhập hàng
- So sánh giá giữa các nhà cung cấp cho cùng một nguyên liệu
- Hiển thị biểu đồ biến động giá theo thời gian
- Tự động cảnh báo khi giá tăng vượt ngưỡng cho phép
- Gửi báo cáo tóm tắt hàng tuần qua email

---

## Đối tượng sử dụng

| Vai trò | Quyền hạn |
|---|---|
| **Owner** (Chủ cơ sở) | Toàn quyền: xem báo cáo, cấu hình hệ thống, quản lý thành viên |
| **Staff** (Nhân viên) | Chỉ nhập liệu giá, không xem báo cáo tài chính |

---

## Tính năng chính

### Auth & Người dùng
- Đăng ký tài khoản + tạo cơ sở kinh doanh
- Đăng nhập / đăng xuất với JWT
- Phân quyền Owner / Staff
- Owner mời thêm thành viên qua email

### Quản lý danh mục
- Quản lý danh mục nguyên liệu (bột, sữa, bao bì...)
- Quản lý nguyên liệu (tên, đơn vị: kg, lít, thùng...)
- Quản lý nhà cung cấp (tên, SĐT, ghi chú)

### Nhập giá
- Ghi lại mỗi lần nhập hàng: nguyên liệu, nhà cung cấp, giá, số lượng, ngày mua
- Lưu toàn bộ lịch sử, không bao giờ xóa dữ liệu cũ
- Staff chỉ được nhập, không được sửa sau khi lưu

### Dashboard & Báo cáo (Owner only)
- Biểu đồ giá theo thời gian của từng nguyên liệu
- Bảng so sánh giá giữa các nhà cung cấp
- Top 5 nguyên liệu tốn tiền nhất trong tháng
- Tổng chi phí nhập hàng theo tháng
- So sánh chi phí tháng này vs tháng trước

### Cảnh báo & Thông báo
- Cấu hình ngưỡng cảnh báo theo % tăng giá cho từng nguyên liệu
- Cron job chạy hàng ngày kiểm tra giá mới
- Gửi email cảnh báo khi giá vượt ngưỡng
- Gửi báo cáo tóm tắt mỗi thứ Hai hàng tuần

---

## Tech Stack

### Backend
| Công nghệ | Vai trò |
|---|---|
| **NestJS** | Framework chính |
| **PostgreSQL** | Database |
| **Prisma** | ORM |
| **JWT** | Authentication |
| **Passport.js** | Auth strategy |
| **@nestjs/schedule** | Cron jobs |
| **Nodemailer** | Gửi email |
| **Swagger** | API documentation |
| **Docker** | Chạy PostgreSQL local |

### Frontend
| Công nghệ | Vai trò |
|---|---|
| **Next.js (App Router)** | Framework chính |
| **Tailwind CSS** | Styling |
| **React Hook Form + Zod** | Form validation |
| **Recharts** | Biểu đồ |
| **Axios** | Gọi API |

---

## Kiến trúc hệ thống

```
Client (Next.js)
      ↓ HTTP Request
API Gateway (NestJS)
      ↓
  ┌───────────────────────────────┐
  │  Guards (JWT + Role)          │
  │  Interceptors (Response)      │
  │  Pipes (Validation)           │
  └───────────────────────────────┘
      ↓
  Controller (nhận/trả request)
      ↓
  Service (business logic)
      ↓
  Repository (database query)
      ↓
  Prisma → PostgreSQL

  Background Jobs (Cron)
      ↓
  Kiểm tra giá hàng ngày
      ↓
  Gửi email qua Nodemailer
```

---

## Database

Gồm 8 bảng chính:

- **businesses** — Cơ sở kinh doanh
- **users** — Người dùng (Owner/Staff)
- **ingredient_categories** — Danh mục nguyên liệu
- **ingredients** — Nguyên liệu
- **suppliers** — Nhà cung cấp
- **price_entries** — Lịch sử giá (bảng trung tâm)
- **price_alerts** — Cấu hình cảnh báo
- **notification_logs** — Lịch sử gửi thông báo

---

## Design Patterns áp dụng

- **Repository Pattern** — Tách logic database ra khỏi business logic
- **Service Layer Pattern** — Controller chỉ nhận/trả, Service xử lý logic
- **DTO Pattern** — Validate và type-safe dữ liệu đầu vào
- **Guard Pattern** — Bảo vệ route theo JWT và Role
- **Strategy Pattern** — Xác thực JWT Access Token và Refresh Token
- **Decorator Pattern** — `@CurrentUser()` lấy user hiện tại

---

## Cấu trúc thư mục Backend

```
src/
├── common/
│   ├── decorators/       # @CurrentUser, @Roles
│   ├── filters/          # HttpExceptionFilter
│   ├── guards/           # JwtGuard, RolesGuard
│   ├── interceptors/     # ResponseInterceptor
│   └── responses/        # ApiResponse
├── prisma/               # PrismaService, PrismaModule
├── auth/                 # Login, Register, JWT
├── users/                # Quản lý user
├── ingredients/          # Quản lý nguyên liệu
├── suppliers/            # Quản lý nhà cung cấp
├── price-entries/        # Nhập và xem lịch sử giá
├── price-alerts/         # Cấu hình cảnh báo
├── notifications/        # Gửi email, cron jobs
├── app.module.ts
└── main.ts
```

---

