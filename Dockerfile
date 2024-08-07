# Imagen de node con tag 20.15.0-alpine
FROM node:20.15.0-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar el archivo package.json
COPY package.json .

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto 5173
EXPOSE 5173

# Iniciar la aplicación
CMD ["npm", "run", "dev"]