const _ = require('lodash');

const { AUN_SAR } = require('../models');

module.exports = {
  async readAll(req, res) {
    try {
      let pagination = null;
      if (req.query.pagination) {
        pagination = JSON.parse(req.query.pagination);
      } else {
        pagination = {
          descending: false,
          sortBy: null,
          rowsPerPage: 5,
          page: 1
        };
      }
      const { descending, sortBy, rowsPerPage, page } = pagination;

      const totalItems = await AUN_SAR.count();
      let totalPages = 1;

      let params = {};

      if (+rowsPerPage > 0) {
        params.limit = +rowsPerPage;
        params.offset = (+page - 1) * +rowsPerPage;
        totalPages = Math.ceil(totalItems / +rowsPerPage);
      }

      if (sortBy) {
        params.order = [[sortBy, descending ? 'DESC' : 'ASC']];
      }

      const SARs = await AUN_SAR.findAll(params);

      // if (!SARs) {
      //   return res.status(404).send({
      //     error: 'Not found any SARs'
      //   });
      // }

      res.send({
        SARs,
        totalItems,
        totalPages
      });
    } catch (err) {
      res.status(500).send({
        error: 'Error in get SARs.'
      });
    }
  },

  async readOne(req, res) {
    try {
      const { id } = req.params;

      const sar = await AUN_SAR.findByPk(id);

      if (!sar) {
        return res.status(404).send({
          error: 'Not found the SAR has id ' + id
        });
      }

      res.send(sar.toJSON());
    } catch (err) {
      res.status(500).send({
        error: 'Error in get a SAR'
      });
    }
  },

  async create(req, res) {
    try {
      const { name } = req.body;
      const newSar = await AUN_SAR.create({ name });

      res.send(newSar.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(500).send({
            error: `Can't create a new SAR. Because existing!!!`
          });
        default:
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

      res.send(sar.toJSON());
    } catch (err) {
      switch (err.name) {
        case 'SequelizeUniqueConstraintError':
          return res.status(500).send({
            error: `Can't update a SAR. Because existing!!!`
          });
        default:
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
      res.status(500).send({
        error: 'Error in delete a Sar'
      });
    }
  }
};
