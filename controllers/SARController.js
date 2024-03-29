const _ = require('lodash');
const Op = require('sequelize').Op;
const logger = require('log4js').getLogger('error');

const { AUN_SAR, AUN_ASSIGNMENT, AUN_REVERSION } = require('../models');

renameKey = (obj, oldKey, newKey) => {
  if (_.has(obj, oldKey)) {
    obj[newKey] = _.clone(obj[oldKey]);
    delete obj[oldKey];
  }

  return obj;
};

module.exports = {
  async readAll(req, res) {
    try {
      const user = req.user;

      if (user.isAdmin) {
        let sars = [];

        sars = await AUN_SAR.findAll({});

        sars = _.chain(sars)
          .groupBy('isTemplate')
          .toJSON();

        sars = renameKey(sars, 'true', 'templates');
        sars = renameKey(sars, 'false', 'projects');

        const projects = _.get(sars, 'projects');
        if (!projects) {
          sars.projects = [];
        }
        for (let i = 0, iMax = +_.get(projects, 'length'); i < iMax; i++) {
          let project = projects[i];
          project = projects[i] = project.toJSON();
          const curReleaseVersion = await AUN_REVERSION.max('version', {
            where: {
              isRelease: true,
              SARId: project.id
            }
          });
          const curEditorVersion = await AUN_REVERSION.max('version', {
            where: {
              SARId: project.id
            }
          });

          project.curReleaseVersion = curReleaseVersion;
          project.curEditorVersion = curEditorVersion;
        }

        const templates = _.get(sars, 'templates');
        if (!templates) {
          sars.templates = [];
        }
        for (let i = 0, iMax = +_.get(templates, 'length'); i < iMax; i++) {
          let template = templates[i];
          template = templates[i] = template.toJSON();

          const reversion = await AUN_REVERSION.findOne({
            where: {
              SARId: template.id
            },
            order: [['version', 'ASC']]
          });

          if (reversion) {
            template.ReversionId = reversion.id;
          } else {
            template.ReversionId = null;
          }
        }

        res.send(sars);
      } else {
        const sars = await AUN_ASSIGNMENT.findAll({
          where: {
            UserEmail: user.email
          },
          include: [
            {
              model: AUN_SAR,
              as: 'SARs'
            }
          ]
        }).map(sar => {
          return sar.toJSON();
        });

        for (let i = 0, iMax = +_.get(sars, 'length'); i < iMax; i++) {
          const assignment = sars[i];
          const projects = _.get(assignment, 'SARs');
          for (let j = 0, jMax = +_.get(projects, 'length'); j < jMax; j++) {
            let project = projects[j];
            const curReleaseVersion = await AUN_REVERSION.max('version', {
              where: {
                isRelease: true,
                SARId: project.id
              }
            });
            const curEditorVersion = await AUN_REVERSION.max('version', {
              where: {
                SARId: project.id
              }
            });

            project.curReleaseVersion = curReleaseVersion;
            project.curEditorVersion = curEditorVersion;
          }
        }

        res.send(sars);
      }
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get SARs.'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user.isAdmin) {
        const assignment = await AUN_ASSIGNMENT.findOne({
          where: {
            UserEmail: user.email
          },
          include: [
            {
              model: AUN_SAR,
              as: 'SARs',
              attributes: [],
              where: {
                id: id
              }
            }
          ]
        });

        if (!assignment) {
          return res.status(403).send({
            error: 'You do not have access to this resource'
          });
        }
      }

      let sar = (await AUN_SAR.findByPk(id)).toJSON();

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the SAR has id ' + id
        });
      }

      if (sar.isTemplate) {
        const reversion = await AUN_REVERSION.findOne({
          where: {
            SARId: sar.id
          },
          order: [['version', 'ASC']]
        });

        if (reversion) {
          sar.ReversionId = reversion.id;
        } else {
          sar.ReversionId = null;
        }
      } else {
        const curReleaseVersion = await AUN_REVERSION.max('version', {
          where: {
            isRelease: true,
            SARId: sar.id
          }
        });
        const curEditorVersion = await AUN_REVERSION.max('version', {
          where: {
            SARId: sar.id
          }
        });

        sar.curReleaseVersion = curReleaseVersion;
        sar.curEditorVersion = curEditorVersion;
      }

      res.send(sar);
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in get a SAR'
      });
    }
  },

  async create(req, res) {
    try {
      const { name } = req.body;
      const sar = await AUN_SAR.create({ name });

      const reversion = await AUN_REVERSION.create({
        SARId: sar.id
      });

      let sarJSON = sar.toJSON();
      sarJSON.ReversionId = reversion.id;

      res.send(sarJSON);
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new SAR. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in create a SAR'
          });
      }
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { attributes } = req.body;

      const sar = await AUN_SAR.findByPk(id);

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the SAR has id ' + id
        });
      }

      if (attributes.name === undefined) {
        return res.status(406).send({
          error: 'Not accepted. Required an attribute "name"'
        });
      }

      const name = attributes.name;
      delete attributes.name;
      if (!_.isEmpty(attributes)) {
        return res.status(406).send({
          error: 'Not accepted. We accepted only an attribute "name"'
        });
      }

      await sar.update({ name });

      let sarJSON = sar.toJSON();

      if (sar.isTemplate) {
        const reversion = await AUN_REVERSION.findOne({
          where: {
            SARId: sar.id
          },
          order: [['version', 'ASC']]
        });

        if (reversion) {
          sarJSON.ReversionId = reversion.id;
        } else {
          sarJSON.ReversionId = null;
        }
      }

      res.send(sarJSON);
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't update a SAR. Because existing!!!`
          });
        default:
          logger.error(err);
          res.status(500).send({
            error: 'Error in update a SAR'
          });
      }
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const sar = await AUN_SAR.findByPk(id);

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the SAR has id ' + id
        });
      }
      await sar.destroy();

      res.send({});
    } catch (err) {
      logger.error(err);
      res.status(500).send({
        error: 'Error in delete a Sar'
      });
    }
  }
};
