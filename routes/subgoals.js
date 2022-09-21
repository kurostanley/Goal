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


// Delete a subGoal
/**
 * @METH DELETE
 * @param {num} ?userId
 * @param {num} ?goalId
 * @param {num} ?subGoalId
 * @return {JSON} goal delete sucess info
 * not pre
 */ 
 router.delete('/:userId/goals/:goalId/subGoals/:subGoalId',ensureAuthenticated, async(req, res) => {
    try{
        const con = await db2;
        let sql = `DELETE FROM subgoals WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId} AND subgoal_id = ${req.params.subGoalId}`;   
        let query = await con.query(sql)
        res.send([{msg: 'Delete subgoal success'}]);
    }
    catch(e){res.send(e);}
})

// Update the subgoal
/**
 * @METH PUT
 * @param {num} ?userId
 * @param {num} ?goalId
 * @param {string} subGoalName
 * @param {string} subGoalDescription
 * @param {int} subGoalPredictTime
 * @param {boolean} subGoalCompleted
 * @return {JSON} subGoal delete sucess info
 */ 
 router.put('/:userId/goals/:goalId/subGoals/:subGoalId', ensureAuthenticated, async(req, res) => {
    try{
        const con = await db2;
        let sql = `UPDATE subgoals SET subgoal_name = '${req.body.subGoalName}',subgoal_description = '${req.body.subGoalDescription}',subgoal_predict_time= ${req.body.subGoalPredictTime}, subgoal_completed = ${req.body.subGoalCompleted} WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId} AND subgoal_id = ${req.params.subGoalId}`;   
        let query = await con.query(sql)
            res.send([{msg: 'Update subgoal success'}])
    }
    catch(e){res.send(e);};
})


module.exports = router;