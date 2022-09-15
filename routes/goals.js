const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.env.password,
    database : 'GoalDb'
});


// Create New Goal 
/**
 * @METH POST
 * @param {num} ?userId
 * @param {string} goalName
 * @param {string} goalDescription
 * @return {JSON} goal creatsucess info
 */ 
 router.post('/:userId/goals/', (req, res) => {
    let goal = {
        user_id: req.params.userId,
        goal_name: req.body.goalName , 
        goal_description: req.body.goalDescription,
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
router.get('/:userId/goals/', (req, res) => {
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
router.delete('/:userId/goals/:goalId', (req, res) => {
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
 * @param {string} goalDescription
 * @param {boolean} goalCompleted
 * @return {JSON} goal update sucess info
 */ 
router.put('/:userId/goals/:goalId', (req, res) => {
    let sql = `UPDATE goals SET goal_name = '${req.body.goalName}', goal_description = '${req.body.goalDescription}',goal_completed = ${req.body.goalCompleted}  WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
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
router.get('/:userId/goals/:goalId', (req, res) => {
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
 * @param {string} subGoalDescription
 * @param {int} subGoalPredictTime
 * @return {JSON} subgoal creat sucess info
 */ 
 router.post('/:userId/goals/:goalId', (req, res) => {
    let subgoal = {
        user_id: req.params.userId,
        goal_id: req.params.goalId,
        subgoal_name: req.body.subGoalName, 
        subgoal_description: req.body.subGoalDescription,
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


module.exports = router;