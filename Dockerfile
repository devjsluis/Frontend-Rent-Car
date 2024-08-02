# imagen de node con tag 20.15.0-alpine
FROM node:20.15.0-alpine
# directorio de trabajo
WORKDIR /app
# copiar el archivo package.json
COPY package.json .
# instalar las dependencias
RUN npm install
# copiar el resto de los archivos
COPY . .
# Construir la aplicación
RUN npm run build
# Exponer el puerto 8080
EXPOSE 5173
# Iniciar la aplicación
CMD ["npm", "run", "dev"]