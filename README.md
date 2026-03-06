## Invitation Card Generator

Ứng dụng tạo và gửi thiệp mời cá nhân hoá theo mã khách mời.

## Stack hiện tại

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Lưu trữ dữ liệu: file JSON tại `data/invitations`

## Route chính

- `/`: trang nhập số thứ tự (guest)
- `/create`: trang tạo thiệp (host)
- `/i/:guestId`: trang xem thiệp cá nhân
  Bo

## Chạy local (dev)

Terminal 1:

```bash
npm run server:dev
```

Terminal 2:

```bash
npm run dev
```

## Cấu hình env

- Frontend gọi API cùng origin qua `/api` theo mặc định.
- Tùy chọn:
    - `VITE_API_BASE`: override URL API tuyệt đối ở frontend (production tách domain)
    - `VITE_API_PROXY_TARGET`: target cho Vite dev proxy `/api` (mặc định `http://localhost:4000`)

Ví dụ tạo file `.env`:

```bash
VITE_API_PROXY_TARGET=http://localhost:4000
```

## Build và chạy production

```bash
npm run build
npm run server
```

`server.js` sẽ:

- phục vụ API `/api/*`
- phục vụ static frontend từ `dist`
- fallback SPA cho route không phải `/api`

## Deploy nhanh

### Render

- Đã có sẵn file `render.yaml`.
- Tạo Web Service từ repo và dùng cấu hình mặc định trong file này.

### Railway / Fly / Heroku-like

- Có thể dùng `Procfile` đã cung cấp.
- Build command: `npm run build`
- Start command: `npm run start`

## Healthcheck

- Endpoint kiểm tra trạng thái server: `/api/health`
