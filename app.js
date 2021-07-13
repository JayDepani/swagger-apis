require('dotenv').config();
require('./server/database/connection');

const express = require('express');
const router = require('./server/routers/router');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
// const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 8000;
const host = process.env.SITE_URL;
const options = {
    definition:{
        openapi:"3.0.0",
        info:{
            title:"User Registraion API",
            version:"1.0.0",
            description:"A Simple User Registraion Api",
            contact:{
                name:"Jay Depani",
                email:"jrdepani@gmail.com",
                phone:"6354145435"
            }
        },
        servers:[
            {
                url:`${host}`,
            }
        ],
        components: {
            securitySchemes: {
                jwt: {
                    type: "http",
                    scheme: "bearer",
                    in: "header",
                    bearerFormat: "JWT"
                },
            }
          }
          ,
          security: [{
            jwt: []
          }]
    },
    apis:["./server/routers/*.js"]
}

const specs = swaggerJsDoc(options);

app.use("/", swaggerUI.serve, swaggerUI.setup(specs));

app.use(express.json());
// app.use(morgan('dev'));
app.use(router);




app.listen(port,()=>{
    console.log(`Server listening on port no ${port}`);
})