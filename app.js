const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
// import { mongoose } from 'mongoose';
const dotenv = require('dotenv');
const { required } = require('nodemon/lib/config');

dotenv.config({path: './config.env'});
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then ( () => {
    console.log('db connection');
} );

const app = express();
const foodRouter = express.Router();
app.use(express.json());
app.use(morgan('dev'));

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'must have name'],
        trim: true,
        maxlength: 30
    },
    price: {
        type: Number,
        required: [true, 'must have price'],
    },
    size: {
        type: String,
        required: [true, 'must have type'],
        enum: {
            values: ['small', 'medium', 'big'],
            message: 'size must be small, medium or big'
        }
    },
    // description: {
    //     type: String,
    //     trim: true,
    //     minlength: 4
    //},
    soldQuantity: {
        type: Number,
        required: [true, 'must have sold quantity'],
        default: 0
    },
    rating: {
        type: Number,
        min: 0.5,
        max: 5
    }
});

const Food = mongoose.model('Food', foodSchema);

const getAllFoods = async (req,res) => {
    try{
        const foods = await Food.find();
        res.status(200).json({
            message: 'get all foods success',
            quantity: foods.length,
            food: foods
        })
    } catch (err) {
        res.status(404)
        .json({
            message: err
        })
    }
};

const createNewFood = async (req,res) => {
    try{
        const newFood = await Food.create(req.body);
        res.status(201).json({
            message: 'add success',
            food: newFood
        })
    } catch (err) {
        res.status(404)
        .json({
            message: err
        })
    }
};

const getOneFood = async (req,res) => {
    try{
        const id = req.params.id;
        const food = await Food.findById(id);
        res.status(200).json({
            message: 'get success',
            food
        });
    } catch (err) {
        res.status(404)
        .json({
            message: err
        })
    }
};

const updateFood = async (req,res) => {
    try{
        const id = req.params.id;
        const food = await Food.findByIdAndUpdate( id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            message: 'update success',
            food: food
        });
    } catch (err) {
        res.status(404)
        .json({
            message: err
        })
    }
};

const deleteFood = async (req,res) => {
    try{
        const id = req.params.id;
        await Food.findByIdAndDelete(id);
        res.status(204).json({
            message: 'delete success'
        });
    } catch (err) {
        res.status(404)
        .json({
            message: err
        })
    }
};

app.use ('/foods', foodRouter);
foodRouter
    .route('/')
    .get(getAllFoods)
    .post(createNewFood);

foodRouter
    .route('/:id')
    .get(getOneFood)
    .patch(updateFood)
    .delete(deleteFood)

const port = 3000;
app.listen(port, () => {
    console.log(`app running on port ${port}`);
});