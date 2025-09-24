FROM node:20.11.1-bullseye
WORKDIR /app

# 依存はビルド時に入れない（compose の command で入れる）
COPY . .

ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["npm", "run", "dev"]


