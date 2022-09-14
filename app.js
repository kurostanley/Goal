const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv').config();


// Create connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.env.password,
    database : 'GoalDb'
});

// connection
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Mysql Connected');
})

const app = express();

app.use(express.json());



// Create User
/**
 * @METH POST
 * @param {string} userName
 * @param {string} userEmail
 * @param {string} userPassword
 * @return {JSON} user creatscess info
 */ 
app.post('/api/register', (req, res) => {
    let user = {
        user_name: req.body.userName,
        user_email: req.body.userEmail , 
        user_password: req.body.userPassword,
    };
    console.log(req.body);
    let sql = 'INSERT INTO users SET ?';   // ?means the db.query second param
    let query = db.query(sql, user, (err, result) => {
        if(err) throw err;
        console.log(result.insertId);
        res.send(result);
    })
})

//app.get('/api/logout')



// Create New Goal 
/**
 * @METH POST
 * @param {num} ?userId
 * @param {string} goalName
 * @return {JSON} goal creatsucess info
 */ 
app.post('/api/user/:userId/goals', (req, res) => {
    let goal = {
        user_id: req.params.userId,
        goal_name: req.body.goalName , 
        goal_completed: false
    };
    console.log(req.body);
    let sql = 'INSERT INTO goals SET ?';   // ?means the db.query second param
    let query = db.query(sql, goal, (err, result) => {
        if(err) throw err;
        console.log(result.insertId);
        res.send(result);
    })
})


// Show all goal from user
/**
 * @METH GET
 * @param {num} ?userId
 * @return {array} goal list
 */ 
app.get('/api/user/:userId/goals', (req, res) => {
    let sql = 'SELECT * FROM goals';   
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        console.log(results);
        res.send(results)
    })
})

// Delete a goal
/**
 * @METH DELETE
 * @param {num} ?userId
 * @param {num} ?goalId
 * @return {JSON} goal delete sucess info
 */ 
app.delete('/api/user/:userId/goals/:goalId', (req, res) => {
    let sql = `DELETE FROM goals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result)
    })
})

// Update the goal
/**
 * @METH PUT
 * @param {num} ?userId
 * @param {num} ?goalId
 * @param {string} goalName
 * @param {boolean} goalCompleted
 * @return {JSON} goal update sucess info
 */ 
app.put('/api/user/:userId/goals/:goalId', (req, res) => {
    let sql = `UPDATE goals SET goal_name = '${req.body.goalName}', goal_completed = ${req.body.goalCompleted}  WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result)
    })
})


// Get goal detail, subGoal
/**
 * @METH GET
 * @param {num} ?userId
 * @param {num} ?goalId
 * @return {array} subgoals
 */ 
app.get('/api/user/:userId/goals/:goalId', (req, res) => {
    let sql = `SELECT * FROM subgoals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        console.log(results);
        
        res.send(results)
    })
})

// Creat new subgoal
/**
 * @METH POST
 * @param {num} ?userId
 * @param {num} ?goalId
 * @param {string} subGoalName
 * @param {int} subGoalPredictTime
 * @return {JSON} subgoal creat sucess info
 */ 
 app.post('/api/user/:userId/goals/:goalId', (req, res) => {
    let subgoal = {
        user_id: req.params.userId,
        goal_id: req.params.goalId,
        subgoal_name: req.body.subGoalName, 
        subgoal_predict_time: req.body.subGoalPredictTime,
        subgoal_completed: false
    };
    console.log(req.body);
    let sql = 'INSERT INTO subgoals SET ?';   // ?means the db.query second param
    let query = db.query(sql, subgoal, (err, result) => {
        if(err) throw err;
        console.log(result.insertId);
        res.send(result);
    })
})

// Delete a subGoal
/**
 * @METH DELETE
 * @param {num} ?userId
 * @param {num} ?goalId
 * @param {num} ?subGoalId
 * @return {JSON} goal delete sucess info
 */ 
 app.delete('/api/user/:userId/goals/:goalId/subGoals/:subGoalId', (req, res) => {
    let sql = `DELETE FROM subgoals WHERE subgoal_name = ${req.params.goalId} AND user_id = ${req.params.userId} AND subgoal_id = ${req.params.subGoalId}`;   
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result)
    })
})

// Update the subgoal
/**
 * @METH PUT
 * @param {num} ?userId
 * @param {num} ?goalId
 * @param {string} subGoalName
 * @param {int} subGoalPredictTime
 * @param {boolean} subGoalCompleted
 * @return {JSON} subGoal delete sucess info
 */ 
 app.put('/api/user/:userId/goals/:goalId/subGoals/:subGoalId', (req, res) => {
    let sql = `UPDATE subgoals SET subgoal_name = '${req.body.subGoalName}',subgoal_predict_time= ${req.body.subGoalPredictTime}, subgoal_completed = ${req.body.subGoalCompleted} WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId} AND subgoal_id = ${req.params.subGoalId}`;   
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result)
    })
})



const PORT = process.env.port || 3000;

app.listen('3000', () => {
    console.log('server start on 3000')
})