const _ = require('lodash');
const path = require('path');
const md5 = require('md5');

const { AUN_EVIDENCE } = require('../models');
const AppConstant = require('../app.constants');

module.exports = {
  async readAll(req, res) {
    try {
      const { SuggestionId } = req.query;
      if (!SuggestionId) {
        return res.status(404).send({
          error: 'Require SuggestionId param'
        });
      }

      const evidences = await AUN_EVIDENCE.findAll({
        where: { SuggestionId: SuggestionId }
      });

      res.send(evidences);
    } catch (err) {
      res.status(500).send({
        error: 'Error in get evidences'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const evidence = await AUN_EVIDENCE.findByPk(id);

      if (!evidence) {
        return res.status(404).send({
          error: 'Not found the evidence has id ' + id
        });
      }

      res.send(evidence.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a evidence'
      });
    }
  },

  async create(req, res) {
    try {
      const { type, SuggestionId, link, name } = req.body;

      switch (type) {
        case AppConstant.ENUM.EVIDENCE_TYPE.LINK: {
          const evidence = await AUN_EVIDENCE.create({
            name,
            type,
            link,
            SuggestionId,
            code: 'TESTING'
          });

          return res.send(evidence.toJSON());
        }
        case AppConstant.ENUM.EVIDENCE_TYPE.FILE: {
          const file = _.get(req, 'files.file');

          if (!file) {
            return res.status(400).send({
              error: 'No files were uploaded.'
            });
          }

          const originName = _.get(file, 'name');
          const hashName =
            md5(originName + new Date().toDateString()) +
            path.extname(originName);
          const appPath = path.normalize(__dirname + '/..');
          const uploadPath = appPath + '/storage/' + hashName;
          const linkFile = '/storage/' + hashName;

          await file.mv(uploadPath);
          const evidence = await AUN_EVIDENCE.create({
            name,
            type,
            link: linkFile,
            SuggestionId,
            code: 'TESTING'
          });

          return res.send(evidence.toJSON());
        }
      }
    } catch (err) {
      console.log(err);
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(400).send({
            error: `Can't create a new evidence. Because existing!!!`
          });
        default:
          res.status(500).send({
            error: 'Error in create a evidence'
          });
      }
    }
  },

  // async update(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const { attributes } = req.body;

  //     const evidence = await AUN_EVIDENCE.findByPk(id);

  //     if (!evidence) {
  //       return res.status(404).send({
  //         error: 'Not found the evidence has id ' + id
  //       });
  //     }

  //     if (
  //       attributes.type === undefined &&
  //       attributes.content === undefined &&
  //       attributes.status === undefined
  //     ) {
  //       return res.status(406).send({
  //         error:
  //           'Not accepted. Required an attribute "type" or "content" or "status"'
  //       });
  //     }

  //     const type = attributes.type;
  //     const content = attributes.content;
  //     delete attributes.type;
  //     delete attributes.content;
  //     if (!_.isEmpty(attributes)) {
  //       return res.status(406).send({
  //         error:
  //           'Not accepted. Only updatable for "type", "content" and "status"'
  //       });
  //     }

  //     if (type) {
  //       await evidence.update({ type });
  //     }

  //     if (content) {
  //       await evidence.update({ content });
  //     }

  //     res.send(evidence.toJSON());
  //   } catch (err) {
  //     switch (err.name) {
  //       case 'SequelizeUniqueConstraintError':
  //         return res.status(400).send({
  //           error: `Can't update a evidence. Because existing!!!`
  //         });
  //       default:
  //         res.status(500).send({
  //           error: 'Error in update a evidence'
  //         });
  //     }
  //   }
  // },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const evidence = await AUN_EVIDENCE.findByPk(id);

      if (!evidence) {
        return res.status(404).send({
          error: 'Not found the evidence has id ' + id
        });
      }
      await evidence.destroy();

      res.send({});
    } catch (err) {
      res.status(500).send({
        error: 'Error in delete a evidence'
      });
    }
  }
};
