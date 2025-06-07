Leeme!! 

Hola instru, estos son los pasos para iniciar el proyecto 

1 npm install

agregar la base de datos en el archivo .env


DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=especialistasdb

ejecutar migraciones

node ace migration:run
node ace db:seed

inicar el servidor 

node ace serve --watch

pruebas en postman 
Obtener todos los activos
GET /especialistas

Obtener por ID
GET /especialistas/:id

Actualizar
PATCH /especialistas/:id


DELETE /especialistas/:id
(No borra, solo cambia activo = false)


