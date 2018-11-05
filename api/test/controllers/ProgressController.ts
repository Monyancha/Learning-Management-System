import {ICodeKataModel} from '../../src/models/units/CodeKataUnit';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import {Server} from '../../src/server';
import {FixtureLoader} from '../../fixtures/FixtureLoader';
import {JwtUtils} from '../../src/security/JwtUtils';
import {User} from '../../src/models/User';
import {Unit} from '../../src/models/units/Unit';
import {Lecture} from '../../src/models/Lecture';
import {Course} from '../../src/models/Course';
import {Progress} from '../../src/models/progress/Progress';
import * as moment from 'moment';

chai.use(chaiHttp);
const should = chai.should();
const app = new Server().app;
const BASE_URL = '/api/progress';
const fixtureLoader = new FixtureLoader();

describe('ProgressController', () => {
  // Before each test we reset the database
  beforeEach(async () => {
    await fixtureLoader.load();
  });

  describe(`POST ${BASE_URL}`, () => {
    it('should create progress for some progressable unit', async () => {
      const unit: ICodeKataModel = <ICodeKataModel>await Unit.findOne({progressable: true, __t: 'code-kata'});
      const lecture = await Lecture.findOne({units: { $in: [ unit._id ] }});
      const course = await Course.findOne({lectures: { $in: [ lecture._id ] }});
      const student = await User.findOne({_id: { $in: course.students}});

      const newProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let a = test;',
        done: true,
        type: 'codeKata'
      };

      const res = await chai.request(app)
        .post(BASE_URL)
        .set('Cookie', `token=${JwtUtils.generateToken(student)}`)
        .send(newProgress);

      res.status.should.be.equal(200);
      res.body.course.should.be.equal(newProgress.course);
      res.body.unit.should.be.equal(newProgress.unit);
      res.body.user.should.be.equal(newProgress.user);
      res.body.done.should.be.equal(newProgress.done);
      res.body._id.should.be.a('string');
    });

    it('should create progress for some progressable unit with a deadline', async () => {
      const unit: ICodeKataModel = <ICodeKataModel>await Unit.findOne({progressable: true, __t: 'code-kata'});
      const lecture = await Lecture.findOne({units: { $in: [ unit._id ] }});
      const course = await Course.findOne({lectures: { $in: [ lecture._id ] }});
      const student = await User.findOne({_id: { $in: course.students}});

      unit.deadline = moment().add(1, 'hour').format();
      await unit.save();

      const newProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let a = test',
        done: true,
        type: 'codeKata'
      };

      const res = await chai.request(app)
        .post(BASE_URL)
        .set('Cookie', `token=${JwtUtils.generateToken(student)}`)
        .send(newProgress);

      res.status.should.be.equal(200);
      res.body.course.should.be.equal(newProgress.course);
      res.body.unit.should.be.equal(newProgress.unit);
      res.body.user.should.be.equal(newProgress.user);
      res.body.done.should.be.equal(newProgress.done);
      res.body._id.should.be.a('string');
    });

    it('should fail creating progress for some progressable unit with a deadline', async () => {
      const unit: ICodeKataModel = <ICodeKataModel>await Unit.findOne({progressable: true, __t: 'code-kata'});
      const lecture = await Lecture.findOne({units: { $in: [ unit._id ] }});
      const course = await Course.findOne({lectures: { $in: [ lecture._id ] }});
      const student = await User.findOne({_id: { $in: course.students}});

      unit.deadline = moment().subtract(1, 'hour').format();
      await unit.save();

      const newProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let a = test',
        done: true,
        type: 'codeKata'
      };

      const res = await chai.request(app)
        .post(BASE_URL)
        .set('Cookie', `token=${JwtUtils.generateToken(student)}`)
        .send(newProgress)
        .catch(err => err.response);

      res.status.should.be.equal(400);
      res.body.name.should.be.equal('BadRequestError');
      res.body.message.should.be.equal('Past deadline, no further update possible');
    });
  });

  describe(`PUT ${BASE_URL}`, () => {
    it('should update progress for some progressable unit', async () => {
      const unit = await Unit.findOne({progressable: true, __t: 'code-kata'});
      const lecture = await Lecture.findOne({units: { $in: [ unit._id ] }});
      const course = await Course.findOne({lectures: { $in: [ lecture._id ] }});
      const student = await User.findOne({_id: { $in: course.students}});

      const oldProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let b = test',
        done: false,
        type: 'codeKata'
      };

      const progress = await Progress.create(oldProgress);

      const newProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let a = test',
        done: true,
        type: 'codeKata'
      };

      const res = await chai.request(app)
        .put(`${BASE_URL}/${progress._id.toString()}`)
        .set('Cookie', `token=${JwtUtils.generateToken(student)}`)
        .send(newProgress);

      res.status.should.be.equal(200);
      res.body.course.should.be.equal(newProgress.course);
      res.body.unit.should.be.equal(newProgress.unit);
      res.body.user.should.be.equal(newProgress.user);
      res.body.done.should.be.equal(newProgress.done);
      res.body._id.should.be.equal(progress._id.toString());
    });

    it('should update progress for some progressable unit with a deadline', async () => {
      const unit: ICodeKataModel = <ICodeKataModel>await Unit.findOne({progressable: true, __t: 'code-kata'});
      const lecture = await Lecture.findOne({units: { $in: [ unit._id ] }});
      const course = await Course.findOne({lectures: { $in: [ lecture._id ] }});
      const student = await User.findOne({_id: { $in: course.students}});

      unit.deadline = moment().add(1, 'hour').format();
      await unit.save();

      const oldProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let b = test',
        done: false,
        type: 'codeKata'
      };

      const progress = await Progress.create(oldProgress);

      const newProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let a = test',
        done: true,
        type: 'codeKata'
      };

      const res = await chai.request(app)
        .put(`${BASE_URL}/${progress._id.toString()}`)
        .set('Cookie', `token=${JwtUtils.generateToken(student)}`)
        .send(newProgress);

      res.status.should.be.equal(200);
      res.body.course.should.be.equal(newProgress.course);
      res.body.unit.should.be.equal(newProgress.unit);
      res.body.user.should.be.equal(newProgress.user);
      res.body.done.should.be.equal(newProgress.done);
      res.body._id.should.be.equal(progress._id.toString());
    });

    it('should fail updating progress for some progressable unit with a deadline', async () => {
      const unit: ICodeKataModel = <ICodeKataModel>await Unit.findOne({progressable: true, __t: 'code-kata'});
      const lecture = await Lecture.findOne({units: { $in: [ unit._id ] }});
      const course = await Course.findOne({lectures: { $in: [ lecture._id ] }});
      const student = await User.findOne({_id: { $in: course.students}});

      unit.deadline = moment().subtract(1, 'hour').format();
      await unit.save();

      const oldProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let b = test',
        done: false,
        type: 'codeKata'
      };

      const progress = await Progress.create(oldProgress);

      const newProgress = {
        course: course._id.toString(),
        unit: unit._id.toString(),
        user: student._id.toString(),
        code: 'let a = test',
        done: true,
        type: 'codeKata'
      };

      const res = await chai.request(app)
        .put(`${BASE_URL}/${progress._id.toString()}`)
        .set('Cookie', `token=${JwtUtils.generateToken(student)}`)
        .send(newProgress)
        .catch(err => err.response);

      res.status.should.be.equal(400);
      res.body.name.should.be.equal('BadRequestError');
      res.body.message.should.be.equal('Past deadline, no further update possible');
    });
  });
});
