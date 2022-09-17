const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql2 = require('mysql2/promise');
const { ensureAuthenticated  }= require('../config/auth');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.env.password,
    database : 'GoalDb'
});
const db2 = mysql2.createConnection({
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
        let sql2 = `INSERT INTO goalOrderList SET goal_id = ${result.insertId}, user_id = ${req.params.userId};`
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
    let sql = `SELECT * FROM goals JOIN goalOrderList ON goals.goal_id = goalOrderList.goal_id AND goals.user_id = goalOrderList.user_id WHERE goals.user_id = ${req.params.userId}`;   
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
router.delete('/:userId/goals/:goalId', ensureAuthenticated, async (req, res) => {
    const con = await db2;
    try{
        // Search the goal_OrderId of the deleted goalId
        let sql1 = `SELECT goal_OrderId FROM goalOrderList WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`
        let query1 = await con.query(sql1);

        const deleteItemOrder = query1[0][0].goal_OrderId;

        // Delete item form goals table
        let sql2 = `DELETE FROM goals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}; `;   
        let query2 = await con.query(sql2);

        // Delete item from goalOrderList table 
        let sql3 = `DELETE FROM goalOrderList WHERE goal_orderId = ${deleteItemOrder} AND user_id = ${req.params.userId};`;
        let query3 = await con.query(sql3);

        // Rearrange new order
        // 1 count 
        let theLastOrderId = 0;
        let sql4 = `SELECT COUNT(goal_orderId) FROM goalOrderList; AND user_id = ${req.params.userId};`;
        let query4 = await con.query(sql4)

        theLastOrderId = query4[0][0]['COUNT(goal_orderId)'];

        for (let i = deleteItemOrder + 1; i <= theLastOrderId + 1; i++){
            
            // Find the Id of the goal_ording
            let sql5 = `SELECT * FROM goalOrderList WHERE goal_orderId = ${i} AND user_id = ${req.params.userId};`;
            let query5 = await con.query(sql5)
            let currentGoalId = query5[0][0].goal_id ;
            let sql6 = `UPDATE goalOrderList SET goal_orderId = ${i - 1} WHERE goal_id = ${currentGoalId} AND user_id = ${req.params.userId};`
            await con.query(sql6)
        }     
        res.send([{msg: 'Delete Success'}]);
    }    
    catch(e){ res.send(e)};
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
 * not block not exsit goadId
 */ 
router.put('/:userId/goals/:goalId', ensureAuthenticated, async (req, res) => {
    try{
        const con = await db2;
        let sql = `UPDATE goals SET goal_name = '${req.body.goalName}', goal_description = '${req.body.goalDescription}',goal_completed = ${req.body.goalCompleted}  WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
        let query = await con.query(sql);
        res.send([{msg : "Upate Success"}])
    }
    catch(e){res.send(e)}
})


// Update the goal order
/**
 * @METH PUT
 * @param {num} ?userId
 * @param {num} ?goalId
 * @param {num} GoadFrom
 * @param {num} GoadTo
 * @return {JSON} goal update sucess info
 * First index = 1
 * not block not exsit goadId
 */ 
 router.put('/:userId/goals/:goalId/updateOrder', ensureAuthenticated, async (req, res) => {
    try{
        const con = await db2;
        let sql = `UPDATE goalOrderList SET goal_orderId = ${req.body.GoadTo}  WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
        let query = await con.query(sql);
        res.send([{msg : "Upate Success"}])
    }
    catch(e){res.send(e)}
})

// Get goal detail, subGoal
/**
 * @METH GET
 * @param {num} ?userId
 * @param {num} ?goalId
 * @return {array} subgoals
 */ 
router.get('/:userId/goals/:goalId', ensureAuthenticated,async (req, res) => {
    try{
        const con = await db2;
        let sql = `SELECT * FROM subgoals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
        let query = await con.query(sql)       
        res.send(query[0])
    }
    catch(e){res.send(e)}
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
 router.post('/:userId/goals/:goalId', ensureAuthenticated, async(req, res) => {
    try{
        const con = await db2;
        let subgoal = {
            user_id: req.params.userId,
            goal_id: req.params.goalId,
            subgoal_name: req.body.subGoalName, 
            subgoal_description: req.body.subGoalDescription,
            subgoal_predict_time: req.body.subGoalPredictTime,
            subgoal_completed: false
        };
        let sql = 'INSERT INTO subgoals SET ?';   // ?means the db.query second param
        let query = await con.query(sql, subgoal)
        res.send(query[0]);    
    }
    catch(e){res.send(e)}
})


module.exports = router;