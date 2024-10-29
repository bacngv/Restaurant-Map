# Sử dụng một image của Node.js để build ứng dụng
FROM node:18 AS build

# Tạo thư mục làm việc trong Docker
WORKDIR /app

# Copy các file cần thiết
COPY package*.json ./

# Cài đặt các dependency
RUN npm install

# Copy tất cả các file vào Docker
COPY . .

# Build ứng dụng
RUN npm run build

# Tạo một stage khác để tối ưu kích thước image
FROM nginx:alpine

# Copy file build từ stage trước sang thư mục phục vụ của nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
