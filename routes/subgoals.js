const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
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
 */ 
 router.delete('/:userId/goals/:goalId/subGoals/:subGoalId', (req, res) => {
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
 * @param {string} subGoalDescription
 * @param {int} subGoalPredictTime
 * @param {boolean} subGoalCompleted
 * @return {JSON} subGoal delete sucess info
 */ 
 router.put('/:userId/goals/:goalId/subGoals/:subGoalId', (req, res) => {
    let sql = `UPDATE subgoals SET subgoal_name = '${req.body.subGoalName}',subgoal_description = '${req.body.subGoalDescription}',subgoal_predict_time= ${req.body.subGoalPredictTime}, subgoal_completed = ${req.body.subGoalCompleted} WHERE goal_id = ${req.params.goalId} AND user_id = ${req.params.userId} AND subgoal_id = ${req.params.subGoalId}`;   
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result)
    })
})


module.exports = router;