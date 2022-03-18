'use strict';
const {send} = require('express/lib/response');
const {createForbiddenExclusivityError} = require('mocha/lib/errors');
// Connect to mongoDB
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const mongoURL = process.env.mongoURL;
mongoose.connect(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true});

// const issueSchema = new mongoose.Schema({});

const projectSchema = new mongoose.Schema({
  name: {type: String, required: true},
  issues: [
    {
      issue_title: {type: String, required: true},
      issue_text: {type: String, required: true},
      created_on: Date,
      updated_on: Date,
      created_by: {type: String, required: true},
      assigned_to: String,
      open: Boolean,
      status_text: String,
    },
  ],
});

// const Issue = mongoose.model('Issue', issueSchema);
const Project = mongoose.model('Project', projectSchema);

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get((req, res, next) => {
      let projectName = req.params.project;

      Project.findOne({name: projectName}, (err, project) => {
        if (err) return next(err);
        res.json(project.issues);
      });
    })

    .post((req, res, next) => {
      let projectName = req.params.project;
      findOrCreateProject(projectName, (err, project) => {
        if (err) return next(err);
        let newIssue = {
          issue_title: req.body.issue_title.trim(),
          issue_text: req.body.issue_text.trim(),
          created_on: new Date(),
          updated_on: new Date(),
          created_by: req.body.created_by.trim(),
          assigned_to: req.body.assigned_to.trim(),
          open: true,
          status_text: req.body.status_text.trim(),
        };
        if (
          newIssue.issue_title === '' ||
          newIssue.issue_text === '' ||
          newIssue.issue_created_by === ''
        )
          return res.json({error: 'required field(s) missing'});
        project.issues.push(newIssue);
        project.save((err, project) => {
          if (err) return next(err);
          res.json(project.issues[project.issues.length - 1]);
        });
      });
    })

    .put((req, res, next) => {
      const projectName = req.params.project;
      if (req.body._id === '') return res.json({error: 'missing _id'});
      try {
        ObjectId(req.body._id);
      } catch (error) {
        return res.json({error: 'invalid _id'});
      }
      const issueId = ObjectId(req.body._id);
      let updatedIssue = {};
      Object.keys(req.body).forEach((key) => {
        if (key === '_id') return;
        if (req.body[key] !== '') {
          updatedIssue[key] = req.body[key];
        }
      });
      console.log(updatedIssue);
      // Project.updateOne(
      //   {'issues._id': issueId},
      //   {
      //     $set: {
      //       'issues.$.issue_title': req.body.issue_title,
      //       'issues.$.issue_text': req.body.issue_text,
      //       'issues.$.updated_on': new Date(),
      //       'issues.$.created_by': req.body.created_by,
      //       'issues.$.assigned_to': req.body.assigned_to,
      //       'issues.$.open': req.body.open,
      //       'issues.$.status_text': req.body.status_text,
      //     },
      //   },
      //   (err, data) => {
      //     if (err) return res.json(err);
      //     if (data.matchedCount === 1) {
      //       if (data.modifiedCount === 0)
      //         return res.json({error: 'could not update', _id: issueId});
      //       return res.json({result: 'successfully updated', _id: issueId});
      //     }
      //   }
      // );
    })

    .delete((req, res, next) => {
      let projectName = req.params.project;
      const issueId = req.body._id;
      Project.updateOne(
        {},
        {
          $pull: {issues: {_id: ObjectId(issueId)}},
        },
        (err, data) => {
          if (err) return next(err);
          res.json(data);
        }
      );
    });
};

// Find project if it does not exist, create one
const findOrCreateProject = (projectName, done) => {
  Project.findOne({name: projectName}, (err, project) => {
    if (err) return done(err, null);
    if (project === null) {
      Project.create({name: projectName}, (err, project) => {
        if (err) return done(err, null);
        return done(null, project);
      });
    } else {
      return done(null, project);
    }
  });
};
