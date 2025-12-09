# Используем Node.js runtime в качестве базового образа
FROM node:20

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все остальные файлы проекта
COPY . .

# Собираем Next.js приложение для production
RUN npm run build

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Запускаем Next.js приложение в production режиме
CMD ["npm", "start"]