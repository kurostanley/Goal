const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const mysql2 = require('mysql2/promise');
const { ensureAuthenticated  }= require('../config/auth');

const db = mysql.createConnection({
    host     : 'goaldb.cf3qwkt8ruuo.ap-northeast-1.rds.amazonaws.com',
    user     : 'admin',
    password : process.env.password,
    database : 'GoalDb'
});
const db2 = mysql2.createConnection({
    host     : 'goaldb.cf3qwkt8ruuo.ap-northeast-1.rds.amazonaws.com',
    user     : 'admin',
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
 router.post('/:userId/goals/',ensureAuthenticated, async (req, res) => {
    const con = await db2;
    try{
        let sql1 = `SELECT COUNT(goal_id) FROM goals WHERE user_id = ${req.params.userId};`;
        let query1 = await con.query(sql1);
        //console.log(query1[0][0]['COUNT(goal_id)'])
        const itemNum = query1[0][0]['COUNT(goal_id)'];
        let goal = {
            goal_order_id: itemNum + 1,
            user_id: req.params.userId,
            goal_name: req.body.goalName , 
            goal_description: req.body.goalDescription,
            goal_completed: false
        };
        let sql = 'INSERT INTO goals SET ?';   // ?means the db.query second param
        let query = await con.query(sql, goal);
        res.send([{msg:'Update success'}])
    }
    catch(e) {res.send(e);};
})


// Show all goal from user
/**
 * @METH GET
 * @param {num} ?userId
 * @return {array} goal list
 */ 
router.get('/:userId/goals/',ensureAuthenticated,async(req, res) => {
    const con = await db2;
    try{
        let sql = `SELECT * FROM goals WHERE goals.user_id = ${req.params.userId}`;   
        let query = await con.query(sql);
        res.send(query);
    }
    catch(e){
        res.send(e);
    }
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
        let sql1 = `SELECT goal_order_id FROM goals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`
        let query1 = await con.query(sql1);

        const deleteItemOrder = query1[0][0]['goal_order_id'];

        // Delete item form goals table
        let sql2 = `DELETE FROM goals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}; `;   
        let query2 = await con.query(sql2);

        // Rearrange new order
        // 1 count 
        let theLastOrderId = 0;
        let sql4 = `SELECT COUNT(goal_order_id) FROM goals WHERE user_id = ${req.params.userId};`;
        let query4 = await con.query(sql4)

        theLastOrderId = query4[0][0]['COUNT(goal_order_id)'];
        console.log(theLastOrderId);
        console.log(deleteItemOrder);

        for (let i = deleteItemOrder + 1; i <= theLastOrderId + 1; i++){
            
            // Find the Id of the goal_ording
            let sql5 = `SELECT * FROM goals WHERE goal_order_id = ${i} AND user_id = ${req.params.userId};`;
            let query5 = await con.query(sql5)
            let currentGoalId = query5[0][0].goal_id ;
            let sql6 = `UPDATE goals SET goal_order_id = ${i - 1} WHERE goal_id = ${currentGoalId} AND user_id = ${req.params.userId};`
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
 * @param {num} GoadTo
 * @return {JSON} goal update sucess info
 * First index = 1
 * not block not exsit goadId
 */ 
 router.put('/:userId/goals/:goalId/updateOrder', ensureAuthenticated, async (req, res) => {
    try{
        const con = await db2;
        let GoadTo = req.body.GoadTo;

        let sql1 = `SELECT goal_order_id FROM goals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`
        let query1 = await con.query(sql1);

        const currentItemOrder = query1[0][0]['goal_order_id'];

        if(currentItemOrder > GoadTo){
            for(let i = currentItemOrder - 1; i >= GoadTo; i--){
                console.log(i);
                let sql2 = `UPDATE goals SET goal_order_id = ${i+1} WHERE goal_order_id = ${i} AND user_id = ${req.params.userId}`;   
                let query = await con.query(sql2);
            }
        }
        else{
            for(let i = currentItemOrder + 1; i <= GoadTo; i++){
                let sql2 = `UPDATE goals SET goal_order_id = ${i-1} WHERE goal_order_id = ${i} AND user_id = ${req.params.userId}`;   
                let query = await con.query(sql2);
            }
        }

        let sql3 = `UPDATE goals SET goal_order_id = ${GoadTo}  WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId}`;   
        let query = await con.query(sql3);
        
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
        let sql1 = `SELECT COUNT(subgoal_id) FROM subgoals WHERE user_id = ${req.params.userId} AND goal_id = ${req.params.goalId};`;
        let query1 = await con.query(sql1);
        const itemNum = query1[0][0]['COUNT(subgoal_id)'];

        let subgoal = {
            user_id: req.params.userId,
            goal_id: req.params.goalId,
            subgoal_order_id: itemNum + 1,
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