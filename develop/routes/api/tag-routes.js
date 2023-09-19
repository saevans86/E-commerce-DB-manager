//alltag routes working
const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const findAllTags = await Tag.findAll({
      include: [{ model: Product }],
    })
    // console.log(findAllTags)
    res.status(200).json(findAllTags);
  } catch (err) {
    res.status(500).json(err);
  }
  // find all tags
  // be sure to include its associated Product data
});

router.get('/:id', async (req, res) => {
  try {
    const singleTag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    
    if (!singleTag) {
      res.status(404).json({ message: 'Not found.' });
      return;
    }
    res.status(200).json(singleTag);
  } catch (err) {
    res.status(500).json(err);
  }
  // find a single tag by its `id`
  // be sure to include its associated Product data
});

router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }
  // create a new tag
});

router.put('/:id', (req, res) => {
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        Tag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          const productTagIds = productTags.map(({ tag_name }) => tag_name);
          const newProductTags = req.body.tagIds
            .filter((tag_name) => !productTagIds.includes(tag_name))
            .map((tag_name) => {
              return {
                product_id: req.params.id,
                tag_name,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_name }) => !req.body.tagIds.includes(tag_name))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            Tag.destroy({ where: { id: productTagsToRemove } }),
            Tag.bulkCreate(newProductTags),
          ]);
        });
      }
      // update a tag's name by its `id` value
      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});
 

router.delete('/:id', async (req, res) => {
  try {
    const deleteID = await Tag.destroy({
      where: {id: req.params.id}
    })
    if (!deleteID) {
      res.status(404).json({ message: 'No product found with this ID' })
      return;
    }
    res.status(200).json(deleteID);
  } catch (err) {
    res.status(500).json(err);
  }

  // delete on tag by its `id` value
});

module.exports = router;
