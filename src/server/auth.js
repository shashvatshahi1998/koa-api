const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const knex = require('./db/connection');
const options = {};

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

passport.serializeUser((user, done) => { done(null, user.id); });

passport.deserializeUser((id, done) => {
  return knex('users').where({id}).first()
  .then((user) => { done(null, user); })
  .catch((err) => { done(err,null); });
});

passport.use(new LocalStrategy(options, (username, password, done) => {
  knex('users').where({ username }).first()
  .then((user) => {
    if (!user) return done(null, false);
    if (!comparePass(password, user.password)) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  })
  .catch((err) => { return done(err); });
}));

const GoogleStrategy = require('passport-google-auth').Strategy
passport.use(new GoogleStrategy({
    clientId: '1050533059800-vthv2gq5jd3t64d5h0ub11s1fkudel97.apps.googleusercontent.com',
    clientSecret: 'd9xVnTCLYPnJv6tByZZPZtyJ',
    callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/users/auth/google/callback'
  },
  async (token, tokenSecret, profile, done) => {
    const user = await User.findOne(profile.emails[0].value)
    if (user) {
      done(null, user)
    } else {
      const newUser = {
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        password: 'password-is-from-google',
        email: profile.emails[0].value
      }
      const createdUser = await User.create(newUser)
      if (createdUser) {
        done(null, createdUser)
      } else {
        done(null, false)
      }
    }
  }
))

const GithubStrategy = require('passport-github').Strategy
passport.use(new GithubStrategy({
    consumerKey: ' Iv1.b38239ef4340d7dc',
    consumerSecret: '2fa65048fc70d11219ab67ab877ea46aa12b52f0',
    callbackURL: 'http://localhost:' + (process.env.PORT || 3000) + '/users/auth/github/callback',
    includeEmail: true
  },
  async (token, tokenSecret, profile, done) => {
    // Retrieve user from database, if exists
    const user = await User.findOne(profile.emails[0].value)
    if (user) {
      done(null, user)
    } else {
      // If user not exist, create it
      const newUser = {
        firstName: profile.username,
        lastName: profile.username,
        password: 'password-is-from-github',
        email: profile.emails[0].value
      }
      const createdUser = await User.create(newUser)
      if (createdUser) {
        done(null, createdUser)
      } else {
        done(null, false)
      }
    }
    console.log(profile)
  }
))
