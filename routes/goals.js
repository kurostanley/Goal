const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const { ensureAuthenticated  }= require('../config/auth');

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
 router.post('/:userId/goals/',ensureAuthenticated, (req, res) => {
    let goal = {
        user_id: req.params.userId,
        goal_name: req.body.goalName , 
        goal_description: req.body.goalDescription,
        goal_completed: false
    };
    let sql = 'INSERT INTO goals SET ?';   // ?means the db.query second param
    let query = db.query(sql, goal, (err, result) => {
        if(err) throw err;
        let sql2 = `INSERT INTO goalOrderList SET goal_id = ${result.insertId}`
        let query2 = db.query(sql2, (err, result) => {});
        res.send(result);
    })
})


// Show all goal from user
/**
 * @METH GET
 * @param {num} ?userId
 * @return {array} goal list
 */ 
router.get('/:userId/goals/',ensureAuthenticated, (req, res) => {
    //
    let sql = `SELECT * FROM goals JOIN goalOrderList ON goals.goal_id = goalOrderList.goal_id WHERE user_id = ${req.params.userId}`;   
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
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
router.delete('/:userId/goals/:goalId', ensureAuthenticated, (req, res) => {
    let sql1 = `SELECT goal_OrderId FROM goalOrderList WHERE goal_id = ${req.params.goalId}`
    let query1 = db.query(sql1, (err, result) => {
        if(err) throw err;
        const deleteItemOrder = result[0].goal_OrderId;
        let theLastOrderId = 0;
        
        let sql2 = `DELETE FROM goals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}; `;   
        let query2 = db.query(sql2, (err, result) => {
            if(err) throw err;
        })
        // delete the order item
        let sql3 = `DELETE FROM goalOrderList WHERE goal_orderId = ${deleteItemOrder} `;
        let query3 = db.query(sql3, (err, result) => {
            if(err) throw err;
        })

        // Rearrange new order
        // 1 count 
        let sql4 = `SELECT COUNT(goal_orderId) FROM goalOrderList;`;
        let query4 = db.query(sql4,  (err, result) => {
            if(err) throw err;
            theLastOrderId = result[0]['COUNT(goal_orderId)'];

            for (let i = deleteItemOrder + 1; i <= theLastOrderId + 1; i++){
                // Find the Id of the goal_ording
                let sql5 = `SELECT * FROM goalOrderList WHERE goal_orderId = ${i}`;
                db.query(sql5, (err, result) => {
                    let currentGoalId = result[0].goal_id ;
                    let sql6 = `UPDATE goalOrderList SET goal_orderId = ${i - 1} WHERE goal_id = ${currentGoalId}`
                    db.query(sql6, (err, result) => {
                        console.log(currentGoalId);
                   })
                })
            }
        })

        res.send('hihi')
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
router.put('/:userId/goals/:goalId', ensureAuthenticated, (req, res) => {
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
router.get('/:userId/goals/:goalId', ensureAuthenticated,(req, res) => {
    let sql = `SELECT * FROM subgoals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
    let query = db.query(sql, (err, results) => {
        if(err) throw err;        
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
 router.post('/:userId/goals/:goalId', ensureAuthenticated,(req, res) => {
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